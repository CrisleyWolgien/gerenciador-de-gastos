import { useEffect, useState } from "react";
import { FiPlusCircle, FiLoader } from "react-icons/fi";

function New_entry() {
  // Estados para controlar os campos do formulário
  const [inputname, setInputName] = useState("");
  const [inputdiscription, setInputDiscription] = useState("");
  const [inputvalue, setInputValue] = useState("");
  
  // 1. Estados para as categorias dinâmicas
  const [availableCategories, setAvailableCategories] = useState([]);
  const [InputCategory, setInputCategory] = useState(""); // Começa vazio

  // Estados para controlar o feedback da API
  const [isLoading, setIsLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState({ message: "", type: "" });

  // 2. useEffect para buscar as categorias quando a página carrega
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
        
        // Define a primeira categoria da lista como padrão
        if (categories.length > 0) {
          setInputCategory(categories[0]);
        }
      } catch (error) {
        console.error("Erro ao buscar categorias:", error);
        setApiResponse({ message: "Erro ao carregar categorias.", type: "error" });
      }
    };
    fetchCategories();
  }, []); // O array vazio [] garante que isso rode apenas uma vez

  const create_entry = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setApiResponse({ message: "", type: "" });

    const expenseData = {
      name: inputname,
      description: inputdiscription, // Corrigido de 'discription' para 'description'
      category: InputCategory,
      value: parseFloat(inputvalue), // Converte o valor para número
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
      // Limpa o formulário
      setInputName("");
      setInputDiscription("");
      setInputValue("");
      
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
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
            <div>
              <label className="font-mono text-sm text-text-secondary uppercase">// Categoria</label>
              {/* 3. O SELECT AGORA É DINÂMICO */}
              <select
                required
                value={InputCategory}
                onChange={(e) => setInputCategory(e.target.value)}
                className="w-full mt-2 p-3 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
              >
                <option value="" disabled>Selecione...</option>
                {availableCategories.length > 0 ? (
                  availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))
                ) : (
                  <option disabled>Carregando categorias...</option>
                )}
              </select>
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
