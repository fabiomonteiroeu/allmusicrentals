# syntax=docker/dockerfile:1
# Imagem do Strapi (CMS). Usada pelo serviço `cms` do docker-compose (dev) e base p/ produção (Fase 17).

# ---- deps: dependências nativas (sharp/vips) + node_modules ----
FROM node:22-alpine AS deps
WORKDIR /app
# libvips e toolchain para o sharp (processamento de imagem do Strapi).
RUN apk add --no-cache build-base gcc autoconf automake zlib-dev libpng-dev nasm bash vips-dev git
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila o admin do Strapi ----
FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache vips-dev
ENV NODE_ENV=production
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---- runner: imagem final ----
FROM node:22-alpine AS runner
WORKDIR /app
RUN apk add --no-cache vips
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
COPY --from=builder /app/database ./database
COPY --from=builder /app/public ./public
COPY --from=builder /app/favicon.png ./favicon.png
COPY --from=builder /app/tsconfig.json ./tsconfig.json
COPY --from=builder /app/dist ./dist

RUN addgroup -S strapi && adduser -S strapi -G strapi \
  && chown -R strapi:strapi /app
USER strapi

EXPOSE 1337
CMD ["npm", "run", "start"]
