from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional
from pydantic import EmailStr


class Expenses(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    description: str
    category: str
    value: float
    date: datetime = Field(default_factory=datetime.now)
    user_id: int = Field(foreign_key="users.id") 

class Users(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    email: EmailStr = Field(unique=True)
    value_limit: float
    password: str