import { useState, useEffect } from "react";
import { FiDollarSign, FiBarChart2, FiTrendingUp, FiAlertCircle } from "react-icons/fi";
import { format, startOfMonth, endOfMonth, parseISO } from "date-fns";
import { ptBR } from 'date-fns/locale';
import { DateRangePickerFuturista } from "../components/DateRangePickerFuturista";
import DailySpendingChart from "../components/DailySpendingChart"; // Importa o novo gráfico

// Componente do Card de Estatística (igual ao que você gostava)
const StatCard = ({ icon, title, value, color }) => (
  <div className="bg-dark-panel/90 backdrop-blur-sm border border-dark-grid p-6 flex items-center gap-6">
    <div className={`text-4xl ${color}`}>{icon}</div>
    <div>
      <p className="font-mono text-sm text-text-secondary uppercase">{title}</p>
      <p className={`font-display text-3xl font-bold ${color}`}>{value}</p>
    </div>
  </div>
);

// Componente da Barra de Progresso de Categoria (igual ao que você gostava)
const CategoryProgress = ({ category, total, budget, count }) => {
    const percentage = budget > 0 ? (total / budget) * 100 : 0;
    const isOverBudget = percentage > 100;
  
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-baseline">
          <p className="font-mono text-text-primary">{category} ({count})</p>
          <p className={`font-mono text-sm ${isOverBudget ? 'text-error' : 'text-text-secondary'}`}>
            <span className={isOverBudget ? 'font-bold' : 'text-text-primary'}>
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span> / {budget.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
        </div>
        <div className="w-full bg-dark-surface border border-dark-grid h-4 p-0.5">
          <div
            className={`h-full ${isOverBudget ? 'bg-error' : 'bg-success'}`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          ></div>
        </div>
      </div>
    );
};
  

function Dashboard() {
  const [stats, setStats] = useState({ total_spent: 0, total_budget: 0, total_transactions: 0 });
  const [categoryExpenses, setCategoryExpenses] = useState([]);
  const [dailySpending, setDailySpending] = useState([]); // Estado para o novo gráfico
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  });
  const [periodo, setPeriodo] = useState("");

  useEffect(() => {
    if (dateRange && dateRange.from && dateRange.to) {
      const fromFormatted = format(dateRange.from, "dd/MM/yy");
      const toFormatted = format(dateRange.to, "dd/MM/yy");
      setPeriodo(`${fromFormatted} - ${toFormatted}`);
    } else {
      setPeriodo(format(new Date(), "MMMM' de 'yyyy", { locale: ptBR }));
    }
  }, [dateRange]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";

      const params = new URLSearchParams();
      if (dateRange.from) params.append("start_date", format(dateRange.from, "yyyy-MM-dd"));
      if (dateRange.to) params.append("end_date", format(dateRange.to, "yyyy-MM-dd"));
      const queryString = params.toString();

      try {
        const [statsRes, categoryRes, dailySpendingRes] = await Promise.all([
          fetch(`${backendUrl}/dashboard/stats?${queryString}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/dashboard/expenses_by_category?${queryString}`, { headers: { Authorization: `Bearer ${token}` } }),
          fetch(`${backendUrl}/dashboard/spending_over_time?${queryString}`, { headers: { Authorization: `Bearer ${token}` } }), // Fetch para o novo gráfico
        ]);

        if (!statsRes.ok || !categoryRes.ok || !dailySpendingRes.ok) {
          throw new Error("Falha ao buscar dados do dashboard. Verifique sua conexão ou tente fazer login novamente.");
        }

        const statsData = await statsRes.json();
        const categoryData = await categoryRes.json();
        const dailyData = await dailySpendingRes.json();

        setStats(statsData);
        setCategoryExpenses(categoryData);
        setDailySpending(dailyData);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (dateRange.from && dateRange.to) {
        fetchData();
    }
  }, [dateRange]);

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
      
      <div className="max-w-md mx-auto my-6 z-30 relative">
        <DateRangePickerFuturista 
          onRangeChange={setDateRange}
          initialRange={dateRange}
        />
      </div>

      {isLoading ? (
        <div className="text-center p-10 font-mono text-text-secondary">// Carregando dados...</div>
      ) : error ? (
        <div className="max-w-3xl mx-auto text-center p-10 font-mono text-error bg-error/10 border border-error/50 flex flex-col items-center gap-4">
          <FiAlertCircle size={40} />
          <div>
            <p className="text-lg font-bold">// ERRO AO CARREGAR DADOS</p>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Coluna Principal (Gráficos e Stats) */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard icon={<FiDollarSign />} title="Total Gasto" value={`R$ ${stats.total_spent.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color="text-error" />
                <StatCard icon={<FiTrendingUp />} title="Orçamento Mensal" value={`R$ ${stats.total_budget.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} color="text-success" />
                <StatCard icon={<FiBarChart2 />} title="Nº de Transações" value={stats.total_transactions} color="text-data-blue" />
            </div>

            <div className="bg-dark-panel/90 backdrop-blur-sm border border-dark-grid p-4 md:p-6">
                <h2 className="font-display text-xl text-text-primary tracking-wider mb-4">Gastos por Dia</h2>
                <DailySpendingChart data={dailySpending} />
            </div>
          </div>
          
          {/* Coluna Lateral (Categorias) */}
          <div className="bg-dark-panel/90 backdrop-blur-sm border border-dark-grid p-4 md:p-6">
            <h2 className="font-display text-xl text-text-primary tracking-wider mb-6">Resumo por Categoria</h2>
            {categoryExpenses.length > 0 ? (
                <div className="flex flex-col gap-6">
                    {categoryExpenses.map(cat => <CategoryProgress key={cat.category} {...cat} />)}
                </div>
            ) : (
                <div className="h-full flex items-center justify-center font-mono text-text-secondary text-center">
                    // Nenhuma despesa encontrada para o período.
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;