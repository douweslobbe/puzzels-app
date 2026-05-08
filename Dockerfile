FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html /usr/share/nginx/html/
COPY puzzles/ /usr/share/nginx/html/puzzles/
EXPOSE 8080
