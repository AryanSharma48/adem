# ADEM: AI-Driven Environmental Monitor - Vibe Coding Context

## 1. Project Overview
**Name:** ADEM  
**Objective:** Build an end-to-end, real-time air quality forecasting, monitoring, and alert system for Astana, Kazakhstan. 
**Pitch:** ADEM pulls live API data, runs real-time computer vision (YOLOv8) on traffic cameras to calculate congestion, and feeds this into a PyTorch CNN-LSTM model to forecast PM2.5 levels 24 hours in advance. It explains the prediction using SHAP, visualizes it on a React dashboard, and sends automated Telegram alerts if the WHO limit (50 PM2.5) is breached.

## 2. Tech Stack (Strict Requirements)
Do not deviate from these libraries unless explicitly requested.
*   **Frontend:** React (Vite), Tailwind CSS (Dark Mode), `react-leaflet` (Maps), `recharts` (Charts), `axios` (API fetching).
*   **Backend:** Python 3.10+, FastAPI, SQLAlchemy, `psycopg2-binary` (PostgreSQL), `apscheduler` (Cron jobs), `python-telegram-bot`.
*   **Computer Vision:** `ultralytics` (YOLOv8), `opencv-python`.
*   **Machine Learning:** `torch` (PyTorch - CNN-LSTM), `shap`, `pandas`, `numpy`, `scikit-learn`.
*   **External APIs:** AQICN API (Live air), Open-Meteo (Weather), Telegram Bot API.

## 3. Monorepo Architecture
All code must strictly adhere to this monorepo structure.

```text
adem-system/
├── backend/                  # FastAPI Backend
│   ├── app/
│   │   ├── main.py           # FastAPI entry, APScheduler setup
│   │   ├── api/              # Route handlers (GET /live, GET /forecast)
│   │   ├── core/             # Config, DB connection strings
│   │   ├── ml/               # YOLOv8 script & CNN-LSTM model loader (.pt)
│   │   ├── services/         # AQICN fetcher, Telegram alert logic
│   │   └── models/           # SQLAlchemy schemas
│   ├── requirements.txt      
│   └── Dockerfile            
├── frontend/                 # React UI
│   ├── src/
│   │   ├── components/       # UI building blocks
│   │   ├── pages/            # Dashboard.jsx
│   │   ├── lib/              # api.js (Axios config)
│   │   └── App.jsx
│   ├── package.json          
│   └── tailwind.config.js    # Strict dark mode theme
└── ml_training/              # Offline training (Not deployed)
    ├── notebooks/            
    └── data/
```
4. Core Workflows
A. Backend Scheduled Job (Every 30 mins)
Fetch live PM2.5 from Kazhydromet stations via AQICN.

Run YOLOv8 on a short local traffic video (app/ml/video.mp4) to get vehicles_per_minute.

Pass historical 24h data + weather + live traffic into the loaded PyTorch CNN-LSTM model.

Save the 24h forecast array into PostgreSQL.

If predicted PM2.5 > 50, trigger Telegram bot alert.

B. API Endpoints (FastAPI)
GET /api/live: Returns latest DB row (current PM2.5, current traffic count, SHAP breakdown).

GET /api/forecast: Returns array of objects { "time": "14:00", "pm25": 45 } for Recharts.

5. UI/UX Design System (Tailwind)
Theme: Dark mode only. Background: bg-slate-950. Cards: bg-slate-900 border border-slate-800. Text: text-slate-100.

Status Colors: Safe = text-emerald-400. Warning = text-yellow-400. Danger (PM2.5 > 50) = text-rose-500.

Desktop Layout: 3 Columns.

Col 1 (25%): Live Stats & Leaflet Map (Dark map tiles, colored marker dots).

Col 2 (50%): 24-Hour Forecast Timeline (Recharts LineChart with a red dotted reference line at Y=50).

Col 3 (25%): "Engine Room" - YOLOv8 traffic feed visualization & SHAP Feature Importance horizontal bar chart.

Mobile Layout: Single column, stacked vertically. Map -> Alert Banner -> Chart -> Engine Room.

6. Vibe Coding Rules for the AI Agent
Always provide fully complete files. Do not use placeholders like // ... rest of the code unless the file is massive. I need to copy/paste and run.

Handle errors gracefully. FastAPI should return standard HTTP exceptions. React should show skeleton loaders while fetching data.

Keep styling aggressive. Use glowing Tailwind effects (shadow-[0_0_15px_rgba(...)]) for alert states to make the UI look high-tech.


***

**How to use this right now:**
Drop this into your code editor. Start your first prompt with your AI assistant like this: 
*"Read `project_context.md`. We are starting with the Data Layer and Backend. Generate the `backend/requirements.txt`, the `backend/app/main.py`, and the SQLAlchemy `models/` setup to connect to my PostgreSQL database."*

You are fully locked and loaded. Go build.