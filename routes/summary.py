from datetime import datetime
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from routes.auth import get_current_user
import models, schemas

router = APIRouter(prefix="/summary", tags=["summary"])

def calculate_longest_streak(entries: list[models.LoggedEntry]) -> int:
    # entries must already be sorted by date ascending
    longest = current = 0
    previous = None

    for entry in entries:
        if not entry.skipped:
            current = 0
        else:
            if previous is not None and (entry.date - previous).days == 1:
                current += 1
            else:
                current = 1
            longest = max(longest, current)

        previous = entry.date

    return longest
            
            
@router.get("/", response_model=schemas.UserSummary)
def get_summary(db: Session = Depends(get_db),
                current_user: models.User = Depends(get_current_user)):
    habits = db.query(models.Habit).filter(models.Habit.owner_id == current_user.id).all()

    habit_summaries = []
    total_saved = 0.0
    total_times_skipped = 0

    for habit in habits:
        entries = (
            db.query(models.LoggedEntry)
            .filter(models.LoggedEntry.habit_id == habit.id)
            .order_by(models.LoggedEntry.date.asc())
            .all()
        )
        skipped_entries = [e for e in entries if e.skipped]
        habit_saved = sum(e.amount for e in skipped_entries)
        habit_times_skipped = len(skipped_entries)

        total_saved += habit_saved
        total_times_skipped += habit_times_skipped

        habit_summaries.append(schemas.HabitSummary(
            habit_id=habit.id,
            name=habit.name,
            total_saved=habit_saved,
            times_skipped=habit_times_skipped,
            longest_streak=calculate_longest_streak(entries),
        ))

    return schemas.UserSummary(
        total_saved=total_saved,
        total_times_skipped=total_times_skipped,
        habits=habit_summaries,
    )