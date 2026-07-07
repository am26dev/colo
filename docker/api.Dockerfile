# Contexto de build: raiz do repo (/var/www/colo-app). O tsc build (dist/) já
# aconteceu no host via deploy-colo antes deste build — a imagem só empacota.
FROM node:22-alpine
WORKDIR /app

COPY apps/api/package*.json ./
RUN npm ci

COPY apps/api/dist ./dist
COPY apps/api/prisma ./prisma
RUN npx prisma generate

# prisma/ e uploads/ são montados como bind mount a partir do host (dados
# persistentes) — ver compose.yaml. Não copiar dev.db/uploads reais para a imagem.

EXPOSE 3004
CMD ["node", "dist/src/server.js"]
