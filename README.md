# ADEM: AI-Driven Environmental Monitor

ADEM is an end-to-end, real-time air quality forecasting, monitoring, and alert system specifically designed for Astana, Kazakhstan.

## 🚀 The Pipeline

ADEM leverages a unique hybrid pipeline of computer vision, live API data, and deep learning:
1. **Live Traffic Analysis:** Pulls live traffic camera feeds (or videos) and runs **YOLOv8** to accurately count vehicles per minute (VPM).
2. **Environmental Context:** Fetches live temperature and weather data from the **Open-Meteo API** to calculate local heating degree days.
3. **Air Quality Baseline:** Fetches the true, live PM2.5 baseline from Kazhydromet stations via the **AQICN API**.
4. **Deep Learning Forecast:** Feeds the traffic, weather, and PM2.5 baseline into a PyTorch **CNN-LSTM** model to predict PM2.5 levels 24 hours into the future.
5. **Real-time Alerting:** If the predicted PM2.5 breaches the WHO safe limit (50), the system automatically triggers a **Telegram Bot** alert.
6. **Data Visualization:** Exposes all this data via a FastAPI backend to be consumed by a responsive, dark-mode **React/Tailwind** dashboard.

---

## 🛠️ Tech Stack

**Backend:**
* Python 3.10+
* FastAPI & Uvicorn
* SQLAlchemy & PostgreSQL (`psycopg2-binary`)
* APScheduler (Background Cron Jobs)

**Machine Learning & Computer Vision:**
* PyTorch (`torch`) - CNN-LSTM Time-Series Forecasting
* Ultralytics (`yolov8n.pt`) - Real-time Object Tracking
* OpenCV (`opencv-python`)
* Scikit-Learn & Pandas - Data Normalization (`scaler.pkl`)
* SHAP - Explainable AI (Feature Importance)

**Frontend:**
* React (Vite)
* Tailwind CSS (Strict Dark Mode)
* React-Leaflet (Mapping)
* Recharts (Data Visualization)

---

## ⚙️ Backend Setup & Installation

### 1. Database Setup
You will need a PostgreSQL database. The easiest way is using Docker:
```bash
docker run --name adem-postgres -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=adem_db -p 5432:5432 -d postgres:latest
```

### 2. Environment Variables
Navigate to the `backend/` directory and copy the environment template:
```bash
cd backend
cp .env.example .env
```
Fill in your `DATABASE_URL`, `AQICN_API_TOKEN`, and `TELEGRAM_BOT_TOKEN` in the `.env` file.

### 3. Python Environment & Dependencies
Create a virtual environment and install the required packages (including PyTorch and YOLOv8):
```bash
python -m venv venv
# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 4. Run the Server
Start the Uvicorn server. APScheduler will automatically begin the 30-minute background ML inference jobs on startup, and FastAPI will expose the REST endpoints.
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🏗️ Architecture (Monorepo)
```text
adem-system/
├── backend/                  # FastAPI Backend & ML Pipeline
│   ├── app/
│   │   ├── main.py           # Entry point & APScheduler
│   │   ├── api/              # REST Endpoints
│   │   ├── ml/               # YOLO script, PyTorch model, Scaler
│   │   └── services/         # Inference jobs & API integrations
├── frontend/                 # React UI Dashboard
└── ml_training/              # Offline Jupyter notebooks for model training
```
