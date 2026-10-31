import { useState } from "react";
import "./Sobre.css";
import Navbar from "../components/Navbar";

export default function Sobre() {
    const [modoEscuro, setModoEscuro] = useState(false);
    return (
  <>
    <Navbar />
    <div className={modoEscuro ? "sobre-pagina modo-escuro" : "sobre-pagina"}>
        <main className="sobre-container">
            <div className="sobre-controle">
                <button type="button" className="sobre-tema-botao" onClick={() => setModoEscuro(!modoEscuro)}>{modoEscuro ? "☀️ Modo claro" : "🌙 Modo escuro"}</button>
            </div>
            <section className="sobre-hero">
                <span className="sobre-etiqueta">Conheça a Calculadora Tributária</span>
                <h1>Sobre o NAF</h1>
                <p>Tecnologia e informações para ajudar você a compreender melhor os cenários fiscais da sua atividade.</p>
            </section>

            <section className="sobre-card">
                <div className="sobre-icone">🏛️</div>
                <h2>O que é o NAF?</h2>
                <p>O NAF (Núcleo de Apoio Fiscal) é uma iniciativa que visa fornecer suporte técnico e informativo aos contribuintes no âmbito fiscal.</p>
            </section>

            <section className="sobre-card">
                <div className="sobre-icone">🎯</div>
                <h2>Nosso objetivo</h2>
                <p>Oferecer suporte técnico e informativo aos contribuintes no âmbito fiscal, com o objetivo de simplificar o entendimento das obrigações fiscais e promover a conformidade.</p>
            </section>

            <section className="sobre-card">
                <div className="sobre-icone">✉️</div>
                <h2>Fale conosco</h2>
                <p>Tem dúvidas ou sugestões sobre o NAF? Entre em contato conosco!</p>
                <p className="sobre-email">naf@gmail.com</p>
            </section>

            <footer className="sobre-footer">
                <p>Projeto acadêmico NAF - Informação e tecnologia a serviço do usuário.</p>
            </footer>
        </main>
    </div>
  </>
    );
}
