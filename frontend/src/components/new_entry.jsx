import { useEffect, useState } from "react";
import { FiPlusCircle, FiLoader } from "react-icons/fi";
import { CustomSelect } from "../components/CustomSelect";
import { format } from "date-fns"; // Importar a função de formatação

function New_entry() {
  const [inputname, setInputName] = useState("");
  const [inputdiscription, setInputDiscription] = useState("");
  const [inputvalue, setInputValue] = useState("");
  const [inputDate, setInputDate] = useState(format(new Date(), 'yyyy-MM-dd')); // Estado para a data
  const [availableCategories, setAvailableCategories] = useState([]);
  const [InputCategory, setInputCategory] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState({ message: "", type: "" });

  useEffect(() => {
    const fetchCategories = async () => {
      const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
      const token = localStorage.getItem("token");
      try {
        const response = await fetch(`${backendUrl}/budget/categories`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) {
          throw new Error("Falha ao carregar categorias.");
        }
        const data = await response.json();
        const categories = data.categories || [];
        setAvailableCategories(categories);
        
        if (categories.length > 0) {
          setInputCategory(categories[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setApiResponse({ message: "Erro ao carregar categorias.", type: "error" });
      }
    };
    fetchCategories();
  }, []);

  const create_entry = async (e) => {
    e.preventDefault();
    if (!InputCategory) {
      setApiResponse({ message: "Por favor, selecione uma categoria.", type: "error" });
      return;
    }
    setIsLoading(true);
    setApiResponse({ message: "", type: "" });

    const expenseData = {
      name: inputname,
      description: inputdiscription,
      category: InputCategory,
      value: parseFloat(inputvalue),
      expense_date: inputDate, // Enviar a data para a API
    };

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${backendUrl}/expenses`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(expenseData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Erro desconhecido");
      }
      
      setApiResponse({ message: data.message || "Entrada registrada!", type: "success" });
      setInputName("");
      setInputDiscription("");
      setInputValue("");
      setInputDate(format(new Date(), 'yyyy-MM-dd')); // Resetar a data
      
      setTimeout(() => setApiResponse({ message: "", type: "" }), 3000);

    } catch (error) {
      setApiResponse({ message: error.message, type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-full w-full p-4 md:p-8 static-grid-bg">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
          NEW_ENTRY
        </h1>
      </div>

      <div className="mt-6 max-w-2xl mx-auto p-6 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid">
        <form onSubmit={create_entry} className="flex flex-col gap-6">
          
          <div>
            <label className="font-mono text-sm text-text-secondary uppercase">// Nome da Transação</label>
            <input
              type="text"
              required
              value={inputname}
              onChange={(e) => setInputName(e.target.value)}
              placeholder="Ex: Jantar com a equipe"
              className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none placeholder:text-text-secondary/50"
            />
          </div>

          <div>
            <label className="font-mono text-sm text-text-secondary uppercase">// Descrição (Opcional)</label>
            <input
              type="text"
              value={inputdiscription}
              onChange={(e) => setInputDiscription(e.target.value)}
              placeholder="Ex: Projeto de final de ano"
              className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none placeholder:text-text-secondary/50"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <label className="font-mono text-sm text-text-secondary uppercase">// Data</label>
              <input
                type="date"
                value={inputDate}
                onChange={(e) => setInputDate(e.target.value)}
                required
                className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
              />
            </div>
            <div className="md:col-span-1">
              <label className="font-mono text-sm text-text-secondary uppercase">// Valor (R$)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                value={inputvalue}
                onChange={(e) => setInputValue(e.target.value)}
                required
                className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none placeholder:text-text-secondary/50"
              />
            </div>
            <div className="md:col-span-1">
              <label className="font-mono text-sm text-text-secondary uppercase">// Categoria</label>
              <CustomSelect
                options={availableCategories}
                value={InputCategory}
                onChange={setInputCategory}
                placeholder="Selecione..."
              />
            </div>
          </div>

          {apiResponse.message && (
            <div className={`text-center font-mono p-2 border ${
                apiResponse.type === 'error' 
                ? 'text-error bg-error/10 border-error/50' 
                : 'text-success bg-success/10 border-success/50'
            }`}>
              {apiResponse.message}
            </div>
          )}

          <div className="mt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 p-3 font-display font-bold text-lg bg-electric-green text-dark-panel hover:shadow-electric-glow transition-all duration-300 disabled:bg-dark-grid disabled:text-text-secondary disabled:cursor-not-allowed"
            >
              {isLoading ? <FiLoader className="animate-spin" /> : <FiPlusCircle />}
              <span>{isLoading ? "PROCESSANDO..." : "COMMIT ENTRY"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default New_entry;