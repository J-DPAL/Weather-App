"""
Data Service: owns persistence and implements CRUD + export.
Run:
  uvicorn main:app --reload --port 8003
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from contextlib import asynccontextmanager
import os
import time
import socket
from typing import Optional
from urllib.parse import urlparse

# Load environment variables (e.g., port, DB_URL)
load_dotenv()
PORT = int(os.getenv("SERVICE_PORT", 8003))
DATABASE_URL = os.getenv("DATABASE_URL", "")

def extract_host_and_port_from_database_url(db_url: str) -> Optional[tuple]:
    if not db_url:
        return None
    try:
        parsed = urlparse(db_url)
        if parsed.hostname:
            return (parsed.hostname, parsed.port or 5432)
    except Exception:
        pass
    try:
        after_at = db_url.split("@", 1)[1]
        host_port = after_at.split("/", 1)[0]
        host = host_port.split(":", 1)[0]
        port = int(host_port.split(":", 1)[1]) if ":" in host_port else 5432
        return (host, port)
    except Exception:
        return None

def wait_for_host_resolution(host: str, total_timeout: int = 180, interval: float = 1.0):
    """
    Wait until the host resolves via DNS. total_timeout is seconds to wait.
    """
    deadline = time.time() + total_timeout
    last_exc = None
    attempt = 0
    while time.time() < deadline:
        attempt += 1
        try:
            socket.getaddrinfo(host, None)
            print(f"[startup] DNS resolution success for '{host}' on attempt {attempt}.")
            return True
        except Exception as e:
            last_exc = e
            if attempt % 5 == 0:
                print(f"[startup] DNS still not resolved for '{host}', attempt {attempt} ...")
            time.sleep(interval)
    print(f"[startup] DNS resolution timed out after {total_timeout}s for host '{host}'. Last error: {last_exc}")
    return False

def wait_for_tcp_connect(host: str, port: int, total_timeout: int = 180, interval: float = 1.0):
    """
    Wait until a TCP connection to host:port succeeds.
    """
    deadline = time.time() + total_timeout
    attempt = 0
    last_exc = None
    while time.time() < deadline:
        attempt += 1
        try:
            with socket.create_connection((host, port), timeout=3):
                print(f"[startup] TCP connection to {host}:{port} succeeded on attempt {attempt}.")
                return True
        except Exception as e:
            last_exc = e
            if attempt % 5 == 0:
                print(f"[startup] TCP still not open for {host}:{port}, attempt {attempt} ...")
            time.sleep(interval)
    print(f"[startup] TCP connect timed out after {total_timeout}s for {host}:{port}. Last error: {last_exc}")
    return False

# --- Wait for DB host resolution & TCP port before importing modules ---
host_port = extract_host_and_port_from_database_url(DATABASE_URL)
if host_port:
    host, port = host_port
    print(f"[startup] Checking DB readiness for host '{host}' port {port} (timeouts: DNS=180s, TCP=180s)...")
    dns_ok = wait_for_host_resolution(host, total_timeout=180)
    tcp_ok = False
    if dns_ok:
        tcp_ok = wait_for_tcp_connect(host, port, total_timeout=180)
    if not (dns_ok and tcp_ok):
        # Log a warning and continue to attempt initialization anyway.
        # This prevents hard exits on flaky environments — the following DB init will raise if unreachable.
        print(f"[startup] WARNING: DB readiness checks not satisfied for {host}:{port}. Continuing and will attempt DB init (may fail).")
else:
    print("[startup] No DATABASE_URL or unable to parse host; attempting DB initialization without pre-checks.")

# Now import DB-dependent modules (safe to do after pre-checks)
from dataaccesslayer import repository
from presentationlayer.controllers import router as records_router
from exceptions.global_exception_handler import register_exception_handlers
from dataaccesslayer.database import engine, Base  # engine import now happens after checks

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event context manager — runs at startup and shutdown.
    """
    import sqlalchemy as sa
    print("Initializing database...")
    try:
        async with engine.begin() as conn:
            await conn.run_sync(lambda sync_conn: Base.metadata.create_all(sync_conn))
        print("Database initialized successfully.")
    except Exception as e:
        # If initialization fails, log it with detail and re-raise to stop the app.
        print(f"[startup] ERROR initializing DB: {e}")
        raise

    yield

    print("Shutting down data-service...")

app = FastAPI(title="data-service", lifespan=lifespan)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(records_router, prefix="/api/v1/records")
register_exception_handlers(app)

@app.get("/")
def root():
    return {"service": "data-service", "status": "ready"}

@app.get("/health")
def health():
    return {"status": "healthy"}
