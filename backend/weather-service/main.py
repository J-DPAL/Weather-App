from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from presentationlayer.controllers import router as weather_router
from exceptions.global_exception_handler import register_exception_handlers

app = FastAPI(title="weather-service")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(weather_router, prefix="/api/v1/weather")
register_exception_handlers(app)

@app.get("/")
def root():
    return {"service": "weather-service", "status": "ready"}

@app.get("/health")
def health():
    return {"status": "healthy"}
