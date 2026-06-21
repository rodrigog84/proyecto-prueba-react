FROM node:22-alpine

WORKDIR /app

# Copiamos solo los manifiestos primero para aprovechar el cache de capas de Docker.
# Si el código cambia pero package.json no, Docker reutiliza la capa de npm ci.
COPY package*.json ./

# npm ci instala TODO (incluyendo devDependencies como prisma CLI que necesitamos
# para generar el cliente y correr migraciones)
RUN npm ci

# Copiamos el schema y generamos el Prisma Client dentro de la imagen
COPY prisma ./prisma
RUN npx prisma generate

# Copiamos el código fuente
COPY src ./src

EXPOSE 3001

# Las migraciones se corren en docker-compose antes de arrancar (ver command:)
CMD ["node", "src/index.js"]
