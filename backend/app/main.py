from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router
from app.core.database import Base, engine
# Import models so they are registered with SQLAlchemy before create_all
from app.models import air_quality
from app.services.inference_job import run_adem_pipeline
from apscheduler.schedulers.background import BackgroundScheduler

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create database tables
    Base.metadata.create_all(bind=engine)
    
    # Initialize and start APScheduler
    scheduler = BackgroundScheduler()
    # Run the pipeline every 30 minutes
    scheduler.add_job(run_adem_pipeline, 'interval', seconds=30)
    scheduler.start()
    
    # Trigger once immediately on boot so we have data right away
    run_adem_pipeline()
    
    yield
    
    # Shutdown event: stop the scheduler
    scheduler.shutdown()

app = FastAPI(title="ADEM API", lifespan=lifespan)

# Setup CORS to allow all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include the router
app.include_router(router)
