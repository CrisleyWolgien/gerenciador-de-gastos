from sqlmodel import SQLModel, Field
from datetime import date, datetime
from typing import Optional
from pydantic import EmailStr


class Expenses(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name: str
    description: str
    category: str
    value: float
    expense_date: date = Field(index=True) # Campo para a data que o usuário escolhe
    date_created: datetime = Field(default_factory=datetime.now, nullable=False) # Data de criação do registro
    user_id: int = Field(foreign_key="users.id")


class Users(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    email: str = Field(unique=True)
    password: str



class Budget(SQLModel, table=True):
    id: Optional[int] = Field(primary_key=True, default=None)
    name_category: str = Field(unique=True)
    value: float
    user_id: int = Field(foreign_key="users.id")