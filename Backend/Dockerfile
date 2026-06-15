FROM node:22-bookworm-slim

WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends ffmpeg openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma

RUN npm ci

COPY tsconfig.json ./
COPY src ./src
COPY docker-entrypoint.sh ./docker-entrypoint.sh

RUN npm run build
RUN chmod +x ./docker-entrypoint.sh

ENV NODE_ENV=production
ENV PORT=8000

EXPOSE 8000

ENTRYPOINT ["./docker-entrypoint.sh"]
CMD ["npm", "start"]
