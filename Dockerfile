FROM node:24-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
COPY bend/package.json ./bend/package.json
COPY frend/package.json ./frend/package.json
RUN npm ci --include=dev

COPY bend ./bend
COPY frend ./frend

ARG APP_ORIGIN
ARG STOREFRONT_URL
ARG BACKEND_ORIGIN=http://127.0.0.1:3001
RUN npm run build && chown -R node:node frend/.next

ENV NODE_ENV=production \
    PORT=3000 \
    BACKEND_PORT=3001 \
    BACKEND_HOST=127.0.0.1

USER node
EXPOSE 3000
CMD ["sh", "-c", "npm run db:migrate && exec npm start"]
