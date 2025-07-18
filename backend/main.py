from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ExpensesRouters, UsersRouters, BudgetRouters, DashboardRouters # Assuming you named the new router file DashboardRouters.py
from db import engine, SQLModel

# Create all database tables based on the models
SQLModel.metadata.create_all(engine)

app = FastAPI(
    title="Gerenciador de Gastos API",
    description="API para gerenciar despesas e orçamentos pessoais.",
    version="1.0.0"
)

# ========================================================================
# CONFIGURAÇÃO DO CORS (A GRANDE MUDANÇA)
# ========================================================================

# Define de quais origens (endereços de frontend) as requisições são permitidas.
origins = [
    "*", # O endereço do seu frontend em produção (se aplicável)
    # Adicione aqui outros endereços se você hospedar o frontend em outro lugar
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Lista de origens que podem fazer requisições
    allow_credentials=True, # Permite que cookies sejam incluídos nas requisições
    allow_methods=["*"],    # Permite todos os métodos (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Permite todos os cabeçalhos
)
# ========================================================================


# Inclui os roteadores da sua aplicação
app.include_router(UsersRouters.router, tags=["Users"])
app.include_router(ExpensesRouters.router, tags=["Expenses"])
app.include_router(BudgetRouters.router, tags=["Budget"])
app.include_router(DashboardRouters.router, tags=["Dashboard"]) # Verifique se o nome do arquivo é DashboardRouters.py

@app.get("/")
def read_root():
    return {"message": "Bem-vindo à API do Gerenciador de Gastos!"}