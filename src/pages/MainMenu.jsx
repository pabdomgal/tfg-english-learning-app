import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getActiveUser,
  exportProgressJSON,
  resetActiveUserProgress,
} from "../services/storage";
import { downloadJSON } from "../services/download";

export default function MainMenu() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  function handleExport() {
    const data = exportProgressJSON();
    if (!data) return;
    downloadJSON(`progreso_${user.name}.json`, data);
  }

  function handleReset() {
    const ok = window.confirm(
      "¿Seguro que quieres reiniciar el progreso? (estadísticas e historial se borrarán)"
    );
    if (!ok) return;

    const done = resetActiveUserProgress();
    if (done) {
      nav("/stats");
    }
  }

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />

      <div style={{ padding: 16 }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d9e1f0",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Menú principal</h2>
          <p style={{ color: "#5b6780", marginBottom: "1.5rem" }}>
            Accede a tu sesión diaria, revisa tu progreso y gestiona tu cuenta.
          </p>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>Sesión diaria</h3>
              <p style={{ color: "#5b6780", marginBottom: "1rem" }}>
                Practica los ejercicios del día y mejora tu nivel paso a paso.
              </p>
              <button onClick={() => nav("/session")}>Comenzar sesión diaria</button>
            </div>

            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>Estadísticas</h3>
              <p style={{ color: "#5b6780", marginBottom: "1rem" }}>
                Consulta tus resultados, historial y evolución de aprendizaje.
              </p>
              <button onClick={() => nav("/stats")}>Ver estadísticas</button>
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <h3 style={{ marginBottom: "0.75rem" }}>Ajustes</h3>

            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                flexWrap: "wrap",
              }}
            >
              <button onClick={() => nav("/start")}>Crear nuevo usuario</button>
              <button onClick={handleReset}>Reiniciar progreso</button>
              <button onClick={handleExport}>Exportar progreso (JSON)</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}