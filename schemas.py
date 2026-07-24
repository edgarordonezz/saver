from pydantic import BaseModel, EmailStr
from datetime import date

# Pydantic schemas
class Token(BaseModel):
    access_token: str
    token_type: str

# --- User ---
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    
class UserOut(BaseModel):
    id: int
    email: str
    
    class Config:
        from_attributes = True # read attributes from objects and store them

# --- Habit ---
class HabitCreate(BaseModel):
    name: str
    typical_cost: float
    
class HabitOut(BaseModel):
    id: int
    name: str
    typical_cost: float
    owner_id: int
    
    class Config:
        from_attributes = True

# --- LoggedEntry ---
class LoggedEntryCreate(BaseModel):
    date: date
    skipped: bool = True
    amount: float

class LoggedEntryOut(BaseModel):
    id: int
    habit_id: int
    date: date
    skipped: bool
    amount: float

    class Config:
        from_attributes = True