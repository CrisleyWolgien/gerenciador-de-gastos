from pydantic import BaseModel
from typing import Optional
from datetime import date


class expense(BaseModel):
    name: str
    description: str
    value: float
    category: str
    expense_date: date # Adicionado o campo de data


class updateExpense(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    value: Optional[float] = None
    category: Optional[str] = None
    expense_date: Optional[date] = None # Adicionado o campo de data opcional