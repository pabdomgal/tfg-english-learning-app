import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getActiveUser,
  getLastSession,
  loadState,
  saveState,
} from "../services/storage";
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

  useEffect(() => {
    if (user?.justCompletedLevel) {
      const state = loadState();
      if (state) {
        const activeUser = state.users.find((u) => u.id === state.activeUserId);
        if (activeUser && activeUser.justCompletedLevel) {
          delete activeUser.justCompletedLevel;
          saveState(state);
        }
      }

      nav("/diploma", { replace: true });
    }
  }, [user, nav]);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  if (user.justCompletedLevel) {
    return null;
  }

  if (!lastSession) {
    return (
      <div>
        <Header userName={user.name} levelName={user.level ?? "-"} />
        <div style={{ padding: "1rem" }}>
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
              padding: "1.5rem",
            }}
          >
            <h2>Resumen</h2>
            <p>No hay ninguna sesión registrada todavía.</p>
            <button onClick={() => nav("/menu")}>Volver al menú</button>
          </div>
        </div>
      </div>
    );
  }

  const percent =
    lastSession.total > 0
      ? Math.round((lastSession.correct / lastSession.total) * 100)
      : 0;

  const recommendation = buildRecommendation(lastSession.errorTagsCount);

  const lp = user.levelProgress?.[user.level] || null;
  const levelPercent =
    lp && lp.totalExercises > 0
      ? Math.round((lp.correct / lp.totalExercises) * 100)
      : 0;

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />

      <div style={{ padding: "1rem" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d9e1f0",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Resumen de la sesión</h2>
          <p style={{ color: "#5b6780", marginBottom: "1.5rem" }}>
            Aquí puedes ver el resultado de la sesión y tu progreso general.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem",
              }}
            >
              <div style={{ color: "#5b6780", marginBottom: "0.35rem" }}>
                Ejercicios
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16325c" }}>
                {lastSession.total}
              </div>
            </div>

            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem",
              }}
            >
              <div style={{ color: "#5b6780", marginBottom: "0.35rem" }}>
                Aciertos
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#157347" }}>
                {lastSession.correct}
              </div>
            </div>

            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem",
              }}
            >
              <div style={{ color: "#5b6780", marginBottom: "0.35rem" }}>
                Errores
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#c0392b" }}>
                {lastSession.wrong}
              </div>
            </div>

            <div
              style={{
                background: "#eef3ff",
                border: "1px solid #bfd0f5",
                borderRadius: "16px",
                padding: "1rem",
              }}
            >
              <div style={{ color: "#5b6780", marginBottom: "0.35rem" }}>
                Porcentaje
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16325c" }}>
                {percent}%
              </div>
            </div>
          </div>

          {lp && (
            <div
              style={{
                background: "#f8fafc",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1.25rem",
                marginBottom: "1.5rem",
              }}
            >
              <h3 style={{ marginBottom: "0.75rem" }}>Progreso del nivel actual</h3>
              <p style={{ marginBottom: "0.5rem", color: "#5b6780" }}>
                <strong style={{ color: "#16325c" }}>Objetivo:</strong> 3 sesiones y 60% de acierto en el nivel
              </p>
              <p style={{ marginBottom: "0.5rem" }}>
                <strong>Sesiones en este nivel:</strong> {lp.sessions} / 3
              </p>
              <p style={{ marginBottom: 0 }}>
                <strong>Acierto en este nivel:</strong> {levelPercent}%
              </p>
            </div>
          )}

          <div
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1.25rem",
              marginBottom: "1.5rem",
            }}
          >
            <h3 style={{ marginBottom: "0.75rem" }}>Recomendación</h3>
            <p style={{ margin: 0 }}>{recommendation}</p>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <h3 style={{ marginBottom: "0.75rem" }}>Detalle por tipo (tags)</h3>

            {Object.keys(lastSession.errorTagsCount || {}).length === 0 ? (
              <p style={{ margin: 0, color: "#5b6780" }}>
                No se detectaron tipos de error.
              </p>
            ) : (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                {Object.entries(lastSession.errorTagsCount)
                  .sort((a, b) => b[1] - a[1])
                  .map(([tag, count]) => (
                    <span
                      key={tag}
                      style={{
                        background: "#eef3ff",
                        border: "1px solid #bfd0f5",
                        borderRadius: "999px",
                        padding: "0.4rem 0.75rem",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#16325c",
                      }}
                    >
                      {formatTag(tag)} ({count})
                    </span>
                  ))}
              </div>
            )}
          </div>

          <div style={{ marginTop: "1.5rem" }}>
            <button onClick={() => nav("/menu")}>Volver al menú</button>
          </div>
        </div>
      </div>
    </div>
  );
}