# 🔹 1. Build Angular app
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build -- --configuration=production

# 🔹 2. Serve with NGINX
FROM nginx:alpine

# Copiamos el build al directorio de Nginx
COPY --from=builder /app/dist/attendance-web /usr/share/nginx/html

# Permite que Angular maneje las rutas internas
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
