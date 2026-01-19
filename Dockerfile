FROM node:24-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json ./

COPY prisma ./prisma
COPY prisma.config.ts ./prisma.config.ts

RUN npm ci

RUN npx prisma generate

COPY . .
RUN npm run build

FROM node:24-alpine
WORKDIR /app

COPY --from=builder /app/package.json /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

EXPOSE 4000
CMD ["node", "dist/app.js"]