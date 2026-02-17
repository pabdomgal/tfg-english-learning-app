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
        <h2>Menú principal</h2>

        <button onClick={() => nav("/session")}>Comenzar sesión diaria</button>

        <div style={{ marginTop: 12 }}>
          <button onClick={() => nav("/stats")}>Ver estadísticas</button>
        </div>

        <div style={{ marginTop: 12, fontSize: 12 }}>
          <strong>Ajustes:</strong>
          <div
            style={{
              marginTop: 8,
              display: "flex",
              gap: "0.6rem",
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
  );
}
