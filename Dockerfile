# Stage 1: Build the React app with Vite
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Serve the built app with Nginx
FROM nginx:alpine

# Copy the build output to the default Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Optional: replace the default Nginx config (only if needed)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
