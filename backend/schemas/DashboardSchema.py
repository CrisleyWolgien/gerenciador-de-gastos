from pydantic import BaseModel
from typing import List, Optional

class DailySpending(BaseModel):
    day: str
    value: float

class CategoryData(BaseModel):
    name: str
    value: float

class CategoryBudgetStatus(BaseModel):
    category: str
    spent: float
    budget: float

class DashboardOverview(BaseModel):
    total_spent: float
    total_budget: float
    top_category: Optional[str]
    daily_spending: List[DailySpending]
    category_distribution: List[CategoryData]
    category_budgets: List[CategoryBudgetStatus]