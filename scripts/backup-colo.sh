#!/usr/bin/env bash
#
# Backup semanal do Colo: base de dados + ficheiros enviados pela dona.
#
# A BD vai pelo backup-colo-db.py, que usa a API `Connection.backup()` do
# SQLite e verifica a integridade do ficheiro resultante. Os uploads (fotos dos
# pratos, dos menus) são ficheiros normais que ninguém reescreve, por isso um
# `tar` chega — mas o tarball é verificado a seguir com `tar -tzf`, para não
# guardarmos cópias que não abrem.
#
# Não se usa `set -e` a torto e a direito: cada passo tem de|reportar o que fez, e um
# backup parcial com log é melhor do que um backup que não corre. A falha só
# chega ao cron no fim, no exit code.
set -uo pipefail

RAIZ="/var/www/colo-app"
DESTINO="/var/backups/colo"
UPLOADS="$RAIZ/apps/api/uploads"
MANTER=8   # 8 semanas de historico

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*"; }
erro() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] ERRO: $*" >&2; }

mkdir -p "$DESTINO" || { erro "não consegui criar $DESTINO"; exit 1; }
log "backup semanal a começar (destino: $DESTINO)"

# --------------------------------------------------------------------------
# 1. Base de dados. O script py faz backup online e integrity_check.
# --------------------------------------------------------------------------
if python3 "$RAIZ/scripts/backup-colo-db.py" "$RAIZ/apps/api/prisma/dev.db" "$DESTINO"; then
  log "base de dados ok"
  BD_OK=1
else
  erro "backup da base de dados falhou (ver mensagem acima)"
  BD_OK=0
fi

# --------------------------------------------------------------------------
# 2. Uploads. `-C uploads .` para o tar guardar caminhos relativos e o
#    restauro não depender de onde o script corra.
# --------------------------------------------------------------------------
UPLOADS_OK=1
if [ -d "$UPLOADS" ] && [ -n "$(ls -A "$UPLOADS" 2>/dev/null)" ]; then
  stamp=$(date '+%Y%m%d_%H%M%S')
  tarball="$DESTINO/uploads_$stamp.tar.gz"
  if tar -czf "$tarball.tmp" -C "$UPLOADS" . && mv "$tarball.tmp" "$tarball"; then
    # Verificar que o tarball abre e tem conteúdo. `tar -tzf` falha com
    # qualquer gzip ou header corrompido — é o mesmo formato que um
    # restauro vai usar.
    n=$(tar -tzf "$tarball" | grep -cv '/$' || true)
    if [ "$n" -gt 0 ]; then
      log "uploads ok: $n ficheiro(s), $(du -h "$tarball" | cut -f1)"
      ln -sf "$(basename "$tarball")" "$DESTINO/uploads_last.tar.gz"
    else
      erro "o tarball de uploads saiu vazio; descartado"
      rm -f "$tarball"
      UPLOADS_OK=0
    fi
  else
    erro "não consegui compactar os uploads"
    rm -f "$tarball.tmp"
    UPLOADS_OK=0
  fi
else
  log "sem uploads para copiar (diretório vazio ou inexistente)"
fi

# --------------------------------------------------------------------------
# 3. Limpar backups antigos. Só depois de os novos estarem verificados.
# --------------------------------------------------------------------------
log "a manter os $MANTER backups mais recentes de cada tipo"
ls -1t "$DESTINO"/colo_*.db 2>/dev/null | tail -n +$((MANTER + 1)) | while read -r velho; do
  rm -f "$velho" && log "  removida copia antiga $(basename "$velho")"
done
ls -1t "$DESTINO"/uploads_*.tar.gz 2>/dev/null | tail -n +$((MANTER + 1)) | while read -r velho; do
  rm -f "$velho" && log "  removido tarball antigo $(basename "$velho")"
done
rm -f "$DESTINO"/*.tmp 2>/dev/null

log "espaço em uso: $(du -sh "$DESTINO" | cut -f1)"

# O cron só precisa de saber se correu. Falha se a BD não saiu: sem BD não há
# pedidos nem semanas, mesmo que os uploads estejam intactos.
if [ "$BD_OK" -ne 1 ]; then
  erro "backup semanal terminou com falhas"
  exit 1
fi
if [ "$UPLOADS_OK" -ne 1 ]; then
  erro "BD ok, uploads falharam"
  exit 1
fi
log "backup semanal concluido"
