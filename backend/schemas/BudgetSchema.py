from pydantic import BaseModel
from typing import Optional

class createBudget(BaseModel):
    name_category : str
    value : float

class updateBudget(BaseModel):
    name_category : Optional[str]
    value : Optional[float]