from pydantic import BaseModel, EmailStr
from typing import Optional

class createUser(BaseModel):
    name : str
    email : EmailStr
    valueLimit: float
    password: str

class updateUser(BaseModel):
    name : Optional[str]
    email : Optional[EmailStr]
    valueLimit: Optional[float]
    password: Optional[str]

class loginUser(BaseModel):
    email : EmailStr
    password: str