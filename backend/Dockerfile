FROM python:3.10-slim

WORKDIR /usr/src/app

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app/ ./app/
COPY yolov8n.pt ./

CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
