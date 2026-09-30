#!/bin/bash
# Deploy de produção do Colo. É este ficheiro que corre na VPS — o
# /usr/local/bin/deploy-colo limita-se a delegar aqui, para o script de deploy
# viver versionado no repositório em vez de solto no sistema.
#
# Ordem pensada para que cada passo só dependa dos anteriores:
#   1. git pull            (o código que vamos construir)
#   2. backup da BD        (antes de qualquer migração — se a migração correr mal,
#                           a cópia é a única forma de voltar atrás)
#   3. build no host       (tsc e vite: o que os Dockerfiles apenas empacotam)
#   4. prisma migrate      (contra a BD montada a partir do host)
#   5. docker compose      (a partir daqui já servimos a versão nova)
#   6. health check        (se a API não responder, o deploy é considerado falhado)
set -euo pipefail

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

log() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }
erro() { printf '\n\033[1;31mFALHOU: %s\033[0m\n' "$*" >&2; }

trap 'erro "passo: ${STEP:-desconhecido}. Estado actual: $(git log --oneline -1 2>/dev/null || echo ?)"; erro "ver os logs: docker compose logs -f api"; exit 1' ERR

# `npm ci` apaga node_modules antes de repor. Se correr enquanto outro processo
# ainda tem a pasta aberta (um servidor de teste que ficou vivo de uma sessão
# anterior, por exemplo), a reposição fica a meio, sem o `.bin` — e o `npx`
# seguinte, não encontrando o prisma local, vai buscá-lo à internet e usar uma
# versão nova com comandos diferentes. O build falha com um erro que não aponta
# para a causa, e o deploy fica parado num sitio que não tem nada de errado.
# Por isso confirmamos os binários e, em falta, repetimos de scratch.
instalar_deps() {
  local dir="$1" binarios="$2"
  cd "$dir"
  npm ci
  local ok=0
  for b in $binarios; do
    [ -x "node_modules/.bin/$b" ] || ok=1
  done
  [ "$ok" -eq 0 ] && return 0
  log "node_modules ficou incompleto em $dir; a repetir de raiz"
  rm -rf node_modules
  npm ci
  for b in $binarios; do
    [ -x "node_modules/.bin/$b" ] || { erro "falta o binário $b em $dir depois da segunda tentativa"; return 1; }
  done
}

instalar_api() { instalar_deps "$RAIZ/apps/api" "tsc prisma"; }
instalar_web() { instalar_deps "$RAIZ/apps/web" "tsc vite"; }

# O `git pull` reescreve este mesmo ficheiro. O bash lê scripts por ordem e
# posiciona o cursor por byte: continuar a ler a versão antiga a seguir à nova
# dá comportamento imprevisível. Reexecutar a partir do zero com o código
# actualizado é mais barato do que diagnosticar isso em produção.
if [ "${COLO_DEPLOY_REEXEC:-0}" != "1" ]; then
  STEP="git pull"
  log "Actualizar o código"
  git pull --ff-only origin main
  export COLO_DEPLOY_REEXEC=1
  exec "$BASH_SOURCE" "$@"
fi

STEP="backup da base de dados"
log "Backup da base de dados (antes das migrações)"
python3 "$RAIZ/scripts/backup-colo-db.py"

STEP="build da API"
log "Dependências e build da API"
cd "$RAIZ/apps/api"
instalar_api
npx prisma generate
npm run build

STEP="migrate"
log "Migrações da base de dados"
# deploy apenas: `migrate dev`_resetaria_ a base de produção.
npx prisma migrate deploy

STEP="build da web"
log "Dependências e build da web"
cd "$RAIZ/apps/web"
instalar_web
npm run build

STEP="docker compose"
log "Reconstruir e reiniciar os containers"
cd "$RAIZ"
docker compose build
docker compose up -d

STEP="health check"
log "Verificar que a API responde"
ok=0
for tentativa in $(seq 1 30); do
  if docker exec colo_api node -e "
    fetch('http://127.0.0.1:' + (process.env.PORT || 3004) + '/api/health')
      .then(r => r.ok ? r.text() : Promise.reject(new Error('HTTP ' + r.status)))
      .then(t => { console.log('  /api/health ->', t); })
      .catch(e => { console.error('  /api/health falhou:', e.message); process.exit(1); });
  " 2>/dev/null; then
    ok=1
    break
  fi
  printf '  a tentar (%d/30)…\n' "$tentativa"
  sleep 2
done
[ "$ok" = 1 ] || erro "a API não respondeu a /api/health em 60s"

log "Deploy concluído: $(date -u '+%Y-%m-%d %H:%M:%S UTC')  ($(git log --oneline -1))"
