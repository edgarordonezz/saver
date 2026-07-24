# Set up of how the app will talk to the database
# connect_args={"check_same_thread": False}: SQLite normally restricts a connection to 
# the thread that created it. FastAPI can process a single request across different 
# threads internally, so this is required even with one user, or SQLite throws an error.
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

SQLALCHEMY_DATABASE_URL = "sqlite:///./saver.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False} # SQLite-only, needed for FastAPI's threading
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def get_db():
    db = SessionLocal() # opens a new db session
    try:
        yield db # hands sessions to whatever route asked for it
    finally:
        db.close() # runs after the route finishes, no matter what