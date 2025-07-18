import { useState, useEffect } from "react";
import { FiDollarSign, FiBarChart2, FiTrendingUp } from "react-icons/fi";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import CategorySpendingChart from "../components/CategorySpendingChart";
import { DateRangePickerFuturista } from "../components/DateRangePickerFuturista";

function Dashboard() {
  const [stats, setStats] = useState({
    total_spent: 0,
    total_budget: 0,
    total_transactions: 0,
  });
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodo, setPeriodo] = useState("");

  useEffect(() => {
    // Atualiza o texto do período sempre que o dateRange mudar
    if (dateRange && dateRange.from && dateRange.to) {
      const fromFormatted = format(dateRange.from, "dd/MM/yy");
      const toFormatted = format(dateRange.to, "dd/MM/yy");
      setPeriodo(`${fromFormatted} - ${toFormatted}`);
    } else {
      // Fallback para caso o período não esteja completo
      setPeriodo(format(new Date(), "MMMM' de 'yyyy", { locale: ptBR }));
    }
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";

      // Constrói os parâmetros da query com base no dateRange
      const params = new URLSearchParams();
      if (dateRange.from) params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange.to) params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
      
      const queryString = params.toString();

      try {
        const [statsRes, categoryRes] = await Promise.all([
          fetch(`${backendUrl}/dashboard/stats?${queryString}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${backendUrl}/dashboard/expenses_by_category?${queryString}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!statsRes.ok || !categoryRes.ok) {
          throw new Error("Falha ao buscar dados do dashboard. Tente fazer login novamente.");
        }

        const statsData = await statsRes.json();
        const categoryData = await categoryRes.json();

        setStats(statsData);
        setCategoryExpenses(categoryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [dateRange]); // A requisição será refeita sempre que o dateRange mudar

  const spentPercentage =
    stats.total_budget > 0
      ? (stats.total_spent / stats.total_budget) * 100
      : 0;

  return (
    <div className="h-full w-full p-4 md:p-8 static-grid-bg">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
          DASHBOARD
        </h1>
        <p className="font-mono text-text-secondary mt-2">
          // Análise de gastos do período: <span className="text-electric-green">{periodo}</span>
        </p>
      </div>
      
      {/* Seletor de Data */}
      <div className="max-w-md mx-auto my-6 z-30 relative">
        <DateRangePickerFuturista 
          onRangeChange={setDateRange}
          initialRange={dateRange}
        />
      </div>

      {isLoading ? (
        <div className="text-center p-10 font-mono text-text-secondary">// Carregando dados...</div>
      ) : error ? (
        <div className="text-center p-10 font-mono text-error">// ERRO: {error}</div>
      ) : (
        <div className="flex flex-col gap-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <StatCard
              icon={<FiDollarSign />}
              title="Total Gasto"
              value={`R$ ${stats.total_spent.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="text-error"
            />
            <StatCard
              icon={<FiTrendingUp />}
              title="Orçamento Total"
              value={`R$ ${stats.total_budget.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
              color="text-success"
            />
            <StatCard
              icon={<FiBarChart2 />}
              title="Total de Transações"
              value={stats.total_transactions}
              color="text-data-blue"
            />
          </div>

          {/* Gráfico de Categorias */}
          <div className="bg-dark-panel/90 backdrop-blur-sm border border-dark-grid p-4 md:p-6">
            <h2 className="font-display text-xl text-text-primary tracking-wider mb-4">
              Gastos por Categoria
            </h2>
            {categoryExpenses.length > 0 ? (
               <CategorySpendingChart data={categoryExpenses} />
            ) : (
              <div className="h-64 flex items-center justify-center font-mono text-text-secondary">
                // Sem dados de categoria para o período selecionado.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Componente para os cards de estatísticas (pode ser movido para um arquivo separado se preferir)
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-dark-panel/90 backdrop-blur-sm border border-dark-grid p-6 flex items-center gap-6">
    <div className={`text-4xl ${color}`}>{icon}</div>
    <div>
      <p className="font-mono text-sm text-text-secondary uppercase">{title}</p>
      <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

export default Dashboard;