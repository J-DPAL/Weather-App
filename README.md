# 🌤️ Weather App - Full-Stack Technical Assessment

> **PM Accelerator AI Engineer Internship - Technical Assessment**  
> **Developed by:** Jean-David Pallares

A full-stack weather application with real-time data, 5-day forecasts, CRUD operations, and multi-format exports. Built with microservices architecture.

## ✨ Key Features

**Assessment Requirements Met:**
- ✅ Location search (city, coordinates, addresses) with validation
- ✅ Current weather + 5-day forecast display
- ✅ Full CRUD operations with PostgreSQL persistence
- ✅ Date range queries (up to 7 days)
- ✅ Multi-format export (JSON, CSV, Markdown, XML, PDF)
- ✅ Error handling (invalid locations, API failures)
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Interactive map integration (Leaflet)

**Additional Features:**
- Dark mode toggle
- Duplicate prevention
- Bulk delete operations
- Click-to-search from saved records


## 🛠️ Tech Stack

**Frontend:** React 19.1, Vite 7, Tailwind CSS v4, React Router v7, Leaflet  
**Backend:** FastAPI 0.115, Python 3.11+, SQLAlchemy (async), PostgreSQL 15  
**APIs:** OpenCage Geocoding, OpenWeather  
**DevOps:** Docker, Docker Compose, Nginx

## 🏗️ Architecture

Microservices architecture with 3 backend services:

- **Location Service** (Port 8001) - Geocoding with OpenCage API
- **Weather Service** (Port 8002) - Weather data from OpenWeather API  
- **Data Service** (Port 8003) - CRUD operations + PostgreSQL + Exports
- **Frontend** (Port 3000) - React SPA with Nginx
- **Database** - PostgreSQL (Port 5432) + pgAdmin (Port 5050)

Each backend service follows clean architecture (presentation → business → data → domain layers).

## 🏗️ Architecture

This application follows a **microservices architecture** with three backend services:

```
┌─────────────────┐
│   React SPA     │ (Port 3000)
│   (Frontend)    │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Nginx  │
    └────┬────┘
         │
    ┌────┴──────────────────────────────┐
    │                                   │
┌───▼──────────┐  ┌────────────────┐  ┌▼────────────────┐
│ Location     │  │ Weather        │  │ Data Service    │
│ Service      │  │ Service        │  │ (CRUD + Export) │
│ (Port 8001)  │  │ (Port 8002)    │  │ (Port 8003)     │
└──────┬───────┘  └────────┬───────┘  └─────┬───────────┘
       │                   │                 │
       │  OpenCage API     │  OpenWeather    │
       │  (Geocoding)      │  (Weather Data) │
       │                   │                 │
       └───────────────────┴─────────────────┘
                           │
                    ┌──────▼─────────┐
                    │  PostgreSQL    │
                    │  (Port 5432)   │
                    └────────────────┘
```

### Service Responsibilities

#### **Location Service** (`location-service`)
- Resolves location queries (city names, addresses, coordinates)
- Integrates with OpenCage Geocoding API
- Returns standardized location data (lat, lng, display_name, source)

#### **Weather Service** (`weather-service`)
- Fetches current weather and 5-day forecasts from OpenWeather API
- Aggregates 3-hour forecast blocks into daily summaries
- Simulates historical data using forecast window (max 7 days)
- Provides unified query endpoint combining location + weather

#### **Data Service** (`data-service`)
- PostgreSQL database persistence (3 tables: locations, weather_records, range_records)
- Full CRUD operations for all record types
- Multi-format export (JSON, CSV, Markdown, XML, PDF)
- Duplicate prevention logic
- Database connection health checks and retries

### Layered Architecture (Backend Services)

Each backend service follows clean architecture principles:

```
presentationlayer/
  └── controllers.py       # FastAPI route handlers
businesslogiclayer/
  └── service.py          # Business logic & orchestration
dataaccesslayer/
  └── repository.py       # Database operations
  └── models.py           # SQLAlchemy models
domainclientlayer/
  └── client.py           # External API clients
exceptions/
  └── custom_exceptions.py
  └── global_exception_handler.py
```

## � Quick Start

### Prerequisites
- Docker & Docker Compose
- API Keys: [OpenCage](https://opencagedata.com/api) + [OpenWeather](https://openweathermap.org/api) (both free tier)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/J-DPAL/weather-app.git
cd weather-app
```

2. **Configure environment variables**

Create `.env` files in each backend service directory using the templates:

```bash
# Copy templates
cp backend/data-service/.env.example backend/data-service/.env
cp backend/location-service/.env.example backend/location-service/.env
cp backend/weather-service/.env.example backend/weather-service/.env
```

Edit each `.env` file and add your API keys:
- `backend/location-service/.env` → Add your `OPENCAGE_API_KEY`
- `backend/weather-service/.env` → Add your `OPENWEATHER_API_KEY`

3. **Start the application**
```bash
docker-compose up --build
```

4. **Access the app**
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8001/docs, http://localhost:8002/docs, http://localhost:8003/docs
- **pgAdmin:** http://localhost:5050 (login: `admin@weatherapp.com` / `admin123`)

## 📖 Usage Guide

**Search Weather:**
1. Enter location (city name, address, or coordinates)
2. View current weather, 5-day forecast, and map
3. Click "Save Location" or "Save Weather" to persist

**Date Range Queries:**
1. After searching, select date range (max 7 days)
2. Click "Get Range" to view historical data
3. Click "Save Range" to store with statistics

**Manage Records:**
- Navigate to **Records** page
- Edit, delete, or export saved data
- Export formats: CSV, JSON, Markdown, XML, PDF

## �️ Project Structure

```
weather-app/
├── backend/
│   ├── data-service/         # CRUD + PostgreSQL + Exports
│   ├── location-service/     # Geocoding (OpenCage)
│   └── weather-service/      # Weather data (OpenWeather)
├── frontend/
│   └── src/
│       ├── api/              # Service clients
│       ├── components/       # React components
│       ├── hooks/            # Custom hooks
│       ├── pages/            # Home, Records, About
│       └── utils/            # Helpers
├── docker-compose.yml
└── README.md
```

## 🔐 Environment Variables

**Location Service** (`backend/location-service/.env`):
```env
OPENCAGE_API_KEY=your_opencage_key
DATA_SERVICE_URL=http://data-service:8003
SERVICE_PORT=8001
```

**Weather Service** (`backend/weather-service/.env`):
```env
OPENWEATHER_API_KEY=your_openweather_key
DATA_SERVICE_URL=http://data-service:8003
SERVICE_PORT=8002
```

**Data Service** (`backend/data-service/.env`):
```env
DATABASE_URL=postgresql+asyncpg://weather_user:weather_pass@db:5432/weather_db
SERVICE_PORT=8003
```


## � About

**Developer:** Jean-David Pallares | [GitHub](https://github.com/J-DPAL)

**PM Accelerator** is a premier product management training program that helps professionals transition into product management roles through hands-on experience, mentorship, and real-world projects. Learn more at [Product Manager Accelerator](https://www.linkedin.com/company/product-manager-accelerator/).

**License:** MIT - See [LICENSE](LICENSE) file for details.

---

**APIs Used:** [OpenCage Geocoding](https://opencagedata.com/) | [OpenWeather](https://openweathermap.org/)