import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const [menuAberto, setMenuAberto] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setMenuAberto(false);
    navigate("/");
  };

  const navegar = (rota) => {
    setMenuAberto(false);
    navigate(rota);
  };
  const estiloMenuMobile = menuAberto
  ? "max-h-[500px] opacity-100 translate-y-0"
  : "max-h-0 opacity-0 -translate-y-2 pointer-events-none";

  const links = [
    { nome: "Página Inicial", rota: "/Home" },
    { nome: "Cálculo PF", rota: "/calculo-pf" },
    { nome: "Cálculo PJ", rota: "/calculo-pj" },
    { nome: "Comparativo", rota: "/comparativo" },
    { nome: "Histórico", rota: "/historico" },
    { nome: "FAQ", rota: "/faq" },
    { nome: "Sobre", rota: "/Sobre" },
  ];

  const classeLink =
    "px-3 py-2 rounded-lg text-sm font-medium text-naf-light " +
    "hover:bg-naf-red hover:text-white transition-colors duration-300 " +
    "cursor-pointer whitespace-nowrap";

  return (
    <nav className="relative w-full bg-naf-blue shadow-lg border-b border-naf-gray/20">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">

        <div className="flex justify-between items-center min-h-16 gap-2">

          <button
            onClick={() => navegar("/Home")}
            className="min-w-0 text-left text-base sm:text-xl font-bold
              text-white tracking-wide cursor-pointer
              hover:text-naf-gray transition-colors duration-300"
            title="Voltar para a Página Inicial"
          >
            Calculadora Tributária
          </button>

          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <button
                key={link.rota}
                onClick={() => navegar(link.rota)}
                className={classeLink}
              >
                {link.nome}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="ml-2 px-4 py-2 bg-transparent border-2
                border-naf-red text-naf-light rounded-lg text-sm font-bold
                hover:bg-naf-red hover:text-white transition-all duration-300
                cursor-pointer whitespace-nowrap"
            >
              Sair
            </button>
          </div>

          <button
            type="button"
            onClick={() => setMenuAberto(!menuAberto)}
            className="md:hidden shrink-0 p-2 rounded-lg text-white
              hover:bg-naf-red transition-colors duration-300 cursor-pointer"
            aria-label={menuAberto ? "Fechar menu" : "Abrir menu"}
            aria-expanded={menuAberto}
            aria-controls="menu-mobile"
          >
            {menuAberto ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="26"
                height="26"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {menuAberto && (
          <div
            id="menu-mobile"
            className="md:hidden flex flex-col gap-2 pb-4 pt-2"
          >
            {links.map((link) => (
              <button
                key={link.rota}
                onClick={() => navegar(link.rota)}
                className={`${classeLink} w-full text-left`}
              >
                {link.nome}
              </button>
            ))}

            <button
              onClick={handleLogout}
              className="w-full px-3 py-2 mt-1 bg-transparent
                border-2 border-naf-red text-naf-light rounded-lg
                text-sm font-bold text-left hover:bg-naf-red
                hover:text-white transition-all duration-300 cursor-pointer"
            >
              Sair
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
