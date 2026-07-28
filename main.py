from fastapi import FastAPI

from database import Base, engine
from routes.auth import router as auth_router

# creates all tables defined in models.py if they don't already exist
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.include_router(auth_router)
