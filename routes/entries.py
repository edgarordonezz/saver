from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from routes.auth import get_current_user
from routes.habits import get_owned_habit
import models, schemas

router = APIRouter(prefix="/habits/{habit_id}/entries", tags=["entries"])

@router.post("/", response_model=schemas.LoggedEntryOut)
def create_entry(habit_id: int, entry: schemas.LoggedEntryCreate, db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    get_owned_habit(habit_id, db, current_user)
    new_entry = models.LoggedEntry(**entry.dict(), habit_id=habit_id)
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

@router.get("/", response_model=list[schemas.LoggedEntryOut])
def get_entries(habit_id: int, db: Session = Depends(get_db),
                 current_user: models.User = Depends(get_current_user)):
    get_owned_habit(habit_id, db, current_user)
    return db.query(models.LoggedEntry).filter(models.LoggedEntry.habit_id == habit_id).all()

def get_owned_entry(habit_id: int, entry_id: int, db: Session, current_user: models.User):
    get_owned_habit(habit_id, db, current_user)  # proves the habit itself is yours
    entry = db.query(models.LoggedEntry).filter(
        models.LoggedEntry.id == entry_id, models.LoggedEntry.habit_id == habit_id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return entry

@router.patch("/{entry_id}", response_model=schemas.LoggedEntryOut)
def update_entry(habit_id: int, entry_id: int, entry_update: schemas.LoggedEntryCreate,
                  db: Session = Depends(get_db), current_user: models.User = Depends(get_current_user)):
    entry = get_owned_entry(habit_id, entry_id, db, current_user)
    entry.date = entry_update.date
    entry.skipped = entry_update.skipped
    entry.amount = entry_update.amount
    db.commit()
    db.refresh(entry)
    return entry

@router.delete("/{entry_id}", status_code=204)
def delete_entry(habit_id: int, entry_id: int, db: Session = Depends(get_db),
                  current_user: models.User = Depends(get_current_user)):
    entry = get_owned_entry(habit_id, entry_id, db, current_user)
    db.delete(entry)
    db.commit()