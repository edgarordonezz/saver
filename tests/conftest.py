import pytest
from sqlalchemy import create_engine
from main import app
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from database import get_db, Base

SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:" # in-memory version for testing
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}, # SQLite-only, needed for FastAPI's threading
    poolclass=StaticPool
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(autouse=True) # autouse so it runs with every test
def fixture():
        Base.metadata.create_all(bind=engine)
        yield 
        Base.metadata.drop_all(bind=engine)