### 1. Build Angular
FROM node:20 AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build --prod

### 2. Serve with NGINX
FROM nginx:alpine

# Copiar el build generado por Angular
COPY --from=builder /app/dis/attendance-frontend-v2 /usr/share/nginx/html

# Copiar config de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
