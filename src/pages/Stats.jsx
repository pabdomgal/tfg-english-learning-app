import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";

export default function Stats() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const s = user.stats || { sessions: 0, totalExercises: 0, correct: 0, wrong: 0 };
  const total = s.totalExercises || 0;
  const percent = total > 0 ? Math.round((s.correct / total) * 100) : 0;

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: "1rem" }}>
        <h2>Estadísticas</h2>

        <p><strong>Sesiones completadas:</strong> {s.sessions}</p>
        <p><strong>Ejercicios totales:</strong> {s.totalExercises}</p>
        <p><strong>Aciertos totales:</strong> {s.correct}</p>
        <p><strong>Errores totales:</strong> {s.wrong}</p>
        <p><strong>Porcentaje global:</strong> {percent}%</p>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => nav("/menu")}>Volver al menú</button>
        </div>
      </div>
    </div>
  );
}
