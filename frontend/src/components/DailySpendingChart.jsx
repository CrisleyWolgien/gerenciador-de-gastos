import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Componente para o Tooltip personalizado do novo gráfico
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-3 bg-dark-surface border border-dark-grid font-mono text-sm text-text-primary shadow-lg">
        <p className="font-bold text-base">
          {format(parseISO(label), 'PPP', { locale: ptBR })}
        </p>
        <p className="text-electric-green mt-2">
          Total Gasto:{" "}
          {payload[0].value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })}
        </p>
      </div>
    );
  }
  return null;
};

// Formata as datas no eixo X
const formatDateTick = (tickItem) => {
  return format(parseISO(tickItem), 'dd/MM');
};

const formatCurrencyTick = (tickItem) => {
    if (tickItem > 1000) {
        return `R$${(tickItem / 1000).toFixed(1)}k`
    }
    return `R$${tickItem}`;
}

function DailySpendingChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center font-mono text-text-secondary">
        // Sem dados de gastos diários para o período selecionado.
      </div>
    );
  }

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="1 1" stroke="rgba(110, 231, 183, 0.05)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatDateTick}
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: 'monospace' }}
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
          />
          <YAxis
            tickFormatter={formatCurrencyTick}
            tick={{ fill: "#9ca3af", fontSize: 12, fontFamily: 'monospace' }}
            tickLine={{ stroke: "#4b5563" }}
            axisLine={{ stroke: "#4b5563" }}
            width={80}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(110, 231, 183, 0.1)' }} />
          <Bar
            dataKey="total"
            name="Gasto Total"
            fill="#6EE7B7" // Cor "electric-green"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default DailySpendingChart;