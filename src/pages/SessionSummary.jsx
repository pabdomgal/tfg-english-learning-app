import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, getLastSession } from "../services/storage";
import { formatTag } from "../services/tagFormat";

function buildRecommendation(errorTagsCount) {
  const entries = Object.entries(errorTagsCount || {});
  if (entries.length === 0) return "Vas muy bien. Sigue con la práctica diaria.";

  entries.sort((a, b) => b[1] - a[1]);
  const [topTag, topCount] = entries[0];

  if (topTag === "grammar") return `Recomendación: repasa gramática (fallos: ${topCount}).`;
  if (topTag === "vocabulary") return `Recomendación: refuerza vocabulario (fallos: ${topCount}).`;
  if (topTag === "listening") return `Recomendación: practica listening (fallos: ${topCount}).`;

  return `Recomendación: refuerza el área "${formatTag(topTag)}" (fallos: ${topCount}).`;
}

export default function SessionSummary() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const lastSession = getLastSession();

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  if (!lastSession) {
    return (
      <div>
        <Header userName={user.name} levelName={user.level ?? "-"} />
        <div style={{ padding: "1rem" }}>
          <h2>Resumen</h2>
          <p>No hay ninguna sesión registrada todavía.</p>
          <button onClick={() => nav("/menu")}>Volver al menú</button>
        </div>
      </div>
    );
  }

  const percent =
    lastSession.total > 0 ? Math.round((lastSession.correct / lastSession.total) * 100) : 0;

  const recommendation = buildRecommendation(lastSession.errorTagsCount);

  //  Progreso del nivel actual
  const lp = user.levelProgress?.[user.level] || null;
  const levelPercent =
    lp && lp.totalExercises > 0 ? Math.round((lp.correct / lp.totalExercises) * 100) : 0;

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: "1rem" }}>
        <h2>Resumen de la sesión</h2>

        <p style={{ marginTop: "0.5rem" }}>
          <strong>Ejercicios:</strong> {lastSession.total}
        </p>
        <p>
          <strong>Aciertos:</strong> {lastSession.correct}
        </p>
        <p>
          <strong>Errores:</strong> {lastSession.wrong}
        </p>
        <p>
          <strong>Porcentaje:</strong> {percent}%
        </p>

        {lp && (
          <>
            <h3>Progreso del nivel actual</h3>
            <p>
              <strong>Objetivo:</strong> 3 sesiones y 60% de acierto en el nivel
            </p>
            <p>
              <strong>Sesiones en este nivel:</strong> {lp.sessions} / 3
            </p>
            <p>
              <strong>Acierto en este nivel:</strong> {levelPercent}%
            </p>
          </>
        )}

        <h3>Recomendación</h3>
        <p>{recommendation}</p>

        <h3>Detalle por tipo (tags)</h3>
        {Object.keys(lastSession.errorTagsCount || {}).length === 0 ? (
          <p>No se detectaron tipos de error.</p>
        ) : (
          <ul>
            {Object.entries(lastSession.errorTagsCount)
              .sort((a, b) => b[1] - a[1])
              .map(([tag, count]) => (
                <li key={tag}>
                  <strong>{formatTag(tag)}</strong>: {count}
                </li>
              ))}
          </ul>
        )}

        <div style={{ marginTop: "1rem" }}>
          <button onClick={() => nav("/menu")}>Volver al menú</button>
        </div>
      </div>
    </div>
  );
}
