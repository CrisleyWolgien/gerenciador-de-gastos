import { useState, useRef, useEffect } from "react";
import { FiChevronDown } from "react-icons/fi";

// Nosso novo componente de Select customizado
export const CustomSelect = ({ options, value, onChange, placeholder = "Selecione..." }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Lógica para fechar o dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (optionValue) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={selectRef}>
      {/* O botão principal que mostra o valor selecionado */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full mt-2 p-3 flex items-center justify-between font-mono text-text-primary bg-dark-surface border-2 border-dark-grid rounded-none focus:border-electric-green focus:outline-none"
      >
        <span className={value ? 'text-text-primary' : 'text-text-secondary/50'}>
          {value || placeholder}
        </span>
        <FiChevronDown className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* A lista de opções que aparece/desaparece */}
      {isOpen && (
        <div className="absolute top-full mt-1 w-full z-30 bg-dark-panel border border-dark-grid">
          <ul>
            {options.map((option) => (
              <li
                key={option}
                onClick={() => handleSelect(option)}
                className="p-3 font-mono text-text-secondary hover:bg-electric-green hover:text-dark-panel cursor-pointer"
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
