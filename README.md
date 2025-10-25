# 🌤️ WeatherApp - Full-Stack Weather Application

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![React](https://img.shields.io/badge/react-19.1-blue.svg)
![FastAPI](https://img.shields.io/badge/fastapi-0.115-green.svg)

A modern, full-stack weather application featuring real-time weather data, 5-day forecasts, historical range queries, and complete CRUD operations with data persistence. Built with microservices architecture using React, FastAPI, PostgreSQL, and Docker.

> **Note:** This project was developed as part of the **PM Accelerator AI Engineer Internship Technical Assessment**.

**Developed by:** [Jean-David Pallares](https://github.com/J-DPAL)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [API Documentation](#-api-documentation)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Development](#-development)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)
- [Acknowledgments](#-acknowledgments)

---

## ✨ Features

### Core Functionality
- 🔍 **Location Search** - Search by city name, address, or coordinates (lat, lng)
- 🌡️ **Current Weather** - Real-time weather data with detailed metrics
- 📅 **5-Day Forecast** - Daily aggregated weather forecasts
- 📊 **Date Range Queries** - Historical weather data for up to 7-day ranges
- 🗺️ **Interactive Maps** - Leaflet integration with location markers
- 📍 **Geolocation Support** - Use your current location automatically

### Data Management
- 💾 **Manual Save Operations** - Explicitly save locations, weather, and date ranges
- ✏️ **Full CRUD Operations** - Create, Read, Update, Delete for all record types
- 🗑️ **Bulk Delete** - Clear all records at once
- 🔄 **Duplicate Prevention** - Case-insensitive location deduplication & time-based weather deduplication (120s window)
- ❌ **Invalid Location Handling** - User-friendly 404 error messages

### Export & Analysis
- 📤 **Multi-Format Export** - JSON, CSV, Markdown, XML, PDF
- 📈 **Summary Statistics** - Computed averages, min/max temps for date ranges
- 🔗 **Click-to-Search** - Navigate from saved records back to live data

### User Experience
- 🌓 **Dark Mode** - Persistent theme toggle with localStorage
- 🌡️ **Temperature Units** - Switch between Celsius and Fahrenheit
- 📱 **Responsive Design** - Mobile-first with Tailwind CSS v4
- ⚡ **Fast Loading** - Optimized with Vite and React 19
- 🎨 **Modern UI** - Gradient backgrounds, glassmorphism, smooth transitions

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 19.1
- **Build Tool:** Vite 7.1
- **Styling:** Tailwind CSS v4 (with PostCSS)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios
- **Maps:** Leaflet & React-Leaflet
- **State Management:** React Hooks (useState, useEffect, useCallback)

### Backend
- **Framework:** FastAPI 0.115
- **Language:** Python 3.11+
- **Database:** PostgreSQL 15 (Alpine)
- **ORM:** SQLAlchemy 2.x (Async)
- **Migration:** Alembic (optional)
- **Validation:** Pydantic v2
- **PDF Generation:** ReportLab

### External APIs
- **Geocoding:** [OpenCage Geocoding API](https://opencagedata.com/)
- **Weather Data:** [OpenWeather API](https://openweathermap.org/)

### DevOps & Infrastructure
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx (for frontend production)
- **Database Admin:** pgAdmin 4
- **Environment Management:** python-dotenv

---

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

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Docker** (v20.10+) & **Docker Compose** (v2.0+)
- **Git** (for cloning the repository)
- **API Keys:**
  - [OpenCage API Key](https://opencagedata.com/api) (Free tier: 2,500 requests/day)
  - [OpenWeather API Key](https://openweathermap.org/api) (Free tier: 1,000 requests/day)

---

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/J-DPAL/weather-app.git
cd weather-app
```

### 2. Configure Environment Variables

Create `.env` files for each backend service:

#### **data-service/.env**
```bash
cp backend/data-service/.env.example backend/data-service/.env
```

Edit `backend/data-service/.env`:
```env
DATABASE_URL=postgresql+asyncpg://weather_user:weather_pass@db:5432/weather_db
SERVICE_PORT=8003
```

#### **location-service/.env**
```bash
cp backend/location-service/.env.example backend/location-service/.env
```

Edit `backend/location-service/.env`:
```env
OPENCAGE_API_KEY=your_opencage_api_key_here
DATA_SERVICE_URL=http://data-service:8003
SERVICE_PORT=8001
```

#### **weather-service/.env**
```bash
cp backend/weather-service/.env.example backend/weather-service/.env
```

Edit `backend/weather-service/.env`:
```env
OPENWEATHER_API_KEY=your_openweather_api_key_here
DATA_SERVICE_URL=http://data-service:8003
SERVICE_PORT=8002
```

### 3. Build and Run with Docker Compose

```bash
docker-compose up --build
```

This will start:
- PostgreSQL database (port 5432)
- pgAdmin (port 5050) - Database admin UI
- Data Service (port 8003)
- Location Service (port 8001)
- Weather Service (port 8002)
- Frontend (port 3000)

### 4. Access the Application

- **Frontend:** http://localhost:3000
- **pgAdmin:** http://localhost:5050 (login: `admin@weatherapp.com` / `admin123`)
- **API Documentation:**
  - Data Service: http://localhost:8003/docs
  - Location Service: http://localhost:8001/docs
  - Weather Service: http://localhost:8002/docs

---

## 📖 Usage

### Search for Weather

1. Enter a location (e.g., "New York", "Tokyo", "40.7128,-74.0060")
2. View current weather, 5-day forecast, and map
3. Click "Save Location" or "Save Weather" to persist data

### Date Range Queries

1. Search for a location
2. Select start and end dates (max 7-day range)
3. Click "Get Range" to view daily weather data
4. Click "Save Range" to store summary statistics

### Manage Saved Records

1. Navigate to **Records** page
2. View saved locations, weather snapshots, and date ranges
3. Click **Edit** to modify records
4. Click **Delete** to remove individual records
5. Click **Delete All** to clear all records

### Export Data

On the **Records** page, click export buttons:
- **CSV** - Tabular data for spreadsheets
- **JSON** - Structured data for APIs
- **Markdown** - Human-readable format
- **XML** - Hierarchical data exchange
- **PDF** - Printable summary report

### Dark Mode & Temperature Units

- Toggle dark mode with the 🌓 button (top-right)
- Switch between °C/°F in the temperature display

---

## 📚 API Documentation

### Location Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/location/resolve` | Resolve location query to coordinates |
| POST | `/api/v1/location/resolve-and-save` | Resolve and save to database |

### Weather Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/weather/current` | Get current weather (no save) |
| GET | `/api/v1/weather/current-and-store` | Get and save current weather |
| GET | `/api/v1/weather/forecast` | Get 5-day forecast (no save) |
| GET | `/api/v1/weather/forecast-and-store` | Get and save forecast |
| GET | `/api/v1/weather/historical` | Get simulated historical range |

### Data Service Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/records/location` | List all saved locations |
| POST | `/api/v1/records/location` | Create location record |
| PUT | `/api/v1/records/location/{id}` | Update location record |
| DELETE | `/api/v1/records/location/{id}` | Delete location record |
| GET | `/api/v1/records/weather` | List all weather records |
| POST | `/api/v1/records/weather` | Create weather record |
| PUT | `/api/v1/records/weather/{id}` | Update weather record |
| DELETE | `/api/v1/records/weather/{id}` | Delete weather record |
| GET | `/api/v1/records/range` | List all range records |
| POST | `/api/v1/records/range` | Create range record |
| PUT | `/api/v1/records/range/{id}` | Update range record |
| DELETE | `/api/v1/records/range/{id}` | Delete range record |
| DELETE | `/api/v1/records/all/{resource}` | Delete all records of type |
| GET | `/api/v1/records/export?format={format}` | Export data (json/csv/md/xml/pdf) |

For detailed request/response schemas, visit the `/docs` endpoint of each service.

---

## 📂 Project Structure

```
weather-app/
├── backend/
│   ├── data-service/              # CRUD + Export Service
│   │   ├── businesslogiclayer/
│   │   │   └── records_service.py
│   │   ├── dataaccesslayer/
│   │   │   ├── database.py        # SQLAlchemy setup
│   │   │   ├── models.py          # LocationRecord, WeatherRecord, RangeRecord
│   │   │   ├── repository.py      # CRUD functions
│   │   │   └── crud.py
│   │   ├── presentationlayer/
│   │   │   ├── controllers.py     # FastAPI routes
│   │   │   └── schemas.py         # Pydantic models
│   │   ├── exceptions/
│   │   │   ├── custom_exceptions.py
│   │   │   ├── global_exception_handler.py
│   │   │   └── http_error_info.py
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   │
│   ├── location-service/          # Geocoding Service
│   │   ├── businesslogiclayer/
│   │   │   └── location_service.py
│   │   ├── dataaccesslayer/
│   │   │   └── location_repository.py
│   │   ├── domainclientlayer/
│   │   │   └── geocode_client.py  # OpenCage API client
│   │   ├── presentationlayer/
│   │   │   └── controllers.py
│   │   ├── exceptions/
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   │
│   ├── weather-service/           # Weather Data Service
│   │   ├── businesslogiclayer/
│   │   │   └── weather_service.py # Aggregation logic
│   │   ├── domainclientlayer/
│   │   │   └── weather_client.py  # OpenWeather API client
│   │   ├── presentationlayer/
│   │   │   └── controllers.py
│   │   ├── exceptions/
│   │   ├── Dockerfile
│   │   ├── main.py
│   │   └── requirements.txt
│   │
│   └── requirements.txt           # Shared dependencies
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   ├── dataService.js     # Data service API client
│   │   │   ├── locationService.js # Location service client
│   │   │   └── weatherService.js  # Weather service client
│   │   ├── components/
│   │   │   ├── ForecastList.jsx   # 5-day forecast cards
│   │   │   ├── Loader.jsx         # Loading spinner
│   │   │   ├── MapView.jsx        # Leaflet map
│   │   │   ├── SearchBar.jsx      # Location search input
│   │   │   ├── Sidebar.jsx        # Saved locations sidebar
│   │   │   ├── ThemeToggle.jsx    # Dark mode toggle
│   │   │   └── WeatherCurrent.jsx # Current weather display
│   │   ├── hooks/
│   │   │   ├── useTheme.js        # Theme state management
│   │   │   └── useWeatherData.js  # Weather fetch logic
│   │   ├── pages/
│   │   │   ├── About.jsx          # About page
│   │   │   ├── Home.jsx           # Main weather page
│   │   │   └── Records.jsx        # Saved records management
│   │   ├── utils/
│   │   │   └── downloadFile.js    # File download helper
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── postcss.config.cjs
│
├── docker-compose.yml             # Multi-service orchestration
├── .gitignore
├── LICENSE
└── README.md
```

---

## 🔐 Environment Variables

### Data Service

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql+asyncpg://user:pass@db:5432/weather_db` |
| `SERVICE_PORT` | Port for data service | `8003` |

### Location Service

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENCAGE_API_KEY` | OpenCage API key | `your_api_key_here` |
| `DATA_SERVICE_URL` | Data service base URL | `http://data-service:8003` |
| `SERVICE_PORT` | Port for location service | `8001` |

### Weather Service

| Variable | Description | Example |
|----------|-------------|---------|
| `OPENWEATHER_API_KEY` | OpenWeather API key | `your_api_key_here` |
| `DATA_SERVICE_URL` | Data service base URL | `http://data-service:8003` |
| `SERVICE_PORT` | Port for weather service | `8002` |

---

## 💻 Development

### Run Backend Services Locally (without Docker)

#### 1. Create Python Virtual Environment

```bash
cd backend/data-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### 2. Run PostgreSQL Locally

```bash
docker run -d \
  -e POSTGRES_USER=weather_user \
  -e POSTGRES_PASSWORD=weather_pass \
  -e POSTGRES_DB=weather_db \
  -p 5432:5432 \
  postgres:15-alpine
```

#### 3. Start Services

```bash
# Data Service
cd backend/data-service
uvicorn main:app --reload --port 8003

# Location Service
cd backend/location-service
uvicorn main:app --reload --port 8001

# Weather Service
cd backend/weather-service
uvicorn main:app --reload --port 8002
```

### Run Frontend Locally

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:5173` (Vite default).

### Code Style

- **Python:** PEP 8 (use `black` or `ruff` for formatting)
- **JavaScript:** ESLint configuration included
- **Imports:** Organized by layer (presentation → business → data → domain)

---

## 🧪 Testing

### Manual Testing

1. **Location Search:** Test various query types (city names, coordinates, invalid locations)
2. **Weather Display:** Verify current weather and forecast accuracy
3. **Date Ranges:** Test edge cases (same day, 7-day max, invalid ranges)
4. **CRUD Operations:** Create, edit, delete records
5. **Export:** Download all formats and verify content
6. **Dark Mode:** Toggle and verify persistence
7. **Responsive Design:** Test on mobile, tablet, desktop

### API Testing with curl

```bash
# Test location resolution
curl -X POST http://localhost:8001/api/v1/location/resolve \
  -H "Content-Type: application/json" \
  -d '{"query": "New York"}'

# Test current weather
curl "http://localhost:8002/api/v1/weather/current?lat=40.7128&lng=-74.0060"

# Export data as JSON
curl "http://localhost:8003/api/v1/records/export?format=json"
```

---

## 🚢 Deployment

### Production Considerations

1. **Environment Variables:** Use secrets management (AWS Secrets Manager, HashiCorp Vault)
2. **Database:** Use managed PostgreSQL (AWS RDS, Google Cloud SQL, DigitalOcean)
3. **HTTPS:** Configure SSL/TLS with Let's Encrypt or cloud provider certificates
4. **CORS:** Restrict allowed origins to production domain
5. **Rate Limiting:** Implement rate limiting for API endpoints
6. **Logging:** Add structured logging with ELK stack or cloud logging services
7. **Monitoring:** Set up health checks and alerts (Prometheus, Grafana, Datadog)

### Deploy to Cloud Platforms

#### **Option 1: Docker Compose on VPS**
- Deploy to DigitalOcean Droplet, AWS EC2, or Google Compute Engine
- Use `docker-compose.prod.yml` with production configurations

#### **Option 2: Kubernetes**
- Create Kubernetes manifests for each service
- Use Helm charts for easier deployment
- Deploy to AWS EKS, Google GKE, or Azure AKS

#### **Option 3: Serverless**
- Frontend: Vercel, Netlify, or AWS Amplify
- Backend: AWS Lambda with API Gateway (requires refactoring to serverless framework)

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch:** `git checkout -b feature/your-feature-name`
3. **Commit your changes:** `git commit -m 'Add some feature'`
4. **Push to the branch:** `git push origin feature/your-feature-name`
5. **Open a Pull Request**

### Contribution Areas

- 🐛 Bug fixes
- ✨ New features (e.g., weather alerts, favorite locations)
- 📝 Documentation improvements
- 🧪 Test coverage
- 🎨 UI/UX enhancements
- ♿ Accessibility improvements

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[PM Accelerator](https://www.pmaccelerator.io/)** - For providing the technical assessment opportunity
- **[OpenCage](https://opencagedata.com/)** - Geocoding API provider
- **[OpenWeather](https://openweathermap.org/)** - Weather data API provider
- **[FastAPI](https://fastapi.tiangolo.com/)** - Modern Python web framework
- **[React](https://react.dev/)** - Frontend library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Leaflet](https://leafletjs.com/)** - Interactive maps library

---

## 📧 Contact

**Jean-David Pallares**
- GitHub: [@J-DPAL](https://github.com/J-DPAL)
- Project Link: [https://github.com/J-DPAL/weather-app](https://github.com/J-DPAL/weather-app)

