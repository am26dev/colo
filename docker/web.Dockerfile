# Contexto de build: raiz do repo (/var/www/colo-app). O vite build (dist/) já
# aconteceu no host via deploy-colo antes deste build — a imagem só empacota
# os estáticos, servidos por este nginx (isolado, nada a ver com o nginx do host).
FROM nginx:alpine
COPY apps/web/dist /usr/share/nginx/html
COPY docker/nginx-web.conf /etc/nginx/conf.d/default.conf
