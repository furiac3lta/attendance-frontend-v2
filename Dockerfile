# 1. Build Angular app
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

# 2. Serve with NGINX
FROM nginx:alpine

# Copiamos el build al directorio de NGINX
COPY --from=builder /app/dist/attendance-web /usr/share/nginx/html

# 🔥 Railway: usar puerto dinámico $PORT
ENV PORT=8080
EXPOSE 8080

# Reemplazamos default.conf para usar el puerto correcto
RUN sed -i "s/listen 80;/listen ${PORT};/" /etc/nginx/conf.d/default.conf

CMD ["nginx", "-g", "daemon off;"]
