from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import ExpensesRouters, UsersRoutes,DashBoardRouter,BudgetRouters



app = FastAPI()

# Allow CORS for all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allows all headers
)

@app.get("/")
def ping():
    return {"message": "ping" }

app.include_router(ExpensesRouters.router)
app.include_router(UsersRoutes.router)
app.include_router(DashBoardRouter.router)
app.include_router(BudgetRouters.router)