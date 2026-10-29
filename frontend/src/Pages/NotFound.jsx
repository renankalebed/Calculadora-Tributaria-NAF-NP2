
import { Link } from "react-router-dom";
import "./NotFound.css";
import NavBar from "../components/Navbar";

export default function NotFound() {
  return (
    <>
    <NavBar />
    <main className="not-found">
      <div className="not-found__glow" aria-hidden="true" />

      <section className="not-found__content">
        <div className="not-found__brand">
          <span className="not-found__brand-icon">N</span>
          <span>Calculadora Tributária</span>
        </div>

        <div className="not-found__code" aria-hidden="true">
          404
        </div>

        <span className="not-found__badge">
          <span className="not-found__dot" />
          Página não encontrada
        </span>

        <h1>Ops! Você se perdeu?</h1>

        <p className="not-found__description">
          A página que você está procurando não existe,
          foi movida ou o endereço foi digitado incorretamente.
        </p>

        <div className="not-found__actions">
          <Link to="/" className="not-found__button">
            <span aria-hidden="true">←</span>
            Voltar ao início
          </Link>

          <button
            type="button"
            className="not-found__back"
            onClick={() => window.history.back()}
          >
            Página anterior
          </button>
        </div>

        <div className="not-found__footer">
          <span>NAF</span>
          <span className="not-found__separator">•</span>
          <span>Calculadora Tributária</span>
        </div>
      </section>
    </main>
    </>
  );
}
