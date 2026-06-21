# ── Stage 1: BUILD ────────────────────────────────────────────────────────────
# Node compila la app de Vite y genera los archivos estáticos en /app/dist
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# VITE_API_URL vacío = URLs relativas (/api/...).
# Nginx recibe la petición y la proxifica al backend internamente.
# Sin esto, el JS compilado intentaría llamar a localhost:3001 desde el navegador.
ARG VITE_API_URL=""
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# ── Stage 2: SERVE ────────────────────────────────────────────────────────────
# Nginx sirve solo los archivos estáticos compilados — imagen final muy liviana (~25 MB)
FROM nginx:1.27-alpine

# Copia el resultado del build
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia nuestra configuración personalizada de Nginx (reverse proxy + SPA fallback)
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
