# Frontend multi-stage Dockerfile (Vite -> nginx)
# Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments for API URLs
ARG VITE_DATA_SERVICE_URL
ARG VITE_LOCATION_SERVICE_URL
ARG VITE_WEATHER_SERVICE_URL

# Set them as environment variables for the build
ENV VITE_DATA_SERVICE_URL=$VITE_DATA_SERVICE_URL
ENV VITE_LOCATION_SERVICE_URL=$VITE_LOCATION_SERVICE_URL
ENV VITE_WEATHER_SERVICE_URL=$VITE_WEATHER_SERVICE_URL

# copy package files and install
COPY package*.json ./
RUN npm ci --include=dev

# copy source and build
COPY . .
RUN npm run build

# Production stage - serve with nginx
FROM nginx:alpine
# Remove default nginx index (optional)
RUN rm -rf /usr/share/nginx/html/*

# Copy built static files from 'build' (Vite outputs to /dist by default)
COPY --from=build /app/dist /usr/share/nginx/html

# Optional: copy a custom nginx.conf if you want to set specific headers or routing
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
