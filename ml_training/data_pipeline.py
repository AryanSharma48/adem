import os
import requests
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

print("Starting data pipeline...")

# Create data directory
os.makedirs("data", exist_ok=True)

# Define 1 year range (Archive API max date is usually ~2 days ago)
end_date = datetime.now().date() - timedelta(days=2)
start_date = end_date - timedelta(days=365)

print(f"Fetching PM2.5 data from {start_date} to {end_date}...")
pm25_url = f"https://air-quality-api.open-meteo.com/v1/air-quality?latitude=51.1694&longitude=71.4206&hourly=pm2_5&start_date={start_date}&end_date={end_date}"
pm25_res = requests.get(pm25_url).json()

df_pm25 = pd.DataFrame({
    'time': pm25_res['hourly']['time'],
    'pm2_5': pm25_res['hourly']['pm2_5']
})

print("Fetching temperature data...")
temp_url = f"https://archive-api.open-meteo.com/v1/archive?latitude=51.1694&longitude=71.4206&hourly=temperature_2m&start_date={start_date}&end_date={end_date}"
temp_res = requests.get(temp_url).json()

df_temp = pd.DataFrame({
    'time': temp_res['hourly']['time'],
    'temperature_2m': temp_res['hourly']['temperature_2m']
})

# Merge and drop NaNs
print("Merging data...")
df = pd.merge(df_pm25, df_temp, on='time')
df = df.dropna()

print("Engineering features...")
# Calculate heating degree days (base 18C)
df['heating_degree_days'] = df['temperature_2m'].apply(lambda x: max(18.0 - x, 0.0))

# Synthetic traffic proxy based on hour
df['hour'] = pd.to_datetime(df['time']).dt.hour

def sim_traffic(h):
    # Spikes around 08:00 and 18:00
    if 7 <= h <= 9: return np.random.normal(200, 20)
    if 17 <= h <= 19: return np.random.normal(250, 30)
    if 0 <= h <= 5: return np.random.normal(20, 10)
    return np.random.normal(100, 20)

df['vehicles_per_minute'] = df['hour'].apply(sim_traffic).clip(lower=0)

# Finalize layout
df_final = df[['pm2_5', 'heating_degree_days', 'vehicles_per_minute']]

output_path = "data/astana_ground_truth.csv"
df_final.to_csv(output_path, index=False)
print(f"Pipeline complete! Saved {len(df_final)} rows to {output_path}")
