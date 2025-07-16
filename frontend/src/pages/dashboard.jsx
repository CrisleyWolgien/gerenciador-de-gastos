import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { FiTrendingUp, FiTarget, FiStar } from "react-icons/fi";

// ========================================================================
// LÓGICA DE CORES PARA O DEGRADÊ
// ========================================================================
// Função auxiliar para interpolar entre duas cores RGB
const interpolateColor = (color1, color2, factor) => {
  let result = color1.slice();
  for (let i = 0; i < 3; i++) {
    result[i] = Math.round(result[i] + factor * (color2[i] - result[i]));
  }
  return `rgb(${result.join(", ")})`;
};

// Função principal que retorna a cor do degradê com base na porcentagem
const getProgressBarColor = (percentage) => {
  const green = [57, 255, 20]; // #39FF14
  const yellow = [255, 215, 0]; // #FFD700
  const red = [255, 51, 102]; // #FF3366

  if (percentage < 50) {
    // De 0% a 50%, vai de verde para amarelo
    return interpolateColor(green, yellow, percentage / 50);
  } else {
    // De 50% a 100%, vai de amarelo para vermelho
    return interpolateColor(yellow, red, (percentage - 50) / 50);
  }
};

// Componente para os cards de categoria individuais
const BudgetCategoryCard = ({ category, spent, budget }) => {
  const percentage = budget > 0 ? (spent / budget) * 100 : 0;

  const finalColor = getProgressBarColor(percentage);
  let pulseAnimation = "";

  if (percentage >= 100) {
    pulseAnimation = "animate-pulse";
  }

  return (
    <div className="bg-dark-panel border border-dark-grid p-4 flex flex-col justify-between">
      <div>
        <p className="font-mono text-sm text-text-secondary uppercase">
          {category}
        </p>
        <p className="font-display text-2xl text-text-primary mt-1">
          {spent.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="font-mono text-xs text-text-secondary">
          de{" "}
          {budget.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
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
        {/* CORREÇÃO: O texto da porcentagem agora sempre usa a cor secundária */}
        <p className="text-right font-mono text-xs mt-1 text-text-secondary">
          {Math.round(percentage)}%
        </p>
      </div>
    </div>
  );
};

// Componente de Tooltip customizado para o Gráfico de Pizza
const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-panel border border-dark-grid p-3 font-mono text-sm">
        <p className="text-text-secondary">{`${payload[0].name}`}</p>
        <p className="font-bold" style={{ color: payload[0].payload.fill }}>
          {`${payload[0].value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })} (${Math.round(payload[0].percent * 100)}%)`}
        </p>
      </div>
    );
  }
  return null;
};

function Dashboard() {
  const [pieActiveIndex, setPieActiveIndex] = useState(null);

  // Dados de exemplo (mock data)
  const [summary, setSummary] = useState({
    totalSpent: 2850.5,
    totalBudget: 4500.0,
    topCategory: "Alimentação",
  });

  const [dailySpending, setDailySpending] = useState([
    { day: "01/07", value: 150 },
    { day: "02/07", value: 75 },
    { day: "03/07", value: 230 },
    { day: "04/07", value: 120 },
    { day: "05/07", value: 90 },
    { day: "06/07", value: 145 },
    { day: "07/07", value: 300 },
  ]);

  const [categoryDistribution, setCategoryDistribution] = useState([
    { name: "Alimentação", value: 1200 },
    { name: "Transporte", value: 650 },
    { name: "Lazer", value: 500 },
    { name: "Moradia", value: 200 },
    { name: "Saúde", value: 200 },
    { name: "Outros", value: 100.5 },
  ]);

  const [categoryBudgets, setCategoryBudgets] = useState([
    { id: 1, category: "Alimentação", spent: 1200, budget: 1500 },
    { id: 2, category: "Transporte", spent: 650, budget: 600 }, // Exemplo estourado
    { id: 3, category: "Lazer", spent: 500, budget: 700 },
    { id: 4, category: "Moradia", spent: 200, budget: 1200 },
    { id: 5, category: "Saúde", spent: 180, budget: 200 }, // Exemplo em alerta
    { id: 6, category: "Outros", spent: 100.5, budget: 450 },
  ]);

  const COLORS = [
    "#00F6FF",
    "#FF00C1",
    "#A8FF00",
    "#8884d8",
    "#f2a600",
    "#ff5733",
  ];

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
            {/* CORREÇÃO: Usando a cor 'secondary' (magenta) do nosso tema */}
            <div className="p-3 bg-glitch-magenta/20 border border-glitch-magenta/50">
              <FiTrendingUp className="text-glitch-magenta" size={24} />
            </div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">
                Gasto Total (Mês)
              </p>
              <p className="font-display text-3xl text-text-primary">
                {summary.totalSpent.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-dark-panel border border-dark-grid p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-electric-green/20 border border-electric-green/50">
              <FiTarget className="text-electric-green" size={24} />
            </div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">
                Orçamento Total
              </p>
              <p className="font-display text-3xl text-electric-green">
                {summary.totalBudget.toLocaleString("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-dark-panel border border-dark-grid p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-data-blue/20 border border-data-blue/50">
              <FiStar className="text-data-blue" size={24} />
            </div>
            <div>
              <p className="font-mono text-sm text-text-secondary uppercase">
                Principal Categoria
              </p>
              <p className="font-display text-3xl text-text-primary">
                {summary.topCategory}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Seção de Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6">
        <div className="lg:col-span-3 bg-dark-panel border border-dark-grid p-6">
          <h3 className="font-display text-xl text-text-primary mb-4">
            FLUXO DE GASTOS DIÁRIOS
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={dailySpending}
              margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
            >
              <XAxis
                dataKey="day"
                stroke="var(--color-text-secondary)"
                tick={{ fontFamily: "var(--font-mono)" }}
              />
              <YAxis
                stroke="var(--color-text-secondary)"
                tick={{ fontFamily: "var(--font-mono)" }}
              />
              <Tooltip
                cursor={{ fill: "rgba(26, 26, 26, 0.8)" }}
                contentStyle={barTooltipStyle}
                labelStyle={barLabelStyle}
              />
              <Bar
                dataKey="value"
                fill="var(--color-electric-green)"
                barSize={20}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="lg:col-span-2 bg-dark-panel border border-dark-grid p-6">
          <h3 className="font-display text-xl text-text-primary mb-4">
            DISTRIBUIÇÃO POR CATEGORIA
          </h3>
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
                      opacity:
                        pieActiveIndex === null || pieActiveIndex === index
                          ? 1
                          : 0.4,
                      transform:
                        pieActiveIndex === index ? "scale(1.05)" : "scale(1)",
                    }}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomPieTooltip />} />
              <Legend
                wrapperStyle={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "0.8rem",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Seção de Orçamentos por Categoria */}
      <div className="mt-6">
        <h3 className="font-display text-xl text-text-primary mb-4">
          ACOMPANHAMENTO DE ORÇAMENTOS
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categoryBudgets.map((item) => (
            <BudgetCategoryCard
              key={item.id}
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
