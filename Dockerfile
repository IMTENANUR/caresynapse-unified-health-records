# Use node image to build the app
FROM node:18 AS builder
WORKDIR /app
COPY . .
RUN npm install && npm run build

# Use nginx image to serve the build
FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html
