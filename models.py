from sqlalchemy import Boolean, Column, Date, Float, ForeignKey, Integer, String
from sqlalchemy.orm import relationship
from database import Base


# User tables and their attributes (PK=users.id)
class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # many habits belong to one owner
    habits = relationship("Habit", back_populates="owner")
    

# User tables and their attributes (PK=habits.id, Fk=users.id)
class Habit(Base):
    __tablename__ = "habits"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    typical_cost = Column(Float, nullable=False)
    owner_id = Column(Integer, ForeignKey("users.id"))
    
    # one owner can have many habits
    owner = relationship("User", back_populates="habits")
    # many entries can belong to one habit
    entries = relationship("LoggedEntry", back_populates="habit")

# User tables and their attributes (PK=logged_entries.id, Fk=habits.id)    
class LoggedEntry(Base):
    __tablename__ = "logged_entries"
    id = Column(Integer, primary_key=True)
    habit_id = Column(Integer, ForeignKey("habits.id"))
    date = Column(Date, nullable=False)
    skipped = Column(Boolean, default=True)
    amount = Column(Float, nullable=False)
    
    # one habit can have many entries
    habit = relationship("Habit", back_populates="entries")