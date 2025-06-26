from sqlmodel import SQLModel, Field
from datetime import datetime


class Expenses(SQLModel, table=True):
    id: int = Field(primary_key=True, unique=True)
    name: str
    description: str
    value: float
    date: datetime = Field(default_factory=datetime.now)