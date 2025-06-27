from fastapi.routing import APIRouter
from fastapi.responses import JSONResponse
from fastapi import HTTPException, Depends
from schemas.UsersSchema import updateUser, createUser, loginUser
from models.expenses import Users
from db import engine
from sqlmodel import select, Session
from utils.hashed import hash_password, verify_password
from utils.jwt import create_access_token, get_current_user
from sqlalchemy.exc import IntegrityError

router = APIRouter()


@router.post("/users")
def create_user(userData: createUser):
    new_user = Users(
        name=userData.name,
        email=userData.email,
        value_limit=userData.valueLimit,
        password=hash_password(userData.password),
    )

    with Session(engine) as session:
        try:
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=400, detail="E-mail já está em uso")
    return {"message": "Usuário criado com sucesso", "id": new_user.id}


@router.put("/users/{id}")
def update_user(id: int, userData: updateUser):
    with Session(engine) as session:
        statement = select(Users).where(Users.id == id)
        result = session.exec(statement).first()

        if not result:
            return JSONResponse(
                status_code=404, content={"message": "Usuario não encontrado"}
            )

        if userData.name is not None:
            result.name = userData.name
        if userData.email is not None:
            result.email = userData.email
        if userData.valueLimit is not None:
            result.value_limit = userData.valueLimit
        if userData.password is not None:
            result.password = hash_password(userData.password)

        try:
            session.add(result)
            session.commit()
            session.refresh(result)
        except IntegrityError:
            session.rollback()
            raise HTTPException(status_code=400, detail="E-mail já está em uso")
        return {"message": "Usuário atualizado com sucesso", "name": result.name}


@router.post("/login")
def login(loginData: loginUser):
    with Session(engine) as session:
        statement = select(Users).where(Users.email == loginData.email)
        result = session.exec(statement).first()

        if not result or not verify_password(loginData.password, result.password):
            return JSONResponse(
                status_code=401, content={"message": "Email ou Senha incorreta"}
            )
        token = create_access_token({"sub": str(result.id)})
        return {"acess_token": token, "token_type": "bearer"}
    
@router.get("/test-token")
def test_token(current_user: str = Depends(get_current_user)):
    return {"user_id": current_user}   
