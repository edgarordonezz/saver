from datetime import date as date_

from sqlalchemy import Date, Float, ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from database import Base


# User tables and their attributes (PK=users.id)
class User(Base):
    __tablename__ = "users"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String, unique=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(String, nullable=False)

    # many habits belong to one owner
    habits = relationship("Habit", back_populates="owner")


# User tables and their attributes (PK=habits.id, Fk=users.id)
class Habit(Base):
    __tablename__ = "habits"
    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String, nullable=False)
    typical_cost: Mapped[float] = mapped_column(Float, nullable=False)
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))

    # one owner can have many habits
    owner = relationship("User", back_populates="habits")
    # many entries can belong to one habit; deleting a habit deletes its entries too
    entries = relationship("LoggedEntry", back_populates="habit", cascade="all, delete-orphan")

# User tables and their attributes (PK=logged_entries.id, Fk=habits.id)
class LoggedEntry(Base):
    __tablename__ = "logged_entries"
    id: Mapped[int] = mapped_column(primary_key=True)
    habit_id: Mapped[int] = mapped_column(ForeignKey("habits.id", ondelete="CASCADE"))
    date: Mapped[date_] = mapped_column(Date, nullable=False)
    skipped: Mapped[bool] = mapped_column(default=True)
    amount: Mapped[float] = mapped_column(Float, nullable=False)

    # one habit can have many entries
    habit = relationship("Habit", back_populates="entries")