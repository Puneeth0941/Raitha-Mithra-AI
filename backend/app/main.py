import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database import Base, engine
from app import models

from app.routes.auth import router as auth_router
from app.routes.farm import router as farm_router
from app.routes.expense import router as expense_router
from app.routes.income import router as income_router
from app.routes.dashboard import router as dashboard_router
from app.routes.weather import router as weather_router
from app.routes.activity import router as activity_router
from app.routes.ai import router as ai_router
from app.routes.market import router as market_router
from app.routes.report import router as report_router
from app.routes.bill import router as bill_router
from app.routes.profile import router as profile_router
from app.routes.notification import router as notification_router

from sqlalchemy import text

# Create FastAPI application
app = FastAPI(
    title="AgriWise AI API",
    version="1.0.0"
)
from fastapi.staticfiles import StaticFiles



# Create database tables
Base.metadata.create_all(bind=engine)

# Auto-migrate missing columns for tables if already created
try:
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS date DATE;"))
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;"))
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS farm_id INTEGER;"))
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS bill_type VARCHAR(50) DEFAULT 'General';"))
        conn.execute(text("ALTER TABLE bills ADD COLUMN IF NOT EXISTS user_id INTEGER;"))
        conn.execute(text("ALTER TABLE incomes ADD COLUMN IF NOT EXISTS user_id INTEGER;"))
        conn.execute(text("ALTER TABLE expenses ADD COLUMN IF NOT EXISTS user_id INTEGER;"))
        conn.execute(text("ALTER TABLE activities ADD COLUMN IF NOT EXISTS user_id INTEGER;"))
        conn.execute(text("ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_id INTEGER;"))
        conn.commit()
except Exception as e:
        print(f"Migration note for database tables: {e}")

# Create uploads directory if it doesn't exist
os.makedirs("uploads", exist_ok=True)
os.makedirs("uploads/bills", exist_ok=True)


# Serve uploaded files
app.mount(
    "/uploads",
    StaticFiles(directory="uploads"),
    name="uploads"
)

# -----------------------------
# CORS Configuration
# -----------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",

        "https://raitha-mithra-ai.vercel.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------
# Register Routers
# -----------------------------
app.include_router(auth_router)
app.include_router(farm_router)
app.include_router(expense_router)
app.include_router(income_router)
app.include_router(dashboard_router)
app.include_router(weather_router)
app.include_router(activity_router)
app.include_router(ai_router)
app.include_router(market_router)
app.include_router(report_router)
app.include_router(bill_router)
app.include_router(profile_router)
app.include_router(notification_router)


# -----------------------------
# Root Endpoint
# -----------------------------
@app.get("/")
def home():
    return {
        "message": "Welcome to AgriWise AI API",
        "status": "Running"
    }