import { useState, useEffect } from "react";
import { FiSearch, FiEdit, FiTrash2 } from "react-icons/fi";
import { DateRangePickerFuturista } from "../components/DatePickerFuturista";
import { format, startOfMonth, endOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";

function Expenses() {
  const [expenses, setExpenses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);

  const fetchExpenses = async (range, search, category) => {
    setIsLoading(true);
    setError(null);
    
    const params = new URLSearchParams();
    if (range.from) params.append("start_date", range.from.toISOString());
    if (range.to) params.append("end_date", range.to.toISOString());
    if (search) params.append("search", search);
    if (category && category !== "Todas") params.append("category", category);

    const backendUrl = "https://gerenciador-de-gastos-42k3.onrender.com";
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${backendUrl}/expenses?${params.toString()}`, {
        headers: {
            'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Falha ao buscar dados.");
      }

      const data = await response.json();
      setExpenses(data);
      
      setQuantiaDeDespesa(data.length);
      const total = data.reduce((sum, expense) => sum + expense.value, 0);
      setSomaTotalDeDespesas(total.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));

    } catch (err) {
      setError(err.message);
      setExpenses([]);
    } finally {
      setIsLoading(false);
    }

    if (range && range.from && range.to) {
      const fromFormatted = format(range.from, "dd/MM/yy");
      const toFormatted = format(range.to, "dd/MM/yy");
      setPeriodo(`${fromFormatted} - ${toFormatted}`);
    } else {
      setPeriodo("Todos os Períodos");
    }
  };

  useEffect(() => {
    fetchExpenses(dateRange, searchTerm, selectedCategory);
  }, [dateRange, searchTerm, selectedCategory]);

  return (
    <div className="h-full w-full p-4 md:p-8 static-grid-bg">
      
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-display text-text-primary tracking-widest animate-glitch">
          TRANSACTIONS
        </h1>
      </div>

      <div className="mt-2">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid">
          <div className="text-center sm:text-left">
            <p className="font-mono text-sm text-text-secondary uppercase">Período Selecionado</p>
            <p className="font-display text-xl text-text-primary capitalize">{periodo}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-sm text-text-secondary">TRANSAÇÕES</p>
            <p className="font-display text-xl text-text-primary">{quantiaDeDespesa}</p>
          </div>
          <div className="text-center sm:text-right">
            <p className="font-mono text-sm text-text-secondary">TOTAL GASTO</p>
            <p className="font-display text-2xl text-electric-green">R$ {somaTotalDeDespesas}</p>
          </div>
        </div>
      </div>

      <div className={`relative mt-6 p-4 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid ${isDatePickerOpen ? 'z-20' : 'z-10'}`}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="font-mono text-sm text-text-secondary">BUSCAR</label>
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
            <label className="font-mono text-sm text-text-secondary">CATEGORIA</label>
            <select 
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
            >
              <option>Todas</option>
              <option>Alimentação</option>
              <option>Transporte</option>
              <option>Educação</option>
              <option>Lazer</option>
              <option>Outros</option>
            </select>
          </div>
          <div>
             <label className="font-mono text-sm text-text-secondary">PERÍODO</label>
             <DateRangePickerFuturista 
                onRangeChange={setDateRange} 
                initialRange={dateRange}
                onOpen={() => setIsDatePickerOpen(true)}
                onClose={() => setIsDatePickerOpen(false)}
             />
          </div>
        </div>
      </div>

      <div className={`relative mt-6 bg-dark-panel/90 backdrop-blur-sm border border-dark-grid ${isDatePickerOpen ? 'z-0' : 'z-10'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono">
            <thead className="border-b border-dark-grid">
              <tr>
                <th className="p-4 text-sm text-text-secondary uppercase">Data</th>
                <th className="p-4 text-sm text-text-secondary uppercase">Descrição</th>
                <th className="p-4 text-sm text-text-secondary uppercase">Categoria</th>
                <th className="p-4 text-sm text-text-secondary uppercase text-right">Valor</th>
                <th className="p-4 text-sm text-text-secondary uppercase text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan="5" className="text-center p-10 text-text-secondary">
                    // Carregando dados da rede neural...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="text-center p-10 text-error">
                    // ERRO DE CONEXÃO: {error}
                  </td>
                </tr>
              ) : expenses.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center p-10 text-text-secondary">
                    // Nenhuma transação encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-dark-grid last:border-none hover:bg-dark-surface/50">
                    <td className="p-4 text-text-primary whitespace-nowrap">
                      {format(new Date(expense.date), 'dd/MM/yyyy')}
                    </td>
                    <td className="p-4 text-text-primary">{expense.name}</td>
                    <td className="p-4 text-text-secondary">{expense.category}</td>
                    <td className="p-4 text-electric-green text-right font-bold">
                      {expense.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-4 text-text-secondary text-center">
                      <div className="flex justify-center gap-4">
                        <button className="hover:text-data-blue"><FiEdit size={18} /></button>
                        <button className="hover:text-error"><FiTrash2 size={18} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Expenses;