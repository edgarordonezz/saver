from fastapi import FastAPI

from database import Base, engine
from routes.auth import router as auth_router
from routes.habits import router as habits_router
from routes.entries import router as entries_router
from routes.summary import router as summary_router

# creates all tables defined in models.py if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)
app.include_router(habits_router)
app.include_router(entries_router)
app.include_router(summary_router)
