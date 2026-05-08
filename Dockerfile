FROM nginx:alpine
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY index.html /usr/share/nginx/html/
COPY puzzles/ /usr/share/nginx/html/puzzles/
ENV PORT=80
EXPOSE 80
