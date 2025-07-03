import { useState, useRef,useEffect } from "react";
import logo from "../assets/logo.png";
import { CiCircleChevDown, CiCircleChevUp } from "react-icons/ci";

function Navbar() {
  const closed = <CiCircleChevDown className="size-5" />;
  const opened = <CiCircleChevUp className="size-5" />;

  const [open, setopen] = useState(false);

  const toggleOpened = (e) => {
    e.preventDefault();
    setopen((prev) => !prev);
  };

  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setopen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <>
      <nav className=" w-full bg-dark-container shadow-glow-pink p-2 flex flex-row justify-between items-center">
        <div className=" flex flex-row items-center">
          <img src={logo} alt="" className="w-15 mx-3 " />
          <h1 className="text-neon-pink font-display ">CYBERCAIXA</h1>
        </div>
        <div className="text-neon-cyan w-[70%] text-end p-2 mx-2  ">
          <button className="cursor-pointer border-2 rounded-[8px] p-2 bg-button-primary-bg text-button-primary-text hover:bg-button-primary-hover-bg shadow-glow-cyan">
            Adicionar Despesa
          </button>
        </div>
        <div className="flex flex-row text-neon-cyan items-center gap-1 mx-4">
          <img src="" alt="" />
          <p>Crisley Wolgien</p>
          <button
            className="size-5 cursor-pointer hover:text-button-primary-hover-bg"
            onClick={toggleOpened}
          >
            {open ? closed : opened}
          </button>
        </div>
      </nav>
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden origin-top-right 
    ${
      open
        ? "opacity-100 scale-100 max-h-40"
        : "opacity-0 scale-95 max-h-0 pointer-events-none"
    } 
    flex flex-col rounded-md bg-dark-container shadow-glow-pink  absolute right-5 top-16 z-50`}
        ref={menuRef}
      >
        <ul className="text-white p-5 ">
          <li>
            <button className="text-text-secondary cursor-pointer hover:text-neon-cyan">Configuração</button>
          </li>
          <li className="mt-2">
            <button className="text-text-secondary cursor-pointer hover:text-neon-pink">Sair</button>
          </li>
        </ul>
      </div>
    </>
  );
}

export default Navbar;
