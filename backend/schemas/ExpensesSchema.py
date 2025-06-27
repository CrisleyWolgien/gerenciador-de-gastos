from pydantic import BaseModel
from typing import Optional
from enum import Enum

class ExpenseCategory(str, Enum):
    alimentacao = "Alimentação"
    transporte = "Transporte"
    educacao = "Educação"
    lazer = "Lazer"
    outros = "Outros"


class expense(BaseModel):
    name: str
    description: str
    value: float
    category: ExpenseCategory

class updateExpense(BaseModel):
    name: Optional[str] 
    description: Optional[str] 
    value: Optional[float] 
    category: Optional[ExpenseCategory]