from pydantic import BaseModel, EmailStr
from typing import Optional

class createUser(BaseModel):
    name : str
    email : EmailStr
    password: str

class updateUser(BaseModel):
    name : Optional[str]
    email : Optional[EmailStr]
    password: Optional[str]

class loginUser(BaseModel):
    email : EmailStr
    password: str