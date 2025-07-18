from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ExpensesRouters, UsersRoutes, DashBoardRouter, BudgetRouters

app = FastAPI()

# ========================================================================
# CONFIGURAÇÃO DE CORS FINAL E ROBUSTA
# ========================================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Permite qualquer origem
    allow_credentials=True,
    allow_methods=["*"],  # Permite todos os métodos
    allow_headers=["*"],  # Permite todos os cabeçalhos
)

# ========================================================================


@app.get("/")
def ping():
    return {"message": "ping"}


# Incluindo as rotas dos seus outros arquivos
app.include_router(ExpensesRouters.router)
app.include_router(UsersRoutes.router)
app.include_router(DashBoardRouter.router)
app.include_router(BudgetRouters.router)
