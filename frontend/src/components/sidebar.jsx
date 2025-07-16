import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import logo from "../assets/logo.png";

// Ícones atualizados para mais clareza
import { RxDashboard } from "react-icons/rx";
import { PiChartBar, PiTerminalWindow } from "react-icons/pi";
import {
  FiLogOut,
  FiSettings,
  FiChevronsRight,
  FiChevronsLeft,
  FiList, // Ícone para a lista de transações
} from "react-icons/fi";

const SidebarLink = ({ to, isExpanded, icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) => `
      group flex items-center h-12 px-4 rounded-none gap-4 text-lg font-display font-bold
      transition-all duration-200 border-l-4
      ${
        isActive
          ? "bg-electric-green/10 border-electric-green text-electric-green"
          : "border-transparent text-text-secondary hover:border-electric-green/50 hover:text-text-primary"
      }
    `}
  >
    <div className="flex-shrink-0 w-6 text-center transition-transform group-hover:scale-110">
      {icon}
    </div>
    <span
      className={`whitespace-nowrap overflow-hidden transition-all duration-200 ${
        isExpanded ? "w-full opacity-100" : "w-0 opacity-0"
      }`}
    >
      {children}
    </span>
  </NavLink>
);

function Sidebar() {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 1024);

  useEffect(() => {
    const handleResize = () => setIsExpanded(window.innerWidth > 1024);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <aside
      className={`relative h-screen ${
        isExpanded ? "w-72" : "w-24" // Corrigido de w-70 para w-72 (valor padrão do Tailwind)
      } transition-all duration-300
                       p-4 flex flex-col gap-8 animated-grid-bg border-r border-dark-grid sidebar-glow`}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3 top-8 bg-electric-green text-dark-panel p-1 rounded-full z-20"
      >
        {isExpanded ? <FiChevronsLeft /> : <FiChevronsRight />}
      </button>

      <div className="flex items-center gap-4 px-4 h-12">
        <img src={logo} alt="Logo" className="w-10 h-10 flex-shrink-0" />
        <div
          className={`overflow-hidden transition-opacity ${
            isExpanded ? "opacity-100" : "opacity-0"
          }`}
        >
          <h1 className="font-display text-2xl text-text-primary whitespace-nowrap animate-glitch">
            CYBERCAIXA
          </h1>
        </div>
      </div>

      <nav className="flex flex-col gap-3">
        <SidebarLink
          to="/dashboard"
          isExpanded={isExpanded}
          icon={<RxDashboard size={22} />}
        >
          DASHBOARD
        </SidebarLink>

        {/* ÍCONE ATUALIZADO: PiTerminalWindow sugere entrada de dados, como um comando. */}
        <SidebarLink
          to="/new_entry"
          isExpanded={isExpanded}
          icon={<PiTerminalWindow size={22} />}
        >
          NEW_ENTRY
        </SidebarLink>

        {/* ÍCONE ATUALIZADO: FiList representa claramente uma lista de transações. */}
        <SidebarLink
          to="/expenses"
          isExpanded={isExpanded}
          icon={<FiList size={22} />}
        >
          TRANSACTIONS
        </SidebarLink>

        <SidebarLink
          to="/budgets"
          isExpanded={isExpanded}
          icon={<PiChartBar size={22} />}
        >
          BUDGET_GRID
        </SidebarLink>
      </nav>

      <div className="flex-grow"></div>

      <div className="flex flex-col gap-3">
        <hr className="border-t border-dark-grid" />
        <SidebarLink
          to="/settings"
          isExpanded={isExpanded}
          icon={<FiSettings size={22} />}
        >
          SETTINGS
        </SidebarLink>
        <a
          href="/login"
          className="group flex items-center h-12 px-4 rounded-none gap-4 text-lg font-display font-bold text-text-secondary hover:text-glitch-magenta border-l-4 border-transparent hover:border-glitch-magenta/50 transition-colors duration-300"
        >
          <div className="flex-shrink-0 w-6 text-center transition-transform group-hover:scale-110">
            <FiLogOut size={22} />
          </div>
          <span
            className={`whitespace-nowrap overflow-hidden transition-opacity ${
              isExpanded ? "opacity-100" : "opacity-0"
            }`}
          >
            LOG_OUT
          </span>
        </a>
      </div>
    </aside>
  );
}

export default Sidebar;
