import { Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";
import RecuperarSenha from "./Pages/RecuperarSenha";
import Home from "./Pages/Home";
import CalculoPF from "./Pages/CalculoPF";
import CalculoPJ from "./Pages/CalculoPJ";
import Comparativo from "./Pages/Comparativo";
import Historico from "./Pages/Historico";
import Faq from "./Pages/Faq";
import Sobre from "./Pages/Sobre";
import NavBar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function NotFound() {
return (
<main className="flex min-h-screen flex-col items-center justify-center gap-4 p-6 text-center">
<h1 className="text-5xl font-bold">404</h1>
<p className="text-lg">Página não encontrada.</p>
<a
     href="/"
     className="rounded-lg bg-[#CD371F] px-5 py-3 font-bold text-white"
   >
Voltar ao início
</a>
</main>
);
}

function App() {
  return (
    <>
    <NavBar />
      <Routes element={<ProtectedRoute />}>
        {/* Rotas Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />

        {/* Rotas Logadas */}
        <Route path="/Home" element={<Home />} />
        <Route path="/calculo-pf" element={<CalculoPF />} />
        <Route path="/calculo-pj" element={<CalculoPJ />} />
        <Route path="/comparativo" element={<Comparativo />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="/faq" element={<Faq />} />
        <Route path="/Sobre" element={<Sobre />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default App;