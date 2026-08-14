FROM node:20 AS builder
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

FROM node:20
WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
