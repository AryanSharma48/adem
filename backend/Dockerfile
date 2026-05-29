FROM python:3.10-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libxcb1 \
    && rm -rf /var/lib/apt/lists/* \
    && pip install --no-cache-dir torch torchvision --index-url https://download.pytorch.org/whl/cpu \
    && pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
