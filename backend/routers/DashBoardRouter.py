from fastapi import Depends, APIRouter
from sqlmodel import Session, select, func
from models.expenses import Expenses, Users, Budget
from db import engine
from utils.jwt import get_current_user
from datetime import date, timedelta

router = APIRouter()

@router.get("/dashboard/overview")
def get_dashboard_overview(current_user: Users = Depends(get_current_user)):
    """
    Fornece um overview completo para o dashboard, focado no mês atual.
    """
    with Session(engine) as session:
        today = date.today()
        start_of_month = today.replace(day=1)
        
        # --- 1. Resumo (Cards) ---
        # Gastos totais no mês atual
        total_spent_query = select(func.sum(Expenses.value)).where(
            Expenses.user_id == current_user.id,
            Expenses.expense_date >= start_of_month
        )
        total_spent = session.exec(total_spent_query).one_or_none() or 0

        # Orçamento total do usuário
        total_budget_query = select(func.sum(Budget.value)).where(Budget.user_id == current_user.id)
        total_budget = session.exec(total_budget_query).one_or_none() or 0

        # Principal categoria de gasto no mês
        top_category_query = (
            select(Expenses.category)
            .where(Expenses.user_id == current_user.id, Expenses.expense_date >= start_of_month)
            .group_by(Expenses.category)
            .order_by(func.sum(Expenses.value).desc())
        )
        top_category = session.exec(top_category_query).first() or "N/A"

        # --- 2. Gráfico de Barras (Gastos diários no mês) ---
        daily_spending_query = (
            select(
                func.extract('day', Expenses.expense_date).label('day'),
                func.sum(Expenses.value).label('value')
            )
            .where(Expenses.user_id == current_user.id, Expenses.expense_date >= start_of_month)
            .group_by(func.extract('day', Expenses.expense_date))
            .order_by(func.extract('day', Expenses.expense_date))
        )
        daily_spending = session.exec(daily_spending_query).all()
        
        # --- 3. Gráfico de Pizza (Distribuição no mês) ---
        category_distribution_query = (
            select(Expenses.category.label('name'), func.sum(Expenses.value).label('value'))
            .where(Expenses.user_id == current_user.id, Expenses.expense_date >= start_of_month)
            .group_by(Expenses.category)
        )
        category_distribution = session.exec(category_distribution_query).all()

        # --- 4. Orçamentos de Categoria (Gastos do mês vs Orçamento total) ---
        user_budgets_query = select(Budget.name_category, Budget.value).where(Budget.user_id == current_user.id)
        budget_map = {b.name_category: b.value for b in session.exec(user_budgets_query).all()}
        
        category_spending_query = (
            select(Expenses.category, func.sum(Expenses.value).label("total"))
            .where(Expenses.user_id == current_user.id, Expenses.expense_date >= start_of_month)
            .group_by(Expenses.category)
        )
        category_spending = {r.category: r.total for r in session.exec(category_spending_query).all()}

        category_budgets_overview = []
        for category_name, budget_value in budget_map.items():
            spent_value = category_spending.get(category_name, 0)
            category_budgets_overview.append({
                "category": category_name,
                "spent": spent_value,
                "budget": budget_value
            })

        return {
            "total_spent": total_spent,
            "total_budget": total_budget,
            "top_category": top_category,
            "daily_spending": daily_spending,
            "category_distribution": category_distribution,
            "category_budgets": category_budgets_overview,
        }