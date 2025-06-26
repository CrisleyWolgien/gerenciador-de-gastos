from pydantic import BaseModel
from typing import Optional


class expense(BaseModel):
    name: str
    description: str
    value: float

class updateExpense(BaseModel):
    name: Optional[str] 
    description: Optional[str] 
    value: Optional[float] 