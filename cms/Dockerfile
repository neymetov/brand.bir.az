# Production-образ CMS. Собран по образцу соседнего проекта (birbank private):
# multi-stage, непривилегированный пользователь, dumb-init как init-процесс.
#
# Node 22: Strapi 5 поддерживает 20–22, а 20.x уже объявляют устаревшей.
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# Админка Strapi собирается заранее: в рантайме на это нет ни времени, ни
# прав на запись.
RUN npm run build

FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat dumb-init
WORKDIR /app
ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 strapi

COPY --from=builder --chown=strapi:nodejs /app/dist ./dist
COPY --from=builder --chown=strapi:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=strapi:nodejs /app/config ./config
COPY --from=builder --chown=strapi:nodejs /app/src ./src
COPY --from=builder --chown=strapi:nodejs /app/public ./public
COPY --from=builder --chown=strapi:nodejs /app/package.json ./
# tsconfig.json обязателен в рантайме: без него Strapi не понимает, что проект
# на TypeScript, и ищет конфиги как .js рядом с исходниками вместо собранных
# в dist/ — приложение падает на «db.config.connection is undefined».
COPY --from=builder --chown=strapi:nodejs /app/tsconfig.json ./
# Каталог миграций Strapi создаёт и пишет сам, поэтому он должен
# существовать и принадлежать непривилегированному пользователю.
COPY --from=builder --chown=strapi:nodejs /app/database ./database

# Каталог загрузок в образ не копируется (он в .dockerignore — там контент,
# а не код), но существовать обязан: без него Strapi не стартует.
#
# ВАЖНО: диск контейнера эфемерный. Для реального стенда загрузки должны
# уходить в S3 (@strapi/provider-upload-aws-s3) или на примонтированный том,
# иначе файлы пропадут при первом же перезапуске.
RUN mkdir -p /app/public/uploads && chown -R strapi:nodejs /app/public

USER strapi
EXPOSE 1337

# dumb-init, чтобы сигналы доходили до Node и контейнер останавливался сразу,
# а не по таймауту.
ENTRYPOINT ["dumb-init", "--"]
CMD ["node_modules/.bin/strapi", "start"]
