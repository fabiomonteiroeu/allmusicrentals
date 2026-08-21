# syntax=docker/dockerfile:1

# ---- deps: instala dependências ----
FROM node:22-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json ./
RUN npm ci

# ---- builder: compila o Next (saída standalone) ----
FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1

# Variáveis públicas do build (Fase 17). NEXT_PUBLIC_* é inlinado no bundle do cliente em BUILD
# TIME, não em runtime — por isso precisa chegar como build-arg do CI/CD (nunca hardcoded aqui,
# porque o hostname de produção ainda não existe em DNS no momento em que este Dockerfile é
# escrito). Segredos de servidor (STRAPI_API_TOKEN, REVALIDATE_SECRET etc.) NÃO entram aqui —
# esses continuam só em variável de ambiente de runtime do container (EasyPanel), nunca em ARG.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRAPI_MEDIA_URL
ENV NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL}
ENV NEXT_PUBLIC_STRAPI_MEDIA_URL=${NEXT_PUBLIC_STRAPI_MEDIA_URL}

RUN npm run build

# ---- runner: imagem final enxuta ----
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
