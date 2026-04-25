import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, setUserLevel } from "../services/storage";

export default function SelectLevel() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const [level, setLevel] = useState("Principiante");

  useEffect(() => {
    if (!user) {
      nav("/start", { replace: true });
      return;
    }
    if (user.level) {
      nav("/menu", { replace: true });
    }
  }, [user, nav]);

  if (!user || user.level) return null;

  function handleConfirm() {
    setUserLevel(level);
    nav("/menu", { replace: true });
  }

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />

      <div style={{ padding: "1rem" }}>
        <div
          style={{
            maxWidth: "760px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #d9e1f0",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
            padding: "1.75rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Selecciona tu nivel inicial</h2>
            <p style={{ color: "#5b6780", margin: 0 }}>
              Elige el nivel que mejor se ajuste a tu punto de partida. Después
              la aplicación irá adaptando el progreso en función de tus resultados.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gap: "1rem",
              marginBottom: "1.5rem",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.85rem",
                background: level === "Principiante" ? "#eef3ff" : "#f8fbff",
                border: level === "Principiante"
                  ? "2px solid #9db8f2"
                  : "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem 1rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={level === "Principiante"}
                onChange={() => setLevel("Principiante")}
                style={{ marginTop: "0.2rem" }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#16325c", marginBottom: "0.25rem" }}>
                  Principiante
                </div>
                <div style={{ color: "#5b6780", fontSize: "0.95rem" }}>
                  Para usuarios que empiezan con vocabulario y estructuras básicas.
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.85rem",
                background: level === "Intermedio" ? "#eef3ff" : "#f8fbff",
                border: level === "Intermedio"
                  ? "2px solid #9db8f2"
                  : "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem 1rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={level === "Intermedio"}
                onChange={() => setLevel("Intermedio")}
                style={{ marginTop: "0.2rem" }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#16325c", marginBottom: "0.25rem" }}>
                  Intermedio
                </div>
                <div style={{ color: "#5b6780", fontSize: "0.95rem" }}>
                  Para usuarios con una base previa que quieren mejorar comprensión y uso.
                </div>
              </div>
            </label>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "0.85rem",
                background: level === "Avanzado" ? "#eef3ff" : "#f8fbff",
                border: level === "Avanzado"
                  ? "2px solid #9db8f2"
                  : "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem 1rem",
                cursor: "pointer",
              }}
            >
              <input
                type="radio"
                checked={level === "Avanzado"}
                onChange={() => setLevel("Avanzado")}
                style={{ marginTop: "0.2rem" }}
              />
              <div>
                <div style={{ fontWeight: 700, color: "#16325c", marginBottom: "0.25rem" }}>
                  Avanzado
                </div>
                <div style={{ color: "#5b6780", fontSize: "0.95rem" }}>
                  Para usuarios que ya dominan la base y quieren trabajar estructuras más complejas.
                </div>
              </div>
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={handleConfirm}>Confirmar nivel</button>
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "14px",
            }}
          >
            <p style={{ margin: 0, color: "#5b6780", fontSize: "0.95rem" }}>
              Más adelante el sistema podrá ir ajustando la dificultad según la evolución
              del usuario y sus resultados.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}