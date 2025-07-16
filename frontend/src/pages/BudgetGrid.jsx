import { useState, useEffect } from "react";
import { FiPlusCircle, FiEdit, FiTrash2, FiLoader } from "react-icons/fi";

function BudgetGrid() {
  // Estados para os dados da API
  const [budgets, setBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para o formulário de criação
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryValue, setNewCategoryValue] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Função para buscar os orçamentos do usuário
  const fetchBudgets = async () => {
    setIsLoading(true);
    setError(null);
    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      // Assumindo que você criará uma rota GET /budgets para listar todos
      const response = await fetch(`${backendUrl}/budgets`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao buscar orçamentos.");
      }
      const data = await response.json();
      setBudgets(data);
    } catch (err) {
      setError(err.message);
      setBudgets([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Busca os dados iniciais quando o componente é montado
  useEffect(() => {
    fetchBudgets();
  }, []);

  // Função para criar um novo orçamento
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${backendUrl}/budget`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name_category: newCategoryName,
          value: parseFloat(newCategoryValue)
        })
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao criar orçamento.");
      }
      // Limpa o formulário e busca os dados atualizados
      setNewCategoryName("");
      setNewCategoryValue("");
      fetchBudgets();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Função para deletar um orçamento
  const handleDelete = async (budgetId) => {
    if (!window.confirm("Tem certeza que deseja excluir esta categoria de orçamento?")) {
      return;
    }
    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");
    try {
        const response = await fetch(`${backendUrl}/budget/${budgetId}/delete`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if(!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Falha ao excluir orçamento.");
        }
        fetchBudgets();
    } catch (err) {
        alert(err.message);
    }
  };


  return (
    <div className="h-full w-full p-4 md:p-8 static-grid-bg">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
          BUDGET_GRID
        </h1>
      </div>

      {/* Formulário de Criação */}
      <div className="mt-6 max-w-4xl mx-auto p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid">
        <form onSubmit={handleCreateBudget} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="font-mono text-sm text-text-secondary uppercase">Nova Categoria</label>
            <input 
              type="text"
              placeholder="Ex: Alimentação, Lazer..."
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
              required
            />
          </div>
          <div>
            <label className="font-mono text-sm text-text-secondary uppercase">Orçamento (R$)</label>
            <input 
              type="number"
              step="0.01"
              placeholder="0.00"
              value={newCategoryValue}
              onChange={(e) => setNewCategoryValue(e.target.value)}
              className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-10 flex items-center justify-center gap-2 font-display font-bold text-lg bg-electric-green text-dark-panel hover:shadow-electric-glow transition-all duration-300 disabled:bg-dark-grid disabled:text-text-secondary"
            >
              {isSubmitting ? <FiLoader className="animate-spin"/> : <FiPlusCircle />}
              <span>{isSubmitting ? "" : "CRIAR"}</span>
            </button>
          </div>
        </form>
        {error && <p className="text-center font-mono text-error mt-4">{error}</p>}
      </div>

      {/* Grid de Orçamentos */}
      <div className="mt-8 max-w-4xl mx-auto">
        {isLoading ? (
          <div className="text-center p-10 text-text-secondary font-mono">// Carregando grid de orçamentos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="bg-dark-panel border border-dark-grid p-4 flex flex-col justify-between">
                <div>
                  <p className="font-mono text-sm text-text-secondary uppercase">Categoria</p>
                  <p className="font-display text-2xl text-text-primary">{budget.name_category}</p>
                </div>
                <div className="mt-4">
                  <p className="font-mono text-sm text-text-secondary uppercase">Orçamento Mensal</p>
                  <p className="font-display text-2xl text-electric-green">
                    {budget.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                <div className="flex justify-end gap-2 mt-4 border-t border-dark-grid pt-3">
                  <button className="p-2 text-text-secondary hover:text-data-blue"><FiEdit /></button>
                  <button onClick={() => handleDelete(budget.id)} className="p-2 text-text-secondary hover:text-error"><FiTrash2 /></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BudgetGrid;
