import os
import torch
import joblib
import requests
import numpy as np
from datetime import datetime, timezone

from app.core.database import SessionLocal
from app.models.air_quality import AirQualityLog
from app.ml.yolo_counter import count_vehicles
from app.core.config import settings

def fetch_temperature() -> float:
    # Astana coordinates from Open-Meteo
    url = "https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4297&current_weather=true"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    return data["current_weather"]["temperature"]

def fetch_live_pm25() -> float:
    # Use AQICN API token from config
    url = f"https://api.waqi.info/feed/astana/?token={settings.AQICN_API_TOKEN}"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    
    # Extract based on the sample_aqicn_response.json structure
    try:
        return float(data["data"]["iaqi"]["pm25"]["v"])
    except KeyError:
        print("Warning: Live PM2.5 data not available right now.")
        return None

def run_adem_pipeline():
    print(f"[{datetime.now(timezone.utc).isoformat()}] Starting ADEM Inference Pipeline...")
    
    # 1. Get Live Vehicles Per Minute via YOLOv8
    current_dir = os.path.dirname(os.path.abspath(__file__))
    video_file = os.path.join(current_dir, "..", "ml", "traffic.mp4")
    vpm = count_vehicles(video_file)
    print(f"-> Vehicles Per Minute (YOLOv8): {vpm}")
    
    # 2. Fetch Weather & Calculate Heating Degree Days
    try:
        temp = fetch_temperature()
        heating_degree_days = max(18.0 - temp, 0.0)
        print(f"-> Temp: {temp}°C | Heating Degree Days: {heating_degree_days}")
    except Exception as e:
        print(f"-> Error fetching weather: {e}")
        temp, heating_degree_days = 0.0, 0.0
        
    # 3. Load ML Artifacts & Predict 24-hour PM2.5 Forecast
    predicted_pm25 = 0.0
    primary_source = "traffic" if vpm > 100 else "heating"
    
    try:
        scaler_path = os.path.join(current_dir, "..", "ml", "scaler.pkl")
        model_path = os.path.join(current_dir, "..", "ml", "adem_forecast.pt")
        
        if os.path.exists(scaler_path) and os.path.exists(model_path):
            scaler = joblib.load(scaler_path)
            model = torch.load(model_path)
            model.eval()
            
            # Prepare inputs
            raw_inputs = np.array([[vpm, heating_degree_days, temp]])
            scaled_inputs = scaler.transform(raw_inputs)
            
            with torch.no_grad():
                # Convert to tensor and reshape for CNN-LSTM e.g., (batch, seq_len, features)
                input_tensor = torch.tensor(scaled_inputs, dtype=torch.float32).unsqueeze(1)
                predictions = model(input_tensor)
                
                # Extract 24-hour forecast
                forecast_array = predictions.squeeze().tolist()
                
                # Use the immediate next hour as the predicted value for the DB record
                predicted_pm25 = forecast_array[0] if isinstance(forecast_array, list) else forecast_array
            print(f"-> ML Forecast successful. Next hour PM2.5 prediction: {predicted_pm25}")
        else:
            print("-> ML artifacts (scaler/model) not found. Using fallback prediction.")
            predicted_pm25 = 45.0 # Mock fallback
            
    except Exception as e:
        print(f"-> Error during ML inference: {e}")
        
    # 4. Fetch Actual PM2.5
    try:
        actual_pm25 = fetch_live_pm25()
        print(f"-> Actual Live PM2.5 (AQICN): {actual_pm25}")
    except Exception as e:
        print(f"-> Error fetching actual PM2.5: {e}")
        actual_pm25 = None
        
    # 5. Save to PostgreSQL Database
    db = SessionLocal()
    try:
        log_entry = AirQualityLog(
            timestamp=datetime.now(timezone.utc),
            district="Astana Center",
            pm25_actual=actual_pm25,
            pm25_predicted=predicted_pm25,
            vehicle_count=vpm,
            primary_source=primary_source
        )
        db.add(log_entry)
        db.commit()
        print("-> Successfully saved AirQualityLog to database!")
    except Exception as e:
        db.rollback()
        print(f"-> Database transaction failed: {e}")
    finally:
        db.close()
        print("-> Pipeline run complete.")
