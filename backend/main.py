from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ExpensesRouters, UsersRoutes, DashBoardRouter, BudgetRouters

app = FastAPI()

# ========================================================================
# CORREÇÃO DA CONFIGURAÇÃO DE CORS
# ========================================================================

# Lista de origens permitidas.
# Adicione a URL do seu frontend em produção aqui no futuro.
origins = [
    "http://localhost:5173",
     "https://gerenciador-de-gastos-ten.vercel.app" # Para desenvolvimento local
    # Exemplo para produção: "https://seu-site.onrender.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,      # 1. Usar a lista explícita de origens
    allow_credentials=True,
    allow_methods=["*"],        # 2. Manter os métodos permitidos
    allow_headers=["*"],        # 3. Manter os headers permitidos (FastAPI é inteligente o suficiente para lidar com isso se as origens forem explícitas)
)

# ========================================================================

@app.get("/")
def ping():
    return {"message": "ping"}

app.include_router(ExpensesRouters.router)
app.include_router(UsersRoutes.router)
app.include_router(DashBoardRouter.router)
app.include_router(BudgetRouters.router)
