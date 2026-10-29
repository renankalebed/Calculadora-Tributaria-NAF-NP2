import { Link } from "react-router-dom";
import "./Faq.css";
import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { useNavigate } from "react-router-dom"

const perguntasSugeridas = [
  "Como usar a calculadora?",
  "O que é o Fator R?",
  "Onde vejo meu histórico?",
  "Como consultar os resultados?",
  "Quais são os contatos do NAF?",
  "Como posso entrar em contato com o NAF?",
  "Quero pedir sua ajuda."
];

const respostas = [
  {
    palavras: ["calculadora", "simulacao", "simular", "formulario"],
    texto:
      "Para fazer uma simulação, acesse a página inicial, preencha os campos solicitados e execute a simulação. Depois, consulte os resultados na página Comparativo.",
    link: "/",
    nomeLink: "Ir para a calculadora",
  },
  {
    palavras: ["fator r", "fator-r"],
    texto:
      "O Fator R é utilizado em determinadas atividades do Simples Nacional para definir o enquadramento tributário aplicável. Consulte as orientações oficiais e os critérios adotados no sistema.",
  },
  {
    palavras: ["historico", "anteriores", "antigas"],
    texto:
      "A página Histórico permite consultar as simulações disponíveis durante a sessão. A disponibilidade depende de como o sistema armazena esses dados.",
    link: "/historico",
    nomeLink: "Consultar histórico",
  },
  {
    palavras: ["comparativo", "resultado", "resultados"],
    texto:
      "Você pode consultar os resultados das simulações na página Comparativo. Basta acessar a página abaixo.",
    link: "/comparativo",
    nomeLink: "Abrir comparativo",
  },
  {
    palavras: ["naf", "sobre", "instituicao", "institucional"],
    texto:
      "Na página Sobre, você pode consultar as informações institucionais do NAF e o canal de contato disponibilizado pelo projeto.",
    link: "/sobre",
    nomeLink: "Conhecer o NAF",
  },
  {
    palavras: ["contato", "email", "e-mail", "telefone"],
    texto:
      "Para encontrar o canal de contato oficial, acesse a página Sobre. Utilize somente os dados de contato confirmados pela equipe do projeto.",
    link: "/sobre",
    nomeLink: "Ver contato",
  },
  {
    palavras: ["ajuda", "duvida", "duvidas", "faq", "pergunta"],
    texto:
      "Clique em uma das perguntas abaixo para eu te ajudar.",
  },
];

function normalizar(texto) {
  return texto
    .toLocaleLowerCase("pt-BR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function encontrarResposta(mensagem) {
  const texto = normalizar(mensagem);

  const resposta = respostas.find((item) =>
    item.palavras.some((palavra) =>
      texto.includes(normalizar(palavra))
    )
  );

  if (resposta) {
    return resposta;
  }
}

export default function Faq() {
  const navigate = useNavigate();
  const [modoEscuro, setModoEscuro] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [conversa, setConversa] = useState([
    {
      autor: "bot",
      texto:
        "Olá! 👋 Sou o assistente virtual do NAF. Como posso ajudar você hoje?",
    },
  ]);

  function enviarMensagem(textoRecebido = mensagem) {
    const texto = textoRecebido.trim();

    if (!texto) return;

    const resposta = encontrarResposta(texto);

    setConversa((anterior) => [
      ...anterior,
      { autor: "usuario", texto },
      {
        autor: "bot",
        texto: resposta.texto,
        link: resposta.link,
        nomeLink: resposta.nomeLink,
      },
    ]);

    setMensagem("");
  }

  function enviarFormulario(evento) {
    evento.preventDefault();
    enviarMensagem();
  }

  return (
  <>
    <Navbar />
    <main className={`chat-faq ${modoEscuro ? "tema-escuro" : "tema-claro"}`}>
      <header className="chat-cabecalho">
        <div className="chat-avatar">N</div>

        <div>
          <h1>Assistente NAF</h1>
          <p>Central de ajuda e perguntas frequentes</p>
        </div>
        <span className="chat-status">Assistente virtual</span>
        <button type="button" className="chat-tema-botao" onClick={() => setModoEscuro(!modoEscuro)} title={modoEscuro ? "Ativar modo claro" : "Ativar modo escuro"}>{modoEscuro ? "☀️" : "🌙"}<span>{modoEscuro ? "Modo claro" : "Modo escuro"}</span></button>
      </header>

      <section
        className="chat-mensagens"
        aria-label="Conversa com o assistente"
        aria-live="polite"
      >
        {conversa.map((item, indice) => (
          <article
            key={indice}
            className={`chat-mensagem chat-${item.autor}`}
          >
            <div className="chat-autor">
              {item.autor === "bot" ? "Assistente NAF" : "Você"}
            </div>

            <p>{item.texto}</p>

            {item.link && (
              <Link className="chat-link" to={item.link}>
                {item.nomeLink} →
              </Link>
            )}
          </article>
        ))}
      </section>

      <section className="chat-sugestoes">
        <p>Experimente perguntar:</p>

        <div className="chat-botoes-sugestao">
          {perguntasSugeridas.map((pergunta) => (
            <button
              key={pergunta}
              type="button"
              onClick={() => enviarMensagem(pergunta)}
            >
              {pergunta}
            </button>
          ))}
        </div>
      </section>
    </main>
  </>
  );
}
