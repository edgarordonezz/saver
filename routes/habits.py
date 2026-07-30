from fastapi import APIRouter, Depends, HTTPException
from database import get_db
import models
from routes.auth import get_current_user
import schemas

from sqlalchemy.orm import Session

router = APIRouter(prefix="/habits", tags=["habits"])

@router.post("/", response_model=schemas.HabitOut)
def create_habit(habit: schemas.HabitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    new_habit = models.Habit(**habit.dict(), owner_id=current_user.id)
    db.add(new_habit)
    db.commit()
    db.refresh(new_habit)
    return new_habit

@router.get("/", response_model=list[schemas.HabitOut])
def get_habits(db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    return db.query(models.Habit).filter(models.Habit.owner_id == current_user.id).all()

def get_owned_habit(habit_id: int, db: Session, current_user: models.User):
    habit = db.query(models.Habit).filter(
        models.Habit.id == habit_id, models.Habit.owner_id == current_user.id
    ).first()
    if not habit:
        raise HTTPException(status_code=404, detail="Habit not found")
    return habit

@router.delete("/{habit_id}", status_code=204)
def delete_habit(habit_id: int, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habit = get_owned_habit(habit_id, db, current_user)
    db.delete(habit)
    db.commit()
    
@router.patch("/{habit_id}", response_model=schemas.HabitOut)
def update_habit(habit_id: int, habit_update: schemas.HabitCreate, db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    habit = get_owned_habit(habit_id, db, current_user)
    habit.name = habit_update.name
    habit.typical_cost = habit_update.typical_cost
    db.commit()
    db.refresh(habit)
    return habit
    