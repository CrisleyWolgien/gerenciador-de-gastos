import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
} from "recharts";

// Componente para o Tooltip personalizado
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-4 bg-dark-surface border border-dark-grid font-mono text-sm text-text-primary">
        <p className="font-bold border-b border-dark-grid pb-2 mb-2">{label}</p>
        <p className="text-error">
          Gasto:{" "}
          {data.total.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-success">
          Orçamento:{" "}
          {data.budget.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
        <p className="text-text-secondary">
          Transações: <span className="text-data-blue">{data.count}</span>
        </p>
      </div>
    );
  }
  return null;
};

// Formata os números no eixo Y para o formato de moeda
const formatCurrency = (tickItem) => {
  return `R$${tickItem.toLocaleString("pt-BR")}`;
};

function CategorySpendingChart({ data }) {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{
            top: 5,
            right: 20,
            left: 50, // Aumenta o espaço para o eixo Y
            bottom: 5,
          }}
          barGap={10}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(110, 231, 183, 0.1)" />
          <XAxis 
            dataKey="category" 
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: 'monospace' }} 
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <YAxis
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: 'monospace' }}
            tickFormatter={formatCurrency}
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(110, 231, 183, 0.05)' }} />
          <Legend
            wrapperStyle={{ fontSize: "14px", fontFamily: 'monospace', paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: '#d1d5db' }}>{value}</span>}
          />
          <Bar
            dataKey="total"
            name="Gasto Total"
            fill="#EF4444" // Cor para 'error'
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Bar
            dataKey="budget"
            name="Orçamento"
            fill="#22C55E" // Cor para 'success'
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default CategorySpendingChart;