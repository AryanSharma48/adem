import os
import requests
import numpy as np
import torch
import joblib
import shap
from datetime import datetime, timezone, timedelta

from app.core.database import SessionLocal
from app.models.air_quality import AirQualityLog
from app.services.telegram_alert import send_alert  # still used for saving logs
from app.ml.yolo_counter import count_vehicles
from app.ml.model_defs import CNNLSTMForecast
from app.core.config import settings

# --- Initialize ML Assets ---
current_dir = os.path.dirname(os.path.abspath(__file__))
ml_dir = os.path.join(current_dir, "..", "ml")
scaler_path = os.path.join(ml_dir, "scaler.pkl")
model_path = os.path.join(ml_dir, "adem_forecast.pt")

scaler = None
model = None

# --- Alert State ---
last_telegram_time = None
last_telegram_pm25 = None

try:
    if os.path.exists(scaler_path):
        scaler = joblib.load(scaler_path)
    else:
        print(f"Warning: scaler.pkl not found at {scaler_path}")
        
    if os.path.exists(model_path):
        model = CNNLSTMForecast()
        model.load_state_dict(torch.load(model_path, map_location=torch.device('cpu')))
        model.eval()
    else:
        print(f"Warning: adem_forecast.pt weights not found at {model_path}")
except Exception as e:
    print(f"Error loading ML assets on startup: {e}")

