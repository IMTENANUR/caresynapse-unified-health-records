# Use Node.js to build the app
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy files and install dependencies
COPY . .
RUN npm install
RUN npm run build

# Use NGINX to serve the built app
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port and start server
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
