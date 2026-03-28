import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Stats() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const s = user.stats || {
    sessions: 0,
    totalExercises: 0,
    correct: 0,
    wrong: 0,
  };

  const total = s.totalExercises || 0;
  const percent = total > 0 ? Math.round((s.correct / total) * 100) : 0;

  const history = user.history || [];

  const chartData = {
    labels: history.map((_, i) => `S${i + 1}`).reverse(),
    datasets: [
      {
        label: "% de acierto por sesión",
        data: history
          .map((s) =>
            s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
          )
          .reverse(),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.2)",
        tension: 0.3,
      },
    ],
  };

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
          <h2 style={{ marginBottom: "0.5rem" }}>Estadísticas</h2>
          <p style={{ color: "#5b6780", marginBottom: "1.5rem" }}>
            Consulta tu evolución, porcentaje de acierto e historial reciente.
          </p>

          <div
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <div style={{ maxWidth: "700px", margin: "0 auto" }}>
              <Line data={chartData} />
            </div>
          </div>

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
                Sesiones completadas
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16325c" }}>
                {s.sessions}
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
                Ejercicios totales
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16325c" }}>
                {s.totalExercises}
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
                Aciertos totales
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#157347" }}>
                {s.correct}
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
                Errores totales
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#c0392b" }}>
                {s.wrong}
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
                Porcentaje global
              </div>
              <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "#16325c" }}>
                {percent}%
              </div>
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
            <h3 style={{ marginBottom: "1rem" }}>Historial reciente</h3>

            {history.length === 0 ? (
              <p style={{ color: "#5b6780", margin: 0 }}>
                No hay sesiones registradas todavía.
              </p>
            ) : (
              <div style={{ display: "grid", gap: "1rem" }}>
                {history.map((session) => {
                  const sessionPercent =
                    session.total > 0
                      ? Math.round((session.correct / session.total) * 100)
                      : 0;

                  return (
                    <div
                      key={session.id}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #d9e1f0",
                        borderRadius: "14px",
                        padding: "1rem",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "1rem",
                          flexWrap: "wrap",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <div>
                          <strong style={{ color: "#16325c" }}>Fecha:</strong>{" "}
                          {new Date(session.dateISO).toLocaleString()}
                        </div>

                        <span
                          style={{
                            background: "#eef3ff",
                            border: "1px solid #bfd0f5",
                            borderRadius: "999px",
                            padding: "0.3rem 0.7rem",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            color: "#16325c",
                          }}
                        >
                          {session.correct}/{session.total} ({sessionPercent}%)
                        </span>
                      </div>

                      <div style={{ marginBottom: "0.35rem" }}>
                        <strong style={{ color: "#16325c" }}>Lección:</strong>{" "}
                        {session.lessonId}
                      </div>

                      {session.errorTagsCount &&
                        Object.keys(session.errorTagsCount).length > 0 && (
                          <div style={{ color: "#5b6780" }}>
                            <strong style={{ color: "#16325c" }}>
                              Errores frecuentes:
                            </strong>{" "}
                            {Object.entries(session.errorTagsCount)
                              .map(([tag, count]) => `${tag} (${count})`)
                              .join(", ")}
                          </div>
                        )}
                    </div>
                  );
                })}
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