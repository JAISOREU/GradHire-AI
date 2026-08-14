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
HEALTHCHECK --interval=30s --timeout=3s --start-period=120s --retries=3 \
  CMD node -e "const http=require('http');const req=http.request({hostname:'localhost',port:process.env.PORT||3000,path:'/api/v1/health',method:'GET'},(res)=>{process.exit(res.statusCode===200?0:1)});req.on('error',()=>process.exit(1));req.end()"

ENTRYPOINT ["./docker-entrypoint.sh"]
