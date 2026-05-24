from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router
from app.core.database import Base, engine
# Import models so they are registered with SQLAlchemy before create_all
from app.models import air_quality

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup event: create database tables
    Base.metadata.create_all(bind=engine)
    yield
    # Shutdown logic can go here

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
