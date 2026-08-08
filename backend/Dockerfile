FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache python3 make g++ linux-headers

COPY package.json package-lock.json* ./
RUN npm ci --silent
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --production --silent

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY prisma ./prisma
COPY docker-entrypoint.sh .
RUN chmod +x docker-entrypoint.sh

EXPOSE 3000
ENTRYPOINT ["./docker-entrypoint.sh"]
