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

# Apagar a pasta das dependências.
#
# `mv` em vez de `rm`: o rename é instantâneo e atómico, e a partir daí já ninguém
# escreve dentro da pasta que estamos a apagar. Apagar no sítio deixa a pasta
# visível durante a travessia inteira, e quem lá chegar no meio encontra-a a meio
# — foi assim que, com dois deployes em paralelo, o `rm` de um apanhou o `npm ci`
# do outro a repor ficheiros e morreu com `Directory not empty`, deixando a
# pasta pela metade e sem `.bin`.
apagar_node_modules() {
  local dir="$1" antigo="$1/node_modules.apagar.$$"
  rm -rf -- "$dir"/node_modules.apagar.* 2>/dev/null || true  # lixo de um deploy que morreu
  [ -e "$dir/node_modules" ] || return 0  # nunca chegou a instalar
  mv -- "$dir/node_modules" "$antigo" 2>/dev/null || return 1
  # A partir daqui o caminho já está livre, que é tudo o que o `npm ci` precisa.
  # O `rm` pode falhar com ENOTEMPTY e ser mentira: passar a pasta a `node_modules.apagar.*`
  # deixa um `npm ci` que estava a escrever nela a recriar ficheiros lá dentro. Não
  # é motivo para chumbar o deploy — sobra lixo, que o próximo deploy apaga logo no
  # topo desta função. É o que acontecia com a versão anterior, que desistia aqui e
  # deixava o site na versão anterior só porque um `rm` teimoso não cedeu.
  rm -rf -- "$antigo" || log "sobrou lixo em $antigo; apago-o no próximo deploy"
}

# Instalar as dependências de uma app, de raiz se for preciso.
#
# O `npm ci` faz o próprio `rm -rf node_modules` antes de repor, e esse `rm` falha
# com ENOTEMPTY se alguma coisa ainda estiver a usar a pasta. Quando isso acontece
# o `npm ci` morre a meio e deixa a pasta pela metade, sem o `.bin`; o `npx`
# seguinte não encontra o prisma local e vai buscá-lo à internet, a uma versão nova
# com comandos diferentes. O build falha com um erro que não aponta para a causa
# nenhuma e o deploy para num sítio que não tem nada de errado.
#
# Por isso apagamos a pasta nós e confirmamos os binários depois de instalar: uma
# segunda tentativa do mesmo plano não serve para nada, é preciso recomeçar.
instalar_deps() {
  local dir="$1" binarios="$2" tentativa b
  cd "$dir"
  for tentativa in 1 2 3; do
    if [ "$tentativa" != 1 ]; then
      log "a instalação em $dir falhou; a repetir de raiz (tentativa $tentativa/3)"
    fi
    if apagar_node_modules "$dir" && npm ci; then
      for b in $binarios; do
        if [ ! -x "node_modules/.bin/$b" ]; then
          erro "falta o binário $b em $dir"
          return 1
        fi
      done
      return 0
    fi
    [ "$tentativa" = 3 ] || sleep 5
  done
  erro "não consegui instalar as dependências em $dir"
  return 1
}

instalar_api() { instalar_deps "$RAIZ/apps/api" "tsc prisma"; }
instalar_web() { instalar_deps "$RAIZ/apps/web" "tsc vite"; }

# Só um deploy de cada vez.
#
# Dois deployes em paralelo partilham a mesma pasta de trabalho e não há nada que
# os separe: o `git pull` de um pode desfazer o commit do outro, e o `npm ci` de um
# escreve por cima do que o outro está a instalar. Em vez de detectar isso no
# `rm -rf` (onde a mensagem de erro não diz nada sobre a causa), serializa-se à
# entrada. Espera-se pelo lock em vez de desistir, para que o commit que disparou
# este deploy acabe sempre em produção.
#
# O descriptor 9 sobrevive ao `exec` do `git pull` abaixo, por isso a segunda
# passagem não volta a tentar trancar o que já está trancado por nós.
if [ "${COLO_DEPLOY_REEXEC:-0}" != "1" ]; then
  exec 9>/var/lock/deploy-colo.lock
  if ! flock -w 1800 9; then
    erro "outro deploy continua a correr depois de 30 min; a desistir"
    exit 1
  fi
fi

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