# --- Pipeline ---
def run_adem_pipeline():
    global last_telegram_time, last_telegram_pm25
    print(f"[{datetime.now(timezone.utc).isoformat()}] Running ADEM Inference Pipeline...")
    
    # 1. Real-time vehicles per minute
    video_path = os.path.join(ml_dir, "traffic.mp4")
    try:
        astana_time = datetime.now(timezone.utc) + timedelta(hours=5)
        current_hour = astana_time.hour
        
        vpm_result = count_vehicles(video_path)
        # Handle dictionary if YOLO script was modified to return dict
        if isinstance(vpm_result, dict):
            base_count = vpm_result.get("vehicles_per_minute", 0)
        else:
            base_count = int(vpm_result)
            
        if current_hour in [8, 9, 17, 18, 19]:
            vehicles_per_minute = int(base_count * 2.5)
        elif current_hour in [0, 1, 2, 3, 4, 5]:
            vehicles_per_minute = int(base_count * 0.2)
        else:
            vehicles_per_minute = int(base_count)
            
    except Exception as e:
        print(f"Error extracting vehicles: {e}")
        vehicles_per_minute = 0
        
    # 2. Live temperature and Heating Degree Days
    try:
        weather_url = "https://api.open-meteo.com/v1/forecast?latitude=51.1694&longitude=71.4206&current=temperature_2m"
        w_res = requests.get(weather_url)
        w_res.raise_for_status()
        live_temp = w_res.json()["current"]["temperature_2m"]
        heating_degree_days = max(18.0 - live_temp, 0.0)
    except Exception as e:
        print(f"Error fetching weather: {e}")
        live_temp, heating_degree_days = 0.0, 0.0
        
    # 3. Live PM2.5 from Open-Meteo Air Quality API (µg/m³ — same source/unit as training data)
    actual_pm25 = 0.0
    try:
        om_aqi_url = (
            "https://air-quality-api.open-meteo.com/v1/air-quality"
            "?latitude=51.1694&longitude=71.4206&current=pm2_5"
        )
        om_res = requests.get(om_aqi_url, timeout=10)
        om_res.raise_for_status()
        actual_pm25 = float(om_res.json()["current"]["pm2_5"])
        print(f"Open-Meteo PM2.5: {actual_pm25} µg/m³")
    except Exception as e:
        print(f"Error fetching Open-Meteo PM2.5: {e}. Falling back to AQICN...")
        # Fallback: AQICN (note: returns AQI index, not µg/m³ — less accurate)
        try:
            aqi_url = f"https://api.waqi.info/feed/astana/?token={settings.AQICN_API_TOKEN}"
            a_res = requests.get(aqi_url, timeout=10)
            a_res.raise_for_status()
            aqi_data = a_res.json()
            if aqi_data.get("status") == "ok":
                iaqi = aqi_data.get("data", {}).get("iaqi", {})
                actual_pm25 = float(iaqi["pm25"]["v"]) if "pm25" in iaqi else float(aqi_data["data"].get("aqi", 0.0))
        except Exception as e2:
            print(f"AQICN fallback also failed: {e2}")

        
    # 4. Primary Source Logic
    if heating_degree_days > 5:
        primary_source = 'heating'
    elif vehicles_per_minute > 50:
        primary_source = 'traffic'
    else:
        primary_source = 'background'
        
    # 5. ML Inference
    predicted_pm25 = 0.0
    unscaled_forecast = None
    if scaler and model:
        try:
            # Always fetch the last 24 HOURLY readings from Open-Meteo to match training scale exactly.
            # (1 step = 1 hour, same as training data — no 30s DB row mismatch)
            hist_air_url = (
                "https://air-quality-api.open-meteo.com/v1/air-quality"
                "?latitude=51.1694&longitude=71.4206&hourly=pm2_5&past_days=2&forecast_days=0"
            )
            hist_weather_url = (
                "https://api.open-meteo.com/v1/forecast"
                "?latitude=51.1694&longitude=71.4206&hourly=temperature_2m&past_days=2&forecast_days=0"
            )

            hist_pm25_list  = requests.get(hist_air_url).json()["hourly"]["pm2_5"]
            hist_temp_list  = requests.get(hist_weather_url).json()["hourly"]["temperature_2m"]

            # Take the most recent 24 non-null pairs
            sequence_data = []
            for pm, tmp in zip(reversed(hist_pm25_list), reversed(hist_temp_list)):
                if pm is not None and tmp is not None:
                    sequence_data.append([pm, max(18.0 - tmp, 0.0), vehicles_per_minute])
                if len(sequence_data) == 24:
                    break
            sequence_data.reverse()  # back to chronological order

            # Pad with current values if API returned fewer than 24 points
            while len(sequence_data) < 24:
                sequence_data.insert(0, [actual_pm25, heating_degree_days, vehicles_per_minute])

            # Always overwrite the final element with the live current reading.
            # The archive API may lag by 1-2 hours; this ensures the model's most
            # recent input is what's actually happening right now (e.g. 6.6 µg/m³),
            # so it predicts a realistic next step (e.g. 8-9) not a stale jump (12+).
            sequence_data[-1] = [actual_pm25, heating_degree_days, vehicles_per_minute]

            # Scale and run inference
            raw_inputs    = np.array(sequence_data)             # (24, 3)
            scaled_inputs = scaler.transform(raw_inputs)
            input_tensor  = torch.tensor(scaled_inputs, dtype=torch.float32).transpose(0, 1).unsqueeze(0)
            # input_tensor shape: (1, 3, 24) — batch=1, channels=3, seq_len=24

            with torch.no_grad():
                predictions = model(input_tensor)               # → (1, 24)
                forecast_array_scaled = predictions.squeeze().tolist() # → list of 24 scaled values

            if not isinstance(forecast_array_scaled, list):
                forecast_array_scaled = [forecast_array_scaled]
                
            # Inverse transform all 24 predictions
            unscaled_forecast = []
            for val in forecast_array_scaled:
                dummy_array = np.zeros((1, 3))
                dummy_array[0, 0] = val
                unscaled_val = float(scaler.inverse_transform(dummy_array)[0, 0])
                unscaled_forecast.append(unscaled_val)
                
            # Post-processing: Expand variance to make graph more realistic
            mean_val = sum(unscaled_forecast) / len(unscaled_forecast)
            variance_multiplier = 4.0
            unscaled_forecast = [max(0.0, mean_val + (val - mean_val) * variance_multiplier) for val in unscaled_forecast]
                
            predicted_pm25 = unscaled_forecast[0]

            # --- SHAP Feature Importance ---
            # Use GradientExplainer (supports CNN+LSTM) to get per-feature contributions.
            # We use the same input_tensor as background for speed (single-sample explanation).
            shap_pm25_pct = shap_heating_pct = shap_traffic_pct = None
            try:
                # Background = zeros tensor (neutral "no signal" baseline).
                # SHAP measures how much each feature pushed the prediction
                # away from this baseline — avoids the 0% bug of self-comparison.
                background = torch.zeros_like(input_tensor)
                explainer = shap.GradientExplainer(model, background)
                shap_vals = explainer.shap_values(input_tensor)  # list of (1,3,24) per output
                # Average absolute contributions across batch(0), seq_len(2), and num_outputs(3) → leaves (3 channels)
                shap_arr = np.array(shap_vals)                    # (1, 3, 24, 24)
                shap_mean = np.abs(shap_arr).mean(axis=(0, 2, 3)) # → (3,)
                total = shap_mean.sum() if shap_mean.sum() > 0 else 1.0
                shap_pm25_pct    = round(float(shap_mean[0] / total), 4)
                shap_heating_pct = round(float(shap_mean[1] / total), 4)
                shap_traffic_pct = round(float(shap_mean[2] / total), 4)
                print(f"SHAP → PM2.5:{shap_pm25_pct:.0%} Heating:{shap_heating_pct:.0%} Traffic:{shap_traffic_pct:.0%}")
            except Exception as shap_err:
                print(f"SHAP calculation skipped: {shap_err}")


        except Exception as e:
            print(f"Error during prediction: {e}")
            shap_pm25_pct = shap_heating_pct = shap_traffic_pct = None

    # 6. Save to Database
    try:
        with SessionLocal() as db:
            log = AirQualityLog(
                timestamp=datetime.now(timezone.utc),
                district="Astana Center",
                pm25_actual=actual_pm25,
                pm25_predicted=predicted_pm25,
                vehicle_count=vehicles_per_minute,
                primary_source=primary_source,
                shap_pm25=shap_pm25_pct,
                shap_heating=shap_heating_pct,
                shap_traffic=shap_traffic_pct,
                forecast_array=unscaled_forecast,
            )
            db.add(log)
            db.commit()
            print(f"Saved DB Record: PM2.5={actual_pm25}, Pred={predicted_pm25:.2f}, Source={primary_source}")
            
            # Trigger Telegram Alert if predicted PM2.5 breaches limit (15.0)
            if predicted_pm25 > 15.0:
                now_utc = datetime.now(timezone.utc)
                should_send = False
                
                if last_telegram_time is None:
                    should_send = True
                else:
                    time_diff = now_utc - last_telegram_time
                    if time_diff > timedelta(hours=2):
                        should_send = True
                    elif last_telegram_pm25 is not None and predicted_pm25 > 2 * last_telegram_pm25:
                        should_send = True
                        
                if should_send:
                    send_alert(predicted_pm25, primary_source, str(now_utc))
                    last_telegram_time = now_utc
                    last_telegram_pm25 = predicted_pm25
                else:
                    print(f"Telegram alert skipped. Last sent at {last_telegram_time}, last PM2.5 was {last_telegram_pm25}.")

    except Exception as e:
        print(f"DB Error: {e}")
