# Deployment Guide - Render.com

This guide will help you deploy the Weather App to Render.com (free tier).

## Prerequisites

1. ✅ GitHub account
2. ✅ Render account (sign up at https://render.com)
3. ✅ OpenCage API key (https://opencagedata.com/api)
4. ✅ OpenWeather API key (https://openweathermap.org/api)

## Deployment Steps

### Option 1: One-Click Deploy (Recommended)

1. **Push your code to GitHub** (if not already done):
   ```bash
   git push origin main
   ```

2. **Go to Render Dashboard**:
   - Visit https://dashboard.render.com
   - Click **"New"** → **"Blueprint"**

3. **Connect Repository**:
   - Select your `weather-app` repository
   - Render will detect the `render.yaml` file

4. **Set Environment Variables**:
   - You'll be prompted to set these secrets:
     - `OPENCAGE_API_KEY`: Your OpenCage API key
     - `OPENWEATHER_API_KEY`: Your OpenWeather API key

5. **Deploy**:
   - Click **"Apply"**
   - Render will create all services automatically
   - Wait 10-15 minutes for initial deployment

6. **Get Your Live URL**:
   - Once deployed, find the `weather-frontend` service
   - Copy the URL (e.g., `https://weather-frontend-xxxx.onrender.com`)

---

### Option 2: Manual Deploy

If the blueprint doesn't work, deploy manually:

#### Step 1: Create PostgreSQL Database

1. Click **"New"** → **"PostgreSQL"**
2. Name: `weather-db`
3. Database: `weather_db`
4. User: `weather_user`
5. Region: Choose closest to you
6. Plan: **Free**
7. Click **"Create Database"**
8. Copy the **Internal Database URL** (starts with `postgresql://`)

#### Step 2: Deploy Data Service

1. Click **"New"** → **"Web Service"**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `weather-data-service`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/data-service/Dockerfile`
   - **Docker Context**: `./backend/data-service`
   - **Plan**: Free
4. Add environment variables:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1
   - `SERVICE_PORT`: `8003`
   - `OPENCAGE_API_KEY`: Your API key
   - `OPENWEATHER_API_KEY`: Your API key
5. Click **"Create Web Service"**
6. **Copy the service URL** (you'll need it for other services)

#### Step 3: Deploy Location Service

1. Click **"New"** → **"Web Service"**
2. Configure:
   - **Name**: `weather-location-service`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/location-service/Dockerfile`
   - **Docker Context**: `./backend/location-service`
   - **Plan**: Free
3. Add environment variables:
   - `OPENCAGE_API_KEY`: Your API key
   - `DATA_SERVICE_URL`: URL from Step 2 (e.g., `https://weather-data-service.onrender.com`)
   - `SERVICE_PORT`: `8001`
4. Click **"Create Web Service"**
5. **Copy the service URL**

#### Step 4: Deploy Weather Service

1. Click **"New"** → **"Web Service"**
2. Configure:
   - **Name**: `weather-weather-service`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./backend/weather-service/Dockerfile`
   - **Docker Context**: `./backend/weather-service`
   - **Plan**: Free
3. Add environment variables:
   - `OPENWEATHER_API_KEY`: Your API key
   - `DATA_SERVICE_URL`: URL from Step 2
   - `SERVICE_PORT`: `8002`
4. Click **"Create Web Service"**
5. **Copy the service URL**

#### Step 5: Deploy Frontend

1. Click **"New"** → **"Web Service"**
2. Configure:
   - **Name**: `weather-frontend`
   - **Runtime**: Docker
   - **Dockerfile Path**: `./frontend/Dockerfile`
   - **Docker Context**: `./frontend`
   - **Plan**: Free
3. Add environment variables (use `/api/v1/...` endpoints):
   - `VITE_DATA_SERVICE_URL`: `https://weather-data-service.onrender.com/api/v1/records`
   - `VITE_LOCATION_SERVICE_URL`: `https://weather-location-service.onrender.com/api/v1/location`
   - `VITE_WEATHER_SERVICE_URL`: `https://weather-weather-service.onrender.com/api/v1/weather`
4. Click **"Create Web Service"**
5. **Get your live URL!** 🎉

---

## Post-Deployment

### Verify Deployment

1. Visit your frontend URL
2. Test the weather search functionality
3. Check the Records page
4. Verify map interactions

### Monitor Services

- All services have health checks at `/health`
- Check logs in Render dashboard if something fails

### Known Issues & Solutions

**Issue**: "Service unavailable" on first visit
- **Solution**: Free tier services sleep after 15 minutes of inactivity. First request may take 30-60 seconds to wake up.

**Issue**: CORS errors
- **Solution**: Verify all backend services have CORS enabled (already configured in code)

**Issue**: Database connection failed
- **Solution**: Check that `DATABASE_URL` uses the **Internal Database URL** from Render, not external URL

---

## Free Tier Limitations

- Services sleep after 15 minutes of inactivity
- 750 hours/month of runtime per service (enough for demo)
- PostgreSQL limited to 1GB storage
- First request after sleep takes ~30-60 seconds

---

## Your Live URL

After deployment, your URL will be:
```
https://weather-frontend-xxxx.onrender.com
```

Use this URL for your PM Accelerator submission! 🚀

---

## Support

If you encounter issues:
1. Check Render dashboard logs
2. Verify all environment variables are set
3. Ensure API keys are valid
4. Check service health endpoints: `https://your-service.onrender.com/health`
