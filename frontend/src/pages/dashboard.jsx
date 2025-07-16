import { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { FiTrendingUp, FiTarget, FiStar, FiLoader } from "react-icons/fi";
import { format, startOfMonth, endOfMonth } from 'date-fns';

// ========================================================================
// LÓGICA DE CORES PARA O DEGRADÊ
// ========================================================================
const interpolateColor = (color1, color2, factor) => {
    let result = color1.slice();
    for (let i = 0; i < 3; i++) {
        result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
    }
    return `rgb(${result.join(', ')})`;
};

const getProgressBarColor = (percentage) => {
    const green = [57, 255, 20];    // #39FF14
    const yellow = [255, 215, 0];   // #FFD700
    const red = [255, 51, 102];     // #FF3366

    if (percentage < 50) {
        return interpolateColor(green, yellow, percentage / 50);
    } else {
        return interpolateColor(yellow, red, (percentage - 50) / 50);
    }
};

const BudgetCategoryCard = ({ category, spent, budget }) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;
  const finalColor = getProgressBarColor(percentage);
  const pulseAnimation = percentage >= 100 ? "animate-pulse" : "";

  return (
    <div className="bg-dark-panel border border-dark-grid p-4 flex flex-col justify-between">
      <div>
        <p className="font-mono text-sm text-text-secondary uppercase">{category}</p>
        <p className="font-display text-2xl text-text-primary mt-1">
          {spent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
        <p className="font-mono text-xs text-text-secondary">
          de {budget.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
        </p>
      </div>
      <div className="mt-4">
        <div className="w-full bg-dark-grid h-2">
          <div
            className={`h-2 ${pulseAnimation} transition-colors duration-500`}
            style={{
              backgroundColor: finalColor,
              width: `${Math.min(percentage, 100)}%`,
            }}
          ></div>
        </div>
        <p className="text-right font-mono text-xs mt-1 text-text-secondary">
          {Math.round(percentage)}%
        </p>
      </div>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-panel border border-dark-grid p-3 font-mono text-sm">
        <p className="text-text-secondary">{`${payload[0].name}`}</p>
        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
          {`${payload[0].value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} (${Math.round(payload[0].percent * 100)}%)`}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  // Estados para os dados da API, inicializados como vazios/padrão
  const [summary, setSummary] = useState({ totalSpent: 0, totalBudget: 0, topCategory: "N/A" });
  const [dailySpending, setDailySpending] = useState([]);
  const [categoryDistribution, setCategoryDistribution] = useState([]);
  const [categoryBudgets, setCategoryBudgets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [pieActiveIndex, setPieActiveIndex] = useState(null);
  const COLORS = ["#00F6FF", "#FF00C1", "#A8FF00", "#8884d8", "#f2a600", "#ff5733"];

  // useEffect para buscar todos os dados do dashboard de uma vez
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      
      const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
      const token = localStorage.getItem("token");

      try {
        const response = await fetch(`${backendUrl}/dashboard/overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.detail || "Falha ao carregar dados do dashboard.");
        }

        const data = await response.json();
        
        // Atualiza todos os estados com os dados da API
        setSummary({
          totalSpent: data.total_spent,
          totalBudget: data.total_budget,
          topCategory: data.top_category,
        });
        setDailySpending(data.daily_spending);
        setCategoryDistribution(data.category_distribution);
        setCategoryBudgets(data.category_budgets);

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // O array vazio [] garante que isso rode apenas uma vez ao montar a página

  // Estilo customizado para o Tooltip do gráfico de barras
  const barTooltipStyle = {
    backgroundColor: "var(--color-dark-panel)",
    border: "1px solid var(--color-dark-grid)",
    fontFamily: "var(--font-mono)",
    color: "var(--color-text-primary)",
  };
  const barLabelStyle = {
    color: "var(--color-text-secondary)",
  };
  
  // Renderização condicional para loading e erro
  if (isLoading) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 static-grid-bg">
            <FiLoader className="animate-spin text-electric-green" size={48} />
            <p className="font-mono text-text-secondary">// Carregando overview do sistema...</p>
        </div>
    );
  }

  if (error) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center gap-4 p-8 static-grid-bg">
            <p className="font-mono text-error text-center">// ERRO DE CONEXÃO<br/>{error}</p>
        </div>
    );
  }

  return (
    <div className="h-full w-full p-4 md:p-8 static-grid-bg">
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
          SYSTEM_OVERVIEW
        </h1>
      </div>

      {/* 1. Painel de Resumo Principal */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <div className="bg-dark-panel border border-dark-grid p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-secondary/20 border border-secondary/50">
              <FiTrendingUp className="text-secondary" size={24} />
            </div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">Gasto Total (Mês)</p>
              <p className="font-display text-3xl text-text-primary">{summary.totalSpent.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-panel border border-dark-grid p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-electric-green/20 border border-electric-green/50"><FiTarget className="text-electric-green" size={24} /></div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">Orçamento Total</p>
              <p className="font-display text-3xl text-electric-green">{summary.totalBudget.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}</p>
            </div>
          </div>
        </div>
        <div className="bg-dark-panel border border-dark-grid p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-data-blue/20 border border-data-blue/50"><FiStar className="text-data-blue" size={24} /></div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">Principal Categoria</p>
              <p className="font-display text-3xl text-text-primary">{summary.topCategory}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-3 bg-dark-panel border border-dark-grid p-6">
          <h3 className="font-display text-xl text-text-primary mb-4">FLUXO DE GASTOS DIÁRIOS</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={dailySpending} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
              <XAxis dataKey="day" stroke="var(--color-text-secondary)" tick={{ fontFamily: "var(--font-mono)" }} />
              <YAxis stroke="var(--color-text-secondary)" tick={{ fontFamily: "var(--font-mono)" }} />
              <Tooltip
                cursor={{ fill: "rgba(26, 26, 26, 0.8)" }}
                contentStyle={barTooltipStyle}
                labelStyle={barLabelStyle}
              />
              <Bar dataKey="value" fill="var(--color-electric-green)" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-dark-panel border border-dark-grid p-6">
          <h3 className="font-display text-xl text-text-primary mb-4">DISTRIBUIÇÃO POR CATEGORIA</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                fill="#8884d8"
                paddingAngle={5}
                labelLine={false}
                onMouseEnter={(_, index) => setPieActiveIndex(index)}
                onMouseLeave={() => setPieActiveIndex(null)}
              >
                {categoryDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    style={{
                      transition: "opacity 0.2s, transform 0.2s",
                      opacity: pieActiveIndex === null || pieActiveIndex === index ? 1 : 0.4,
                      transform: pieActiveIndex === index ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Seção de Orçamentos por Categoria */}
      <div className="mt-6">
        <h3 className="font-display text-xl text-text-primary mb-4">ACOMPANHAMENTO DE ORÇAMENTOS</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((item) => (
            <BudgetCategoryCard
              key={item.category} // Usando a categoria como chave, já que deve ser única
              category={item.category}
              spent={item.spent}
              budget={item.budget}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
