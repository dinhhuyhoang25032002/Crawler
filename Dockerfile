FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM base AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
ENV NODE_ENV=production
COPY --from=builder /app/dist ./dist
COPY .env.production.local ./
EXPOSE 3001
CMD ["node","dist/main"] 