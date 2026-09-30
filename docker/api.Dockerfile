# Contexto de build: raiz do repo (/var/www/colo-app). O tsc build (dist/) já
# aconteceu no host via deploy-colo antes deste build — a imagem só empacota.
FROM node:22-alpine
WORKDIR /app

COPY apps/api/package*.json ./
RUN npm ci

COPY apps/api/dist ./dist
COPY apps/api/prisma ./prisma
RUN npx prisma generate

# O logotipo dos emails vai embutido no corpo, por isso tem de estar dentro da
# imagem — a pasta public/ do web não existe aqui. Fica em /app/assets/img
# para bater certo com o caminho por omissão em src/lib/emailLogo.ts.
# Só o ficheiro, não a pasta inteira: a public/ tem MB de fotos que a API não
# usa para nada.
COPY apps/web/public/assets/img/logo-email.png ./assets/img/logo-email.png

# prisma/ e uploads/ são montados como bind mount a partir do host (dados
# persistentes) — ver compose.yaml. Não copiar dev.db/uploads reais para a imagem.

EXPOSE 3004
CMD ["node", "dist/src/server.js"]
