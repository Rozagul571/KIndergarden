# Frontend Build Stage
FROM node:18-alpine AS frontend-build

WORKDIR /app

# Copy package.json and install dependencies
COPY package.json package-lock.json* ./
RUN npm ci

# Copy the rest of the frontend code
COPY . .

# Build the Next.js app
RUN npm run build

# Backend Build Stage
FROM python:3.9-slim AS backend-build

WORKDIR /app/backend

# Copy backend requirements and install dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend code
COPY backend/ .

# Final Stage
FROM node:18-alpine

WORKDIR /app

# Copy built frontend from frontend-build stage
COPY --from=frontend-build /app/.next ./.next
COPY --from=frontend-build /app/public ./public
COPY --from=frontend-build /app/package.json ./package.json
COPY --from=frontend-build /app/node_modules ./node_modules

# Copy backend from backend-build stage
COPY --from=backend-build /app/backend /app/backend
COPY --from=backend-build /usr/local/lib/python3.9 /usr/local/lib/python3.9
COPY --from=backend-build /usr/local/bin/python /usr/local/bin/python
COPY --from=backend-build /usr/local/bin/uvicorn /usr/local/bin/uvicorn

# Copy startup script
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Expose ports
EXPOSE 3000 8000

# Start both frontend and backend
ENTRYPOINT ["/app/docker-entrypoint.sh"]
