# ADEM: AI-Driven Environmental Monitor

ADEM is an end-to-end, real-time air quality forecasting, monitoring, and alert system specifically designed for Astana, Kazakhstan.

## 🚀 The Pipeline

ADEM leverages a unique hybrid pipeline of computer vision, live API data, and deep learning:

1. **Live Traffic Analysis:** Pulls live traffic camera feeds (or videos) and runs **YOLOv8** to accurately count vehicles per minute (VPM).
2. **Environmental Context:** Fetches live temperature from the **Open-Meteo Forecast API** to calculate heating degree days (HDD).
3. **Air Quality Baseline:** Fetches the live PM2.5 concentration (µg/m³) directly from the **Open-Meteo Air Quality API** — the same source the model was trained on, ensuring unit consistency.
4. **Deep Learning Forecast:** Feeds the last 24 hours of real hourly PM2.5, HDD, and traffic data into a PyTorch **CNN-LSTM** model to predict PM2.5 levels for the next 24 hours. The live current reading is always anchored as the final input step.
5. **Real-time Alerting:** If the predicted PM2.5 breaches the WHO safe limit (50 µg/m³), the system automatically triggers a **Telegram Bot** alert.
6. **Data Persistence:** Logs every inference run (actual PM2.5, predicted PM2.5, vehicle count, primary source) to a **PostgreSQL** database hosted on Supabase.
7. **Data Visualization:** Exposes all data via a **FastAPI** REST backend to be consumed by a responsive dashboard.

---

## 🧠 ML Model

The forecasting model (`adem_forecast.pt`) is a **CNN-LSTM hybrid** trained on 1 year of real Astana data:

- **Architecture:** `Conv1D(3→16) → ReLU → LSTM(16→32) → Linear(32→24)`
- **Input:** 24-hour sliding window of 3 features: `[pm2_5, heating_degree_days, vehicles_per_minute]`
- **Output:** 24 PM2.5 predictions (one per hour for the next 24 hours)
- **Training Data:** 8,784 hourly records from the Open-Meteo Air Quality & Archive APIs (May 2025 – May 2026)
- **Loss at epoch 50:** Train `0.000146` | Val `0.010475`

### Features
| Feature | Description | Source |
|---------|-------------|--------|
| `pm2_5` | Hourly PM2.5 concentration (µg/m³) | Open-Meteo Air Quality API |
| `heating_degree_days` | `max(18 - temp, 0)` — proxy for indoor heating | Open-Meteo Archive API |
| `vehicles_per_minute` | Synthetic rush-hour traffic proxy (spikes at 08:00, 18:00) | Simulated from YOLOv8 |

---

## 🛠️ Tech Stack

**Backend:**
* Python 3.10+
* FastAPI & Uvicorn
* SQLAlchemy & PostgreSQL (Supabase)
* APScheduler (30-minute background inference jobs)

**Machine Learning & Computer Vision:**
* PyTorch — CNN-LSTM time-series forecasting
* Ultralytics YOLOv8 — real-time vehicle tracking
* OpenCV — video frame processing
* Scikit-Learn — MinMaxScaler (`scaler.pkl`)

**Data Sources:**
* Open-Meteo Air Quality API — live & historical PM2.5 (µg/m³)
* Open-Meteo Forecast API — live temperature
* AQICN — fallback PM2.5 source (AQI index units)

**Frontend (Phase 4 — in progress):**
* React (Vite)
* Dark-mode dashboard
* Recharts — data visualization
* React-Leaflet — map overlay

---

## ⚙️ Backend Setup & Installation

### 1. Environment Variables
Navigate to the `backend/` directory and copy the environment template:
```bash
cd backend
cp .env.example .env
```
Fill in your `DATABASE_URL`, `AQICN_API_TOKEN`, and `TELEGRAM_BOT_TOKEN` in the `.env` file.

> **Database:** Use the Supabase **Session Pooler** connection string (IPv4 compatible) as `DATABASE_URL`.

### 2. Python Environment & Dependencies
```bash
python -m venv venv

# Windows:
.\venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

pip install -r requirements.txt
```

### 3. Run the Server
APScheduler automatically starts the 30-minute background ML inference pipeline on startup.
```bash
uvicorn app.main:app --reload --port 8000
```

---

## 🧪 ML Training Pipeline

To retrain the model from scratch:

```bash
cd ml_training
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt

# 1. Fetch 1 year of real Astana data from Open-Meteo APIs
python data_pipeline.py        # → data/astana_ground_truth.csv

# 2. Open and run all cells in VS Code
# notebooks/train_model.ipynb  → data/adem_forecast.pt + data/scaler.pkl

# 3. Copy trained files to backend
copy data\adem_forecast.pt ..\backend\app\ml\
copy data\scaler.pkl ..\backend\app\ml\
```

---

## 🏗️ Architecture (Monorepo)

```text
adem/
├── backend/                    # FastAPI backend & ML inference pipeline
│   ├── app/
│   │   ├── main.py             # Entry point & APScheduler (30-min jobs)
│   │   ├── api/                # REST endpoints
│   │   ├── ml/                 # YOLOv8 counter, model definition, weights
│   │   │   ├── model_defs.py   # CNNLSTMForecast architecture
│   │   │   ├── adem_forecast.pt
│   │   │   └── scaler.pkl
│   │   ├── models/             # SQLAlchemy DB models
│   │   └── services/           # inference_job.py — the main pipeline
│   └── requirements.txt
├── ml_training/                # Offline training pipeline
│   ├── data_pipeline.py        # Fetches 1yr data from Open-Meteo APIs
│   ├── notebooks/
│   │   └── train_model.ipynb   # CNN-LSTM training (50 epochs)
│   ├── data/                   # astana_ground_truth.csv, model weights
│   └── requirements.txt
└── frontend/                   # React dashboard (Phase 4 — in progress)
```
