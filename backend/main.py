# main.py
# Author: Jean-David Pallares

from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

app = FastAPI()

# Allow frontend requests
origins = [
    "http://localhost:5173",  # React dev server
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # URLs allowed to make requests
    allow_credentials=True,
    allow_methods=["*"],        # GET, POST, PUT, DELETE, etc.
    allow_headers=["*"],        # Allow all headers
)


@app.get("/")
def read_root():
    return {"message": "Backend is running!"}
