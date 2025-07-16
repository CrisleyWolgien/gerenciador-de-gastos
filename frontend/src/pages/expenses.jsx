import { useState, useEffect } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { DateRangePickerFuturista } from "../components/DateRangePickerFuturista";
import { format, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import { ptBR } from "date-fns/locale";
import EditExpenseModal from "../components/EditExpenseModal";
import { CustomSelect } from "../components/CustomSelect";

function Expenses() {
  // Estados para os dados da API
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableCategories, setAvailableCategories] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  // Estados para o painel de resumo e filtros
  const [quantiaDeDespesa, setQuantiaDeDespesa] = useState("0");
  const [somaTotalDeDespesas, setSomaTotalDeDespesas] = useState("0,00");
  const [periodo, setPeriodo] = useState(
    format(new Date(), "MMMM' de 'yyyy", { locale: ptBR })
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  // O estado 'isDatePickerOpen' não é mais necessário aqui.

  // Função para buscar os dados da API
  const fetchExpenses = async () => {
    setIsLoading(true);
    setError(null);

    const params = new URLSearchParams();
    if (dateRange.from)
      params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
    if (dateRange.to)
      params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
    if (searchTerm) params.append("search", searchTerm);
    if (selectedCategory && selectedCategory !== "Todas")
      params.append("category", selectedCategory);

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${backendUrl}/expenses?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao buscar dados.");
      }

      const data = await response.json();
      setExpenses(data);
      setQuantiaDeDespesa(data.length);
      const total = data.reduce((sum, expense) => sum + expense.value, 0);
      setSomaTotalDeDespesas(
        total.toLocaleString("pt-BR", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      );
    } catch (err) {
      setError(err.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }
  };

  // useEffect para buscar as categorias dinamicamente
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
        console.error("Erro ao buscar categorias:", error);
      }
    };
    fetchCategories();
  }, []);

  // useEffect para buscar as despesas sempre que um filtro mudar
  useEffect(() => {
    fetchExpenses();
  }, [dateRange, searchTerm, selectedCategory]);

  // Atualiza o texto do período exibido no painel
  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      const fromFormatted = format(dateRange.from, "dd/MM/yy");
      const toFormatted = format(dateRange.to, "dd/MM/yy");
      setPeriodo(`${fromFormatted} - ${toFormatted}`);
    } else {
      setPeriodo("Todos os Períodos");
    }
  }, [dateRange]);

  // Função segura para formatar a data na tabela
  const formatarDataSegura = (dateString) => {
    if (!dateString) return "---";
    const data = parseISO(dateString);
    return isValid(data) ? format(data, "dd/MM/yyyy") : "Inválida";
  };

  // Função para deletar uma despesa
  const handleDelete = async (expenseId) => {
    if (
      !window.confirm(
        "Tem certeza que deseja excluir esta transação? Esta ação não pode ser desfeita."
      )
    ) {
      return;
    }

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(
        `${backendUrl}/expense/${expenseId}/delete`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Falha ao excluir despesa.");
      }

      fetchExpenses();
    } catch (error) {
      alert(error.message);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center p-10 text-text-secondary font-mono">
          // Carregando dados...
        </div>
      );
    }
    if (error) {
      return (
        <div className="text-center p-10 text-error font-mono">
          // ERRO: {error}
        </div>
      );
    }
    if (expenses.length === 0) {
      return (
        <div className="text-center p-10 text-text-secondary font-mono">
          // Nenhuma transação encontrada.
        </div>
      );
    }
    return (
      <>
        <table className="hidden md:table w-full text-left font-mono">
          <thead className="border-b border-dark-grid">
            <tr>
              <th className="p-4 text-sm text-text-secondary uppercase">
                Data
              </th>
              <th className="p-4 text-sm text-text-secondary uppercase">
                Transação
              </th>
              <th className="p-4 text-sm text-text-secondary uppercase">
                Categoria
              </th>
              <th className="p-4 text-sm text-text-secondary uppercase text-right">
                Valor
              </th>
              <th className="p-4 text-sm text-text-secondary uppercase text-center">
                Ações
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((expense) => (
              <tr
                key={expense.id}
                className="border-b border-dark-grid last:border-none hover:bg-dark-surface/50"
              >
                <td className="p-4 text-text-primary whitespace-nowrap">
                  {formatarDataSegura(expense.date_created)}
                </td>
                <td className="p-4">
                  <p className="text-text-primary font-bold">{expense.name}</p>
                  {expense.description && (
                    <p className="text-text-secondary text-xs mt-1">
                      {expense.description}
                    </p>
                  )}
                </td>
                <td className="p-4 text-text-secondary">{expense.category}</td>
                <td className="p-4 text-electric-green text-right font-bold">
                  {expense.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </td>
                <td className="p-4 text-text-secondary text-center">
                  <div className="flex justify-center gap-4">
                    <button
                      onClick={() => setEditingExpense(expense)}
                      className="hover:text-data-blue transition-transform hover:scale-110"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="hover:text-error transition-transform hover:scale-110"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="md:hidden flex flex-col gap-4 p-4">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-dark-surface border border-dark-grid p-4 flex flex-col gap-3"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-text-primary font-bold text-lg">
                    {expense.name}
                  </p>
                  <p className="text-text-secondary text-xs">
                    {expense.description}
                  </p>
                </div>
                <p className="text-electric-green text-lg font-bold whitespace-nowrap">
                  {expense.value.toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  })}
                </p>
              </div>
              <div className="flex justify-between items-center text-sm border-t border-dark-grid pt-3">
                <div className="flex flex-col">
                  <span className="text-text-secondary">
                    {expense.category}
                  </span>
                  <span className="text-text-primary">
                    {formatarDataSegura(expense.date_created)}
                  </span>
                </div>
                <div className="flex gap-4 text-xl">
                  <button
                    onClick={() => setEditingExpense(expense)}
                    className="text-text-secondary hover:text-data-blue"
                  >
                    <FiEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(expense.id)}
                    className="text-text-secondary hover:text-error"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  };

  return (
    <>
      {editingExpense && (
        <EditExpenseModal
          expenseToEdit={editingExpense}
          onClose={() => setEditingExpense(null)}
          onSuccess={() => {
            setEditingExpense(null);
            fetchExpenses();
          }}
        />
      )}

      <div className="h-full w-full p-4 md:p-8 static-grid-bg">
        <div className="text-center py-4">
          <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
            TRANSACTIONS
          </h1>
        </div>

        <div className="mt-2">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid">
            <div className="text-center sm:text-left">
              <p className="font-mono text-sm text-text-secondary uppercase">
                Período Selecionado
              </p>
              <p className="font-display text-xl text-text-primary capitalize">
                {periodo}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-mono text-sm text-text-secondary">
                TRANSAÇÕES
              </p>
              <p className="font-display text-xl text-text-primary">
                {quantiaDeDespesa}
              </p>
            </div>
            <div className="text-center sm:text-right">
              <p className="font-mono text-sm text-text-secondary">
                TOTAL GASTO
              </p>
              <p className="font-display text-2xl text-electric-green">
                R$ {somaTotalDeDespesas}
              </p>
            </div>
          </div>
        </div>

        {/* CORREÇÃO: Adicionado 'relative' e um 'z-index' fixo para o painel de filtros */}
        <div className="relative mt-6 p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid z-20">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div className="md:col-span-2">
              <label className="font-mono text-sm text-text-secondary">
                BUSCAR
              </label>
              <div className="relative mt-2">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  placeholder="Buscar por nome ou descrição..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
                />
              </div>
            </div>
            <div>
              <label className="font-mono text-sm text-text-secondary">
                CATEGORIA
              </label>
              <CustomSelect
                options={["Todas", ...availableCategories]}
                value={selectedCategory}
                onChange={setSelectedCategory}
                placeholder="Todas"
              />
            </div>
            <div>
              <label className="font-mono text-sm text-text-secondary">
                PERÍODO
              </label>
              <DateRangePickerFuturista
                onRangeChange={setDateRange}
                initialRange={dateRange}
                // Não precisamos mais das funções onOpen/onClose aqui
              />
            </div>
          </div>
        </div>

        {/* CORREÇÃO: Adicionado 'relative' e um 'z-index' menor para a tabela */}
        <div className="relative mt-6 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid z-10">
          <div className="overflow-x-auto">{renderContent()}</div>
        </div>
      </div>
    </>
  );
}

export default Expenses;
