from sqlmodel import SQLModel
from db import engine
from models.expenses import Expenses  # <-- importa o(s) model(s) aqui

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)

if __name__ == "__main__":
    create_db_and_tables()
