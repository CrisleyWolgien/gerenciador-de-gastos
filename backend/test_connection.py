from sqlmodel import create_engine
from dotenv import load_dotenv
import os

load_dotenv(override=True)

DATABASE_URL = os.getenv("DATABASE_URL")
print(f"📌 DATABASE_URL carregada: {DATABASE_URL}")


if not DATABASE_URL:
    raise ValueError("DATABASE_URL não encontrada no .env")

# Cria o engine
engine = create_engine(DATABASE_URL)

# Teste simples de conexão
try:
    with engine.connect() as connection:
        print("✅ Conexão com o banco de dados bem-sucedida!")
except Exception as e:
    print("❌ Erro ao conectar no banco de dados:")
    print(e)
