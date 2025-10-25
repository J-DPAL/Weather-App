# Data Service - Dockerfile (Python / FastAPI)
FROM python:3.11-slim

# set workdir
WORKDIR /app

# install minimal system deps required to build Python wheels if needed
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential gcc \
    && rm -rf /var/lib/apt/lists/*

# copy requirements first for better caching
COPY requirements.txt .

# install python deps
RUN pip install --no-cache-dir -r requirements.txt

# copy the service source
COPY . .

# create a location for sqlite DB (will be mounted by docker-compose)
# ensure the directory exists and permissions are okay
RUN mkdir -p /app/data

# expose the service port (matches uvicorn command)
EXPOSE 8003

# Use env var SERVICE_PORT if you want override; default to 8003
ENV SERVICE_PORT=8003
ENV PYTHONUNBUFFERED=1

# run the FastAPI server with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8003"]
