from sqlmodel import SQLModel, Field
from datetime import date
from typing import Optional
from pydantic import EmailStr


class Expenses(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    description: str
    category: str
    value: float
    date_created: date = Field(default_factory=date.today)
    user_id: int = Field(foreign_key="users.id")


class Users(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    email: EmailStr = Field(unique=True)
    password: str


class Budget(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name_category: str = Field(unique=True)
    value: float
    user_id: int = Field(foreign_key="users.id")
