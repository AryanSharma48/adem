# 🌍 ADEM: AI-Driven Environmental Monitor

![ADEM Header](https://img.shields.io/badge/ADEM-Astana_Air_Quality-0088cc?style=for-the-badge&logo=react)
![Python](https://img.shields.io/badge/Python-3.10%2B-blue?style=for-the-badge&logo=python)
![PyTorch](https://img.shields.io/badge/PyTorch-CNN_LSTM-red?style=for-the-badge&logo=pytorch)
![React](https://img.shields.io/badge/React-Vite-61DAFB?style=for-the-badge&logo=react)

**ADEM** is an end-to-end, real-time air quality forecasting, monitoring, and alert system specifically designed for Astana, Kazakhstan. It provides citizens and authorities with accurate, AI-powered predictions to stay safe from air pollution.

---

## ✨ Key Features

- **📱 Modern & Responsive UI:** A beautifully designed frontend with a clean mobile-first approach, dark mode support, and seamless user experience.
- **🌐 Bilingual Support:** Native English (EN) and Kazakh (KZ) localization via a sleek language toggle pill.
- **🤖 Deep Learning Forecast:** A PyTorch-based CNN-LSTM model predicts PM2.5 levels for the next 24 hours based on historical data, traffic, and weather.
- **🚦 Live Traffic Analysis:** Uses YOLOv8 on traffic feeds to count vehicles per minute (VPM), correlating rush hour traffic with air quality.
- **🔔 Real-time Alerts:** Automatically triggers Telegram Bot alerts in both English and Kazakh when PM2.5 breaches WHO safe limits (> 50 µg/m³).
- **📊 Explainable AI (SHAP):** Live feature importance is calculated to show *why* pollution is high (e.g., 60% historical PM2.5, 30% heating, 10% traffic).

---

## 🚀 The AI Pipeline

ADEM leverages a unique hybrid pipeline of computer vision, live APIs, and deep learning:

1. **Traffic Extraction:** Pulls live camera feeds and runs YOLOv8 to estimate VPM.
2. **Environmental Context:** Fetches live temperature from Open-Meteo to calculate Heating Degree Days (HDD).
3. **Data Fusion:** Combines traffic, weather, and real-time PM2.5 readings.
4. **Prediction:** A sliding 24-hour window is fed into the PyTorch CNN-LSTM model.
5. **Insights:** SHAP values are extracted, data is logged to Supabase PostgreSQL, and the frontend dashboard is updated via FastAPI.

---

## 🧠 Machine Learning Model

The core forecasting model (`adem_forecast.pt`) is trained on a full year of ground-truth Astana data.

- **Architecture:** `Conv1D (3→16) → ReLU → LSTM (16→32) → Linear (32→24)`
- **Input Features:** 
  - `pm2_5`: Hourly concentration (µg/m³) from Open-Meteo Air Quality API
  - `heating_degree_days`: Proxy for indoor heating based on temperature (`max(18 - temp, 0)`)
  - `vehicles_per_minute`: Proxy for rush-hour traffic
- **Output:** 24 hourly PM2.5 predictions for the upcoming day.
- **Performance:** Validation Loss at epoch 50 was `0.010475`.

---

## 🛠️ Tech Stack

**Frontend:**
- React (Vite) + Tailwind CSS + Lucide Icons
- React-Leaflet (Maps) & Recharts (Data Visualization)
- i18next (EN/KZ Localization)

**Backend:**
- FastAPI & Uvicorn (REST API)
- SQLAlchemy & PostgreSQL (Supabase)
- APScheduler (Background inference jobs)

**Machine Learning & Vision:**
- PyTorch (CNN-LSTM Time-Series Forecasting)
- Ultralytics YOLOv8 (Real-time vehicle tracking)
- OpenCV, Scikit-Learn, SHAP

---

## ⚙️ Setup & Installation

### 1. Environment Variables
Navigate to the `backend/` directory and set up your environment:
```bash
cd backend
cp .env.example .env
```
Fill in `DATABASE_URL` (Supabase IPv4 connection), `AQICN_API_TOKEN`, `TELEGRAM_BOT_TOKEN`, and `TELEGRAM_CHAT_ID` (e.g. `@adem_astana`).

### 2. Backend (FastAPI)
```bash
python -m venv venv
# Windows: .\venv\Scripts\activate | Mac/Linux: source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
*Note: APScheduler automatically starts the 30-minute background ML inference pipeline on startup.*

### 3. Frontend (React/Vite)
```bash
cd frontend
npm install
npm run dev
```

---

## 🧪 Retraining the ML Model

To retrain the model with fresh data:

```bash
cd ml_training
python -m venv venv && .\venv\Scripts\activate
pip install -r requirements.txt

# 1. Fetch data from Open-Meteo APIs
python data_pipeline.py

# 2. Run training notebook
# notebooks/train_model.ipynb → generates adem_forecast.pt & scaler.pkl

# 3. Copy weights to backend
copy data\adem_forecast.pt ..\backend\app\ml\
copy data\scaler.pkl ..\backend\app\ml\
```

---

## 🏗️ Architecture Map

```text
adem/
├── backend/                    # FastAPI backend & inference engine
│   ├── app/
│   │   ├── api/                # REST endpoints
│   │   ├── ml/                 # PyTorch models & YOLOv8 scripts
│   │   ├── models/             # SQLAlchemy DB schemas
│   │   └── services/           # Background scheduling & data fusion
├── frontend/                   # Modern React Dashboard
│   ├── src/
│   │   ├── components/         # Reusable UI components & Layouts
│   │   ├── locales/            # i18n translation files (EN, KK)
│   │   └── pages/              # Main dashboard views
└── ml_training/                # Offline training pipeline & Notebooks
```
