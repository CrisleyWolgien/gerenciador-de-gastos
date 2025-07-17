from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ExpensesRouters, UsersRoutes, DashBoardRouter, BudgetRouters

app = FastAPI()

# ========================================================================
# CONFIGURAÇÃO DE CORS FINAL E ROBUSTA
# ========================================================================

# Lista de origens permitidas para fazer requisições à sua API.
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # Permite apenas as origens na lista acima
    allow_credentials=True,
    allow_methods=[
        "GET",
        "POST",
        "PUT",
        "DELETE",
        "OPTIONS",
    ],  # Seja explícito sobre os métodos
    allow_headers=[
        "Authorization",
        "Content-Type",
        "Accept",
    ],  # Seja explícito sobre os cabeçalhos
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
