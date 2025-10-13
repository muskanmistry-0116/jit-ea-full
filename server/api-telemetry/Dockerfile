# --- Stage 1 --- Build stage
FROM node:22.19.0 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# --- Stage 2 --- Production stage
FROM node:22.19.0
WORKDIR /app
COPY --from=builder /app /app
EXPOSE 9002
CMD ["node", "./src/index.js"]
