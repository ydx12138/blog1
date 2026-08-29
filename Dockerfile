# 构建阶段：使用锁文件安装依赖并生成 Vite 静态产物。
FROM node:22-alpine AS builder

WORKDIR /app

# 先安装依赖以利用 Docker 缓存；npm ci 会严格使用 package-lock.json。
COPY package.json package-lock.json ./
RUN npm ci

# 复制源码并生成生产构建产物 dist。
COPY . ./
RUN npm run build

# 运行阶段：仅保留 Nginx 与已构建的静态文件。
FROM nginx:1.27-alpine

# SPA 静态资源目录及反向代理配置。
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
