# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build
RUN npx tsc server.ts --module ESNext --moduleResolution bundler --esModuleInterop --outDir .

# Production stage
FROM node:20-alpine

WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server.js ./
COPY --from=builder /app/package*.json ./

RUN npm ci --omit=dev

ENV PORT=6100
EXPOSE 6100

CMD ["node", "server.js"]
