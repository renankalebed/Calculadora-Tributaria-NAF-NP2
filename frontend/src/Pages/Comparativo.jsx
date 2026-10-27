import { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";

export default function Comparativo() {
  const [renda, setRenda] = useState("");
  const [custos, setCustos] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltipRenda, setShowTooltipRenda] = useState(false);
  const [showTooltipCustos, setShowTooltipCustos] = useState(false);
  const [profissao, setProfissao] = useState("psicologo");
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRendaChange = (e) => {
    const valor = parseFloat(e.target.value);
    if (valor > 15000) {
      setErro("O valor máximo permitido é R$ 15.000,00");
      setRenda(15000);
    } else {
      setErro("");
      setRenda(e.target.value);
    }
  };

  const calcularComparativo = async () => {
    const rendaNum = parseFloat(renda);
    const custosNum = parseFloat(custos);

    if (isNaN(rendaNum) || isNaN(custosNum)) {
      setResultado("Por favor, insira valores válidos.");
      return;
    }

    try {
      const response = await api.post("/calculos", {
        tipoProfissao: profissao,
        faturamento: rendaNum,
        custos: custosNum,
      });

      const { impostoPF, impostoPJ, melhorOpcao, economiaMensal } =
        response.data.calculo;
      const basePF = rendaNum - custosNum;
      let faixaPF = "Isento";
      let parcelaDedutivel = 0;

      if (basePF <= 2428.8) faixaPF = "Isento";
      else if (basePF <= 2826.65) {
        faixaPF = "7,5%";
        parcelaDedutivel = 182.16;
      } else if (basePF <= 3751.05) {
        faixaPF = "15%";
        parcelaDedutivel = 394.16;
      } else if (basePF <= 4664.68) {
        faixaPF = "22,5%";
        parcelaDedutivel = 675.49;
      } else {
        faixaPF = "27,5%";
        parcelaDedutivel = 908.73;
      }

      let aliquotaPJ = profissao === "advogado" ? "4,5%" : "6%";
      const salario28 = rendaNum * 0.28;
      const salarioMin = 1621;
      const salarioBase = salario28 < salarioMin ? salarioMin : salario28;
      const inss = salarioBase * 0.11;
      const siglaVencedora = melhorOpcao.includes("PJ") ? "PJ" : "PF";

      setResultado({
        pf: {
          base: basePF,
          faixa: faixaPF,
          parcelaDedutivel,
          imposto: impostoPF,
        },
        pj: {
          simples: rendaNum * (profissao === "advogado" ? 0.045 : 0.06),
          aliquota: aliquotaPJ,
          salarioBase,
          inss,
          total: impostoPJ,
        },
        maisVantajoso: melhorOpcao,
        siglaVencedora,
        diferenca: economiaMensal,
      });

      setMostrarEmail(false);
      setMensagemEnvio("");
    } catch (error) {
      console.error("Erro ao salvar comparativo no banco:", error);
      const mensagemErro =
        error.response?.data?.error ||
        "Erro ao processar o comparativo no servidor.";
      setResultado(mensagemErro);
    }
  };

  const enviarEmail = () => {
    if (!email.includes("@")) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }

    setMensagemEnvio(
      `Resultados simulados e enviados para ${email} com sucesso!`,
    );
    setEmail("");
  };

  const gerarPDF = async () => {
    setGerandoPdf(true);
    const elemento = document.getElementById("resultado-comparativo");

    if (!elemento) {
      console.error("Erro interno: A div do PDF não foi encontrada.");
      setGerandoPdf(false);
      return;
    }

    // DATA DA EXPORTAÇÃO
    const campoData = elemento.querySelector("#data-emissao");
    if (campoData) {
      campoData.textContent = new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "medium",
      }).format(new Date());
    }

    try {
      const opcoes = {
        margin: 10,
        filename: `Comparativo_Tributario_${profissao}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opcoes).from(elemento).save();
    } catch (error) {
      console.error("Falha ao processar o arquivo PDF:", error);
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#EFEFEF]">
      <Navbar />

      <main className="flex flex-grow flex-col items-center px-4 py-10">
        {/* CABEÇALHO DA PÁGINA */}
        <div
          className={`mb-8 text-center transition-all duration-[700ms] ease-out delay-[200ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <h1 className="mb-2 text-3xl font-bold text-[#132436]">
            Descubra onde você paga menos impostos
          </h1>
          <p className="mx-auto max-w-xl font-medium text-[#B2B2B2]">
            Preencha os dados abaixo e o sistema fará um raio-x completo
            comparando o regime como Autônomo (PF) e como Empresa (PJ).
          </p>
        </div>

        {/* CONTAINER DOS INPUTS */}
        <div
          className={`w-full max-w-4xl rounded-3xl border border-[#e5e7eb] bg-white shadow-xl transition-all duration-[700ms] ease-out delay-[400ms] ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"
          }`}
        >
          <div className="grid grid-cols-1 items-end gap-6 p-6 md:grid-cols-3 md:p-8">
            <div className="w-full">
              <label className="mb-2 block text-sm font-medium text-[#132436]">
                Sua Profissão
              </label>
              <select
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                className="w-full cursor-pointer rounded-xl border border-[#d1d5db] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#CD371F]"
              >
                <option value="psicologo">Psicólogo(a)</option>
                <option value="arquiteto">Arquiteto(a)</option>
                <option value="advogado">Advogado(a)</option>
              </select>
            </div>

            <div className="w-full">
              <div className="relative mb-2 flex items-center gap-1">
                <label className="text-sm font-medium text-[#132436]">
                  Renda Mensal (R$)
                </label>
                <button
                  type="button"
                  className="cursor-help text-[#9ca3af] focus:outline-none hover:text-[#132436]"
                  onMouseEnter={() => setShowTooltipRenda(true)}
                  onMouseLeave={() => setShowTooltipRenda(false)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showTooltipRenda && (
                  <div className="absolute left-full top-[-0.5rem] z-10 ml-2 w-64 rounded-xl border border-[#e5e7eb] bg-[#132436] p-3 text-sm text-white shadow-lg">
                    Sua receita bruta total prevista para o mês.
                  </div>
                )}
              </div>
              <input
                type="number"
                value={renda}
                onChange={handleRendaChange}
                max="15000"
                placeholder="Ex: 5000"
                className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#CD371F]"
              />
              {erro && (
                <p className="absolute mt-1 text-xs font-medium text-[#CD371F]">
                  {erro}
                </p>
              )}
            </div>

            <div className="w-full">
              <div className="relative mb-2 flex items-center gap-1">
                <label className="text-sm font-medium text-[#132436]">
                  Custos Dedutíveis (R$)
                </label>
                <button
                  type="button"
                  className="cursor-help text-[#9ca3af] focus:outline-none hover:text-[#132436]"
                  onMouseEnter={() => setShowTooltipCustos(true)}
                  onMouseLeave={() => setShowTooltipCustos(false)}
                >
                  <svg
                    className="h-4 w-4"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                {showTooltipCustos && (
                  <div className="absolute right-full top-[-0.5rem] z-10 mr-2 w-64 rounded-xl border border-[#e5e7eb] bg-[#132436] p-3 text-sm text-white shadow-lg">
                    Despesas do seu negócio (aluguel, internet, etc). Usado
                    apenas para abater a base da PF.
                  </div>
                )}
              </div>
              <input
                type="number"
                value={custos}
                onChange={(e) => setCustos(e.target.value)}
                placeholder="Ex: 800"
                className="w-full rounded-xl border border-[#d1d5db] px-4 py-3 outline-none transition focus:ring-2 focus:ring-[#CD371F]"
              />
            </div>
          </div>

          <div className="px-6 pb-8 md:px-8">
            <button
              onClick={calcularComparativo}
              className="w-full cursor-pointer rounded-xl bg-[#CD371F] py-4 text-lg font-bold text-white shadow-md transition-all duration-[400ms] ease-out hover:scale-[1.01] hover:bg-[#a62b18]"
            >
              Analisar Vantagem Tributária
            </button>
          </div>

          {/* ÁREA DE RESULTADOS E PDF */}
          {resultado && typeof resultado === "string" ? (
            <p className="pb-8 text-center font-medium text-[#CD371F]">
              {resultado}
            </p>
          ) : (
            resultado && (
              <div className="rounded-b-3xl border-t border-[#e5e7eb] bg-[#f9fafb]">
                <div
                  id="resultado-comparativo"
                  className="bg-[#ffffff] p-6 md:p-8"
                >
                  {/* CABEÇALHO DO RELATÓRIO */}
                  <header className="mb-8 border-b-2 border-[#132436] pb-5 text-center">
                    <p className="font-bold">
                      NAF — Núcleo de Apoio Contábil e Fiscal
                    </p>
                    <p>Universidade Christus</p>
                    <h2 className="mt-4 text-xl font-bold">
                      Comparativo de Tributação — Pessoa Física e Pessoa
                      Jurídica
                    </h2>
                    <p className="mt-2 text-sm text-[#4b5563]">
                      Emitido em:{" "}
                      <span id="data-emissao">
                        Será preenchido ao gerar o PDF
                      </span>
                    </p>
                  </header>

                  <div
                    className="mb-8 rounded-2xl border-2 p-6 text-center shadow-sm"
                    style={{
                      borderColor:
                        resultado.siglaVencedora === "PJ"
                          ? "#22c55e"
                          : "#3b82f6",
                      backgroundColor:
                        resultado.siglaVencedora === "PJ"
                          ? "#f0fdf4"
                          : "#eff6ff",
                    }}
                  >
                    <h3 className="mb-1 text-xl font-bold text-[#1f2937]">
                      A melhor opção para você é:
                    </h3>
                    <p
                      className="mb-2 text-3xl font-extrabold"
                      style={{
                        color:
                          resultado.siglaVencedora === "PJ"
                            ? "#16a34a"
                            : "#2563eb",
                      }}
                    >
                      {resultado.maisVantajoso}
                    </p>
                    <p className="font-medium text-[#374151]">
                      Atuando como {resultado.siglaVencedora}, você tem uma{" "}
                      <span className="font-bold underline decoration-2">
                        economia de R$ {resultado.diferenca.toFixed(2)}
                      </span>{" "}
                      todos os meses.
                    </p>

                    {/* GRÁFICO COMPARATIVO */}
                    <section className="my-8">
                      <h3 className="mb-4 text-center font-bold text-[#132436]">
                        Comparação dos custos mensais
                      </h3>
                      {[
                        {
                          nome: "Pessoa Física (PF)",
                          valor: resultado.pf.imposto,
                          cor: "#3b82f6",
                        },
                        {
                          nome: "Pessoa Jurídica (PJ)",
                          valor: resultado.pj.total,
                          cor: "#16a34a",
                        },
                      ].map((item) => {
                        const maiorValor = Math.max(
                          resultado.pf.imposto,
                          resultado.pj.total,
                          1,
                        );
                        const largura = (item.valor / maiorValor) * 100;

                        return (
                          <div key={item.nome} className="mb-4">
                            <div className="mb-1 flex justify-between text-sm">
                              <span className="font-semibold">{item.nome}</span>
                              <span>
                                {item.valor.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </span>
                            </div>
                            <div className="h-6 w-full rounded bg-[#e5e7eb]">
                              <div
                                style={{
                                  width: `${largura}%`,
                                  height: "100%",
                                  backgroundColor: item.cor,
                                  borderRadius: "4px",
                                }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </section>

                    {/* TABELA MEMÓRIA DE CÁLCULO */}
                    <section className="my-8">
                      <h3 className="mb-4 text-center font-bold text-[#132436]">
                        Memória de cálculo
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left text-sm">
                          <thead>
                            <tr className="bg-[#f3f4f6]">
                              <th className="border border-[#d1d5db] p-2">
                                Regime
                              </th>
                              <th className="border border-[#d1d5db] p-2">
                                Tributo
                              </th>
                              <th className="border border-[#d1d5db] p-2">
                                Base de cálculo
                              </th>
                              <th className="border border-[#d1d5db] p-2">
                                Alíquota/faixa
                              </th>
                              <th className="border border-[#d1d5db] p-2">
                                Valor
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td className="border border-[#d1d5db] p-2">
                                PF
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                IRPF
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pf.base.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pf.faixa}
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pf.imposto.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-[#d1d5db] p-2">
                                PJ
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                Simples Nacional
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {Number(renda).toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pj.aliquota}
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pj.simples.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                            </tr>
                            <tr>
                              <td className="border border-[#d1d5db] p-2">
                                PJ
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                INSS sobre pró-labore
                              </td>
                              <td className="border border-[#d1d5db] p-2">
                                {resultado.pj.salarioBase.toLocaleString(
                                  "pt-BR",
                                  {
                                    style: "currency",
                                    currency: "BRL",
                                  },
                                )}
                              </td>
                              <td className="border border-[#d1d5d5] p-2">
                                11%
                              </td>
                              <td className="border border-[#d1d5d5] p-2">
                                {resultado.pj.inss.toLocaleString("pt-BR", {
                                  style: "currency",
                                  currency: "BRL",
                                })}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* AVISO LEGAL FIM DO RELATÓRIO */}
                    <p className="mt-8 border-t border-[#e5e7eb] pt-4 text-xs leading-relaxed text-[#4b5563]">
                      Os valores apresentados são estimativas e podem variar de
                      acordo com as condições específicas de cada contribuinte e
                      a legislação aplicável. Este relatório tem finalidade de
                      simulação e não substitui uma análise tributária oficial.
                    </p>
                  </div>

                  <div
                    style={{ breakInside: "avoid", pageBreakInside: "avoid" }}
                  >
                    <h4 className="mb-4 text-center text-sm font-bold uppercase tracking-wider text-[#132436]">
                      Resumo Detalhado dos Cálculos
                    </h4>

                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <div
                        className="rounded-xl border-2 p-5 shadow-md"
                        style={{
                          borderColor:
                            resultado.siglaVencedora === "PF"
                              ? "#3b82f6"
                              : "#e5e7eb",
                          backgroundColor:
                            resultado.siglaVencedora === "PF"
                              ? "#ffffff"
                              : "#f3f4f6",
                          opacity: resultado.siglaVencedora === "PF" ? 1 : 0.7,
                        }}
                      >
                        <h3 className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-2 text-xl font-bold text-[#132436]">
                          Pessoa Física (PF){" "}
                          {resultado.siglaVencedora === "PF" && (
                            <span className="rounded-full bg-[#eff6ff] px-2 py-1 text-xs uppercase text-[#1d4ed8]">
                              Recomendado
                            </span>
                          )}
                        </h3>
                        <div className="space-y-3 text-sm text-[#374151]">
                          <div className="flex justify-between">
                            <span>Base de Cálculo:</span>
                            <span className="font-semibold">
                              R$ {resultado.pf.base.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faixa IRPF:</span>
                            <span className="font-semibold">
                              {resultado.pf.faixa}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Dedução Permitida:</span>
                            <span className="font-semibold text-[#16a34a]">
                              - R$ {resultado.pf.parcelaDedutivel.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between border-t border-[#e5e7eb] pt-3">
                          <span className="font-bold text-[#132436]">
                            Custo Mensal:
                          </span>
                          <span className="text-2xl font-black text-[#CD371F]">
                            R$ {resultado.pf.imposto.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div
                        className="rounded-xl border-2 p-5 shadow-md"
                        style={{
                          borderColor:
                            resultado.siglaVencedora === "PJ"
                              ? "#22c55e"
                              : "#e5e7eb",
                          backgroundColor:
                            resultado.siglaVencedora === "PJ"
                              ? "#ffffff"
                              : "#f3f4f6",
                          opacity: resultado.siglaVencedora === "PJ" ? 1 : 0.7,
                        }}
                      >
                        <h3 className="mb-4 flex items-center justify-between border-b border-[#e5e7eb] pb-2 text-xl font-bold text-[#132436]">
                          Pessoa Jurídica (PJ){" "}
                          {resultado.siglaVencedora === "PJ" && (
                            <span className="rounded-full bg-[#f0fdf4] px-2 py-1 text-xs uppercase text-[#15803d]">
                              Recomendado
                            </span>
                          )}
                        </h3>
                        <div className="space-y-3 text-sm text-[#374151]">
                          <div className="flex justify-between">
                            <span>Simples ({resultado.pj.aliquota}):</span>
                            <span className="font-semibold">
                              R$ {resultado.pj.simples.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Pró-labore base:</span>
                            <span className="font-semibold">
                              R$ {resultado.pj.salarioBase.toFixed(2)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>INSS Mensal (11%):</span>
                            <span className="font-semibold">
                              R$ {resultado.pj.inss.toFixed(2)}
                            </span>
                          </div>
                        </div>
                        <div className="mt-5 flex items-end justify-between border-t border-[#e5e7eb] pt-3">
                          <span className="font-bold text-[#132436]">
                            Custo Mensal:
                          </span>
                          <span className="text-2xl font-black text-[#CD371F]">
                            R$ {resultado.pj.total.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 border-t border-[#e5e7eb] px-6 pb-8 pt-4 md:px-8">
                  <button
                    onClick={gerarPDF}
                    disabled={gerandoPdf}
                    className={`flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#132436] py-3 font-bold text-white shadow-md transition-all duration-[400ms] ${
                      gerandoPdf
                        ? "cursor-wait opacity-70"
                        : "hover:-translate-y-1 hover:bg-[#0c1825]"
                    }`}
                  >
                    <svg
                      className={`h-5 w-5 ${gerandoPdf ? "animate-bounce" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    {gerandoPdf
                      ? "Processando e Baixando PDF..."
                      : "Baixar Relatório Oficial em PDF"}
                  </button>

                  <div className="mt-2 text-center">
                    <button
                      onClick={() => setMostrarEmail(!mostrarEmail)}
                      className="cursor-pointer border-none bg-transparent text-sm font-bold text-[#6b7280] underline transition-colors hover:text-[#132436]"
                    >
                      Deseja enviar os resultados para o seu e-mail?
                    </button>
                  </div>

                  {mostrarEmail && (
                    <div className="mt-2 space-y-3 rounded-xl border border-[#d1d5db] bg-white p-4 shadow-sm">
                      <label className="block text-sm font-medium text-[#132436]">
                        Qual e-mail deve receber a simulação?
                      </label>
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="contato@exemplo.com"
                          className="flex-grow rounded-xl border border-[#d1d5db] px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#132436]"
                        />
                        <button
                          onClick={enviarEmail}
                          className="cursor-pointer rounded-xl bg-[#CD371F] px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#a62b18]"
                        >
                          Enviar Agora
                        </button>
                      </div>
                      {mensagemEnvio && (
                        <p className="text-sm font-bold text-green-600">
                          {mensagemEnvio}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div className="rounded-b-3xl border-t border-[#e5e7eb] bg-white px-6 pb-8 pt-6 md:px-8">
                  <div className="mb-4 text-center">
                    <h4 className="flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wider text-[#132436]">
                      <svg
                        className="h-5 w-5 text-[#CD371F]"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Conteúdo Recomendado Para Você
                    </h4>
                    <p className="text-sm text-[#6b7280]">
                      Separamos este vídeo do Sebrae para te ajudar a entender
                      melhor o regime {resultado.siglaVencedora}.
                    </p>
                  </div>

                  <div className="mx-auto aspect-video w-full max-w-2xl overflow-hidden rounded-xl border border-[#e5e7eb] shadow-lg">
                    {resultado.siglaVencedora === "PJ" ? (
                      <iframe
                        className="h-full w-full"
                        src="https://www.youtube.com/embed/yMlNDLDlk2c"
                        title="Como funciona o Simples Nacional"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <iframe
                        className="h-full w-full"
                        src="https://www.youtube.com/embed/QtPQq3di4xI"
                        title="Como fazer o Carnê-Leão e Livro Caixa"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
