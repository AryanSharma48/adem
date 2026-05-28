from sqlalchemy import text
from app.core.database import engine

def run_migration():
    try:
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE air_quality_logs ADD COLUMN forecast_array JSON;"))
            print("Successfully added 'forecast_array' column to 'air_quality_logs' table.")
    except Exception as e:
        print(f"Migration failed (it might already exist): {e}")

if __name__ == "__main__":
    run_migration()
