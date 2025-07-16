import { useState, useEffect } from "react";
import { FiX, FiLoader, FiSave } from "react-icons/fi";

// O modal recebe a despesa a ser editada (expenseToEdit) e as funções de controle
function EditExpenseModal({ expenseToEdit, onClose, onSuccess }) {
  // Inicializa os estados com os dados da despesa que está sendo editada
  const [name, setName] = useState(expenseToEdit.name);
  const [description, setDescription] = useState(expenseToEdit.description);
  const [value, setValue] = useState(expenseToEdit.value);
  const [category, setCategory] = useState(expenseToEdit.category);

  // Estados para as categorias e feedback da API
  const [availableCategories, setAvailableCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Busca as categorias disponíveis quando o modal é montado
  useEffect(() => {
    const fetchCategories = async () => {
      const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${backendUrl}/budget/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Falha ao carregar categorias.");
        const data = await response.json();
        setAvailableCategories(data.categories || []);
      } catch (error) {
        console.error(error);
        setError("Não foi possível carregar as categorias.");
      }
    };
    fetchCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const updatedExpenseData = {
      name,
      description,
      value: parseFloat(value),
      category,
    };

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      // A requisição agora é PUT e inclui o ID da despesa na URL
      const response = await fetch(`${backendUrl}/expense/${expenseToEdit.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedExpenseData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao atualizar despesa.");
      }
      
      onSuccess(); // Avisa a página principal para atualizar a lista
      onClose();   // Fecha o modal

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fundo semi-transparente que cobre a tela
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-dark-panel/80 backdrop-blur-sm">
      {/* O painel do modal */}
      <div className="relative w-full max-w-lg bg-dark-panel border border-dark-grid rounded-none shadow-lg shadow-black/50">
        {/* Cabeçalho do Modal */}
        <div className="flex items-center justify-between p-4 border-b border-dark-grid">
          <h2 className="font-display text-2xl text-text-primary tracking-widest">EDITAR TRANSAÇÃO</h2>
          <button onClick={onClose} className="text-text-secondary hover:text-error">
            <FiX size={24} />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div>
            <label className="font-mono text-sm text-text-secondary uppercase">Nome</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid focus:border-data-blue focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="font-mono text-sm text-text-secondary uppercase">Descrição (Opcional)</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid focus:border-data-blue focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-sm text-text-secondary uppercase">Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid focus:border-data-blue focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="font-mono text-sm text-text-secondary uppercase">Categoria</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid focus:border-data-blue focus:outline-none"
                required
              >
                {availableCategories.map((catName) => (
                  <option key={catName} value={catName}>{catName}</option>
                ))}
              </select>
            </div>
          </div>
          
          {error && <p className="text-center font-mono text-error">{error}</p>}

          <div className="mt-4 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="w-full flex items-center justify-center p-3 font-display font-bold text-lg border-2 border-dark-grid text-text-secondary hover:border-text-primary hover:text-text-primary transition-colors"
            >
              CANCELAR
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-3 font-display font-bold text-lg bg-data-blue text-dark-panel hover:shadow-electric-glow transition-all duration-300 disabled:bg-dark-grid disabled:text-text-secondary"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiSave />}
              <span>{isLoading ? "SALVANDO..." : "SALVAR ALTERAÇÕES"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditExpenseModal;
