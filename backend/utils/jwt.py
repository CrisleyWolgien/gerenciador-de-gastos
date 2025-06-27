from datetime import datetime, timedelta, timezone
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
import os
from dotenv import load_dotenv
from sqlmodel import Session
from db import engine
from models.expenses import Users


load_dotenv(override=True)

SECRET_KEY = os.getenv("SECRET_KEY", "")
ALGORITHM = os.getenv("ALGORITHM", "")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))

if SECRET_KEY is None:
    raise ValueError("SECRET_KEY não foi definida no .env")
SECRET_KEY: str = SECRET_KEY

if ALGORITHM is None:
    raise ValueError("ALGORITHM não foi definida no .env")
ALGORITHM: str = ALGORITHM

if ACCESS_TOKEN_EXPIRE_MINUTES is None:
    raise ValueError("ACCESS_TOKEN_EXPIRE_MINUTES não foi definida no .env")


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/login")


def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    if "sub" not in to_encode:
        raise ValueError("Token payload precisa conter 'sub'")
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])  # type: ignore
        return payload
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")


def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = verify_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido"
        )

    user_id = payload["sub"]

    with Session(engine) as session:
        user = session.get(Users, user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Usuário não encontrado",
            )
        return user
