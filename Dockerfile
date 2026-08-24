# Stage 1: Build the React Frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Setup the Node.js Express Backend
FROM node:20-alpine
WORKDIR /app
COPY backend/package*.json ./backend/
RUN npm ci --prefix backend --only=production

# Copy backend source files
COPY backend/ ./backend/

# Copy the compiled frontend assets from Stage 1 into the backend serving path
COPY --from=frontend-builder /app/frontend/dist ./frontend/dist

EXPOSE 5000
CMD ["npm", "start", "--prefix", "backend"]
