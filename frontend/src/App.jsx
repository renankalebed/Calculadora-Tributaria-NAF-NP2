import { BrowserRouter, Routes, Route } from "react-router-dom";
import Landing from "./Pages/Landing.jsx";
import Login from "./Pages/Login.jsx";
import Cadastro from "./Pages/Cadastro.jsx";
import RecuperarSenha from "./Pages/RecuperarSenha.jsx";
import Home from "./Pages/Home.jsx";
import CalculoPF from "./Pages/CalculoPF.jsx";
import CalculoPJ from "./Pages/CalculoPJ.jsx";
import Comparativo from "./Pages/Comparativo.jsx";
import Historico from "./Pages/Historico.jsx";
import Faq from "./Pages/Faq.jsx";
import Sobre from "./Pages/Sobre.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
