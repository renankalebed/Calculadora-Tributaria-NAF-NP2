import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
    const simulacaoValida = sessionStorage.getItem("naf_simulacao_valida") === "true";

    return simulacaoValida ? (
        <Outlet />
    ) : (
        <Navigate to="/" replace />
    );
}