# Stage 1: Build the React Application
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

# Build-time arguments for environment variables
ARG VITE_API_BASE_URL
ARG VITE_SOCKET_URL
ARG VITE_AI_BASE_URL

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
ENV VITE_AI_BASE_URL=$VITE_AI_BASE_URL

RUN npm run build

# Stage 2: Serve the compiled app with Nginx
FROM nginx:stable-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
