import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, setUserLevel } from "../services/storage";
import { theme, ui } from "../styles/theme";

export default function SelectLevel() {
  const nav = useNavigate();
  const { user } = getActiveUser();
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

  const pageShell = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "30px",
    padding: theme.spacing.xxl,
    border: `1px solid ${theme.colors.borderStrong}`,
    background: `
      radial-gradient(circle at 18% 0%, rgba(37,99,235,0.22), transparent 30%),
      radial-gradient(circle at 82% 18%, rgba(139,92,246,0.20), transparent 26%),
      linear-gradient(180deg, rgba(6,25,69,0.92) 0%, rgba(13,43,120,0.72) 100%)
    `,
    boxShadow: theme.shadows.card,
    backdropFilter: theme.blur.lg,
    WebkitBackdropFilter: theme.blur.lg,
  };

  const selectCard = {
    maxWidth: "860px",
    margin: "0 auto",
    borderRadius: "28px",
    padding: "1.8rem",
    border: `1px solid ${theme.colors.borderStrong}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))",
    boxShadow: theme.shadows.cardSoft,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const optionCard = (active) => ({
    display: "flex",
    alignItems: "flex-start",
    gap: "0.9rem",
    background: active
      ? "linear-gradient(180deg, rgba(212,255,38,0.12), rgba(255,255,255,0.05))"
      : "rgba(255,255,255,0.045)",
    border: active
      ? `2px solid ${theme.colors.accent}`
      : `1px solid ${theme.colors.border}`,
    borderRadius: "18px",
    padding: "1rem 1rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: active
      ? "0 0 0 1px rgba(212,255,38,0.10), 0 12px 26px rgba(2,8,25,0.16)"
      : "0 8px 20px rgba(2,8,25,0.10)",
  });

  const primaryButtonStyle = {
    ...ui.primaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    boxShadow: theme.shadows.primaryGlow,
  };

  return (
    <div style={ui.page}>
      <style>{`
        @keyframes fadeSlideUp {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .select-level-main-card {
          animation: fadeSlideUp 0.45s ease-out;
        }

        .select-level-option:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 760px) {
          .select-level-actions {
            flex-direction: column;
          }

          .select-level-actions button {
            width: 100%;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={pageShell} className="select-level-main-card">
            <div
              style={{
                position: "absolute",
                top: "-90px",
                right: "-70px",
                width: "240px",
                height: "240px",
                borderRadius: "999px",
                background: theme.colors.primarySoft,
                filter: "blur(70px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-80px",
                left: "-60px",
                width: "210px",
                height: "210px",
                borderRadius: "999px",
                background: theme.colors.violetSoft,
                filter: "blur(70px)",
                pointerEvents: "none",
                opacity: 0.7,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={selectCard}>
                <div style={{ marginBottom: "1.6rem" }}>
                  <p
                    style={{
                      margin: 0,
                      color: theme.colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Initial setup
                  </p>

                  <h2
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      color: theme.colors.text,
                      fontSize: "clamp(2rem, 4vw, 3rem)",
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      lineHeight: 1,
                    }}
                  >
                    Selecciona tu nivel inicial
                  </h2>

                  <p
                    style={{
                      color: theme.colors.textSoft,
                      margin: `${theme.spacing.md} 0 0 0`,
                      fontSize: "1rem",
                      lineHeight: 1.6,
                      maxWidth: "720px",
                    }}
                  >
                    Elige el nivel que mejor se ajuste a tu punto de partida.
                    Después la aplicación irá adaptando el progreso según tus resultados.
                  </p>
                </div>

                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                    marginBottom: "1.5rem",
                  }}
                >
                  <label style={optionCard(level === "Principiante")} className="select-level-option">
                    <input
                      type="radio"
                      checked={level === "Principiante"}
                      onChange={() => setLevel("Principiante")}
                      style={{ marginTop: "0.2rem" }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: theme.colors.text,
                          marginBottom: "0.25rem",
                          fontSize: "1.05rem",
                        }}
                      >
                        Principiante
                      </div>
                      <div style={{ color: theme.colors.textSoft, fontSize: "0.95rem" }}>
                        Para usuarios que empiezan con vocabulario y estructuras básicas.
                      </div>
                    </div>
                  </label>

                  <label style={optionCard(level === "Intermedio")} className="select-level-option">
                    <input
                      type="radio"
                      checked={level === "Intermedio"}
                      onChange={() => setLevel("Intermedio")}
                      style={{ marginTop: "0.2rem" }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: theme.colors.text,
                          marginBottom: "0.25rem",
                          fontSize: "1.05rem",
                        }}
                      >
                        Intermedio
                      </div>
                      <div style={{ color: theme.colors.textSoft, fontSize: "0.95rem" }}>
                        Para usuarios con una base previa que quieren mejorar comprensión y uso.
                      </div>
                    </div>
                  </label>

                  <label style={optionCard(level === "Avanzado")} className="select-level-option">
                    <input
                      type="radio"
                      checked={level === "Avanzado"}
                      onChange={() => setLevel("Avanzado")}
                      style={{ marginTop: "0.2rem" }}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 800,
                          color: theme.colors.text,
                          marginBottom: "0.25rem",
                          fontSize: "1.05rem",
                        }}
                      >
                        Avanzado
                      </div>
                      <div style={{ color: theme.colors.textSoft, fontSize: "0.95rem" }}>
                        Para usuarios que ya dominan la base y quieren trabajar estructuras más complejas.
                      </div>
                    </div>
                  </label>
                </div>

                <div
                  className="select-level-actions"
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  <button onClick={handleConfirm} style={primaryButtonStyle}>
                    Confirmar nivel
                  </button>
                </div>

                <div
                  style={{
                    marginTop: "1.25rem",
                    padding: "1rem",
                    background: "rgba(255,255,255,0.04)",
                    border: `1px solid ${theme.colors.border}`,
                    borderRadius: "14px",
                  }}
                >
                  <p style={{ margin: 0, color: theme.colors.textSoft, fontSize: "0.95rem" }}>
                    Más adelante el sistema podrá ajustar la dificultad según la evolución
                    del usuario y sus resultados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}