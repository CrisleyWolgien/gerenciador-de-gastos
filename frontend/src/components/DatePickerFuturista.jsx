import { useState } from 'react';
import { format, addMonths, subMonths, getDaysInMonth, startOfMonth, getDay, isAfter, isBefore, isEqual } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export const DateRangePickerFuturista = ({ onRangeChange, initialRange, onOpen, onClose }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [range, setRange] = useState(initialRange || { from: null, to: null });
  const [isOpen, setIsOpen] = useState(false);

  const handleDayClick = (day) => {
    const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);

    if (!range.from || range.to) {
      setRange({ from: clickedDate, to: null });
    } else if (isAfter(clickedDate, range.from)) {
      const newRange = { from: range.from, to: clickedDate };
      setRange(newRange);
      onRangeChange(newRange);
      setIsOpen(false);
      if (onClose) onClose(); // Chama a função onClose
    } else {
      setRange({ from: clickedDate, to: null });
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    if (onOpen) onOpen(); // Chama a função onOpen
  };

  const handleBlur = (e) => {
    // Pequeno delay para dar tempo do DayPicker registrar o clique
    setTimeout(() => {
      if (!e.currentTarget.contains(document.activeElement)) {
        setIsOpen(false);
        if (onClose) onClose(); // Chama a função onClose
      }
    }, 100);
  };

  const headerText = format(currentDate, 'MMMM године', { locale: ptBR }); // Corrigi o erro de digitação aqui
  const daysOfWeek = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
  const firstDayOfMonth = getDay(startOfMonth(currentDate));

  const renderDays = () => {
    const days = [];
    const daysInMonth = getDaysInMonth(currentDate);

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="w-10 h-10"></div>);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i);
      const isFrom = range.from && isEqual(date, range.from);
      const isTo = range.to && isEqual(date, range.to);
      const isInRange = range.from && range.to && isAfter(date, range.from) && isBefore(date, range.to);

      let dayClass = 'text-text-secondary hover:border-electric-green';
      if (isFrom || isTo) {
        dayClass = 'bg-electric-green text-dark-panel font-bold shadow-electric-glow';
      } else if (isInRange) {
        dayClass = 'bg-electric-green/20 text-text-primary';
      }

      days.push(
        <button
          key={i}
          onClick={() => handleDayClick(i)}
          className={`w-10 h-10 flex items-center justify-center font-mono text-sm transition-all duration-200 border border-transparent ${dayClass}`}
        >
          {i}
        </button>
      );
    }
    return days;
  };

  const inputValue = () => {
    if (range.from && range.to) {
      return `${format(range.from, 'dd/MM/yy')} - ${format(range.to, 'dd/MM/yy')}`;
    }
    if (range.from) {
      return `${format(range.from, 'dd/MM/yy')} - ...`;
    }
    return '';
  };

  return (
    <div className="relative" onBlur={handleBlur}>
      <input
        type="text"
        readOnly
        onFocus={handleInputFocus}
        value={inputValue()}
        placeholder="Selecione um intervalo"
        className="w-full mt-2 p-2 font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none cursor-pointer"
      />
      {isOpen && (
        <div
          className="absolute top-full mt-2 z-50 w-[328px] bg-dark-panel border border-dark-grid p-4"
        >
          <div className="flex justify-between items-center pb-3 mb-3 border-b border-dark-grid">
            <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-1 text-text-secondary hover:text-electric-green"><FiChevronLeft size={20} /></button>
            <h3 className="font-display text-lg text-text-primary">{headerText}</h3>
            <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-1 text-text-secondary hover:text-electric-green"><FiChevronRight size={20} /></button>
          </div>
          <div className="grid grid-cols-7 gap-2 mb-3 text-center">
            {daysOfWeek.map((day, i) => <div key={i} className="w-10 font-mono text-xs text-text-secondary">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {renderDays()}
          </div>
        </div>
      )}
    </div>
  );
};  