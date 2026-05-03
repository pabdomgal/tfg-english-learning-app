import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, addUser } from "../services/storage";
import { theme, ui } from "../styles/theme";

export default function WelcomeCreateUser() {
  const nav = useNavigate();
  const location = useLocation();

  const { user } = useMemo(() => getActiveUser(), []);
  const [name, setName] = useState("");

  const isForcedStart = location.pathname === "/start";

  useEffect(() => {
    if (!isForcedStart && user) {
      nav(user.level ? "/menu" : "/level", { replace: true });
    }
  }, [isForcedStart, user, nav]);

  if (!isForcedStart && user) return null;

  function handleCreate() {
    const clean = name.trim();
    if (!clean) return;
    const { user: newUser } = addUser(clean);
    nav(newUser.level ? "/menu" : "/level", { replace: true });
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      handleCreate();
    }
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

  const glassCard = {
    borderRadius: "26px",
    padding: "1.35rem",
    border: `1px solid ${theme.colors.borderStrong}`,
    background: `
      radial-gradient(circle at 85% 20%, rgba(255,255,255,0.05), transparent 22%),
      linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.025))
    `,
    boxShadow: "0 18px 44px rgba(2, 8, 25, 0.22)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
    position: "relative",
    overflow: "hidden",
  };

  const innerCard = {
    borderRadius: "22px",
    padding: "1.2rem 1.15rem",
    border: `1px solid ${theme.colors.border}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "0 12px 28px rgba(2,8,25,0.14)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const smallLabel = {
    margin: 0,
    color: theme.colors.textMuted,
    fontSize: "0.78rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const primaryButtonStyle = {
    ...ui.primaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
    boxShadow: theme.shadows.primaryGlow,
    minWidth: "170px",
  };

  const secondaryButtonStyle = {
    ...ui.secondaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 700,
    minWidth: "140px",
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

        .welcome-main-card {
          animation: fadeSlideUp 0.5s ease;
        }

        .welcome-grid {
          display: grid;
          grid-template-columns: 1.05fr 0.95fr;
          gap: ${theme.spacing.xl};
          align-items: stretch;
        }

        @media (max-width: 900px) {
          .welcome-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user?.name} levelName={user?.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={pageShell} className="welcome-main-card">
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
              <div
                className="welcome-grid"
                style={{ marginBottom: theme.spacing.xl }}
              >
                <div style={glassCard}>
                  <p style={smallLabel}>Welcome</p>

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
                    Crea tu usuario
                  </h2>

                  <p
                    style={{
                      margin: `${theme.spacing.md} 0 0 0`,
                      color: theme.colors.textSoft,
                      fontSize: "1rem",
                      lineHeight: 1.65,
                      maxWidth: "620px",
                    }}
                  >
                    {isForcedStart && user
                      ? "Ya existe un usuario activo. Puedes crear otro nuevo si quieres o volver al perfil actual."
                      : "Empieza creando un usuario para guardar tu progreso y acceder a las lecciones."}
                  </p>

                  <div
                    style={{
                      marginTop: theme.spacing.xl,
                      display: "grid",
                      gap: theme.spacing.lg,
                    }}
                  >
                    <div style={innerCard}>
                      <label
                        htmlFor="user-name"
                        style={{
                          display: "block",
                          marginBottom: theme.spacing.sm,
                          color: theme.colors.text,
                          fontWeight: 800,
                          fontSize: "0.98rem",
                        }}
                      >
                        Nombre del usuario
                      </label>

                      <input
                        id="user-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Escribe tu nombre"
                        style={{
                          ...ui.input,
                          width: "100%",
                          minHeight: "58px",
                          borderRadius: "18px",
                          background: "rgba(255,255,255,0.06)",
                          boxShadow: "0 10px 26px rgba(2,8,25,0.12)",
                          color: theme.colors.text,
                          marginBottom: "1rem",
                        }}
                      />

                      <div
                        style={{
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button onClick={handleCreate} style={primaryButtonStyle}>
                          Crear usuario
                        </button>

                        {user && (
                          <button
                            onClick={() => nav(user.level ? "/menu" : "/level")}
                            style={secondaryButtonStyle}
                          >
                            Volver
                          </button>
                        )}
                      </div>
                    </div>

                    <div style={innerCard}>
                      <p
                        style={{
                          margin: 0,
                          color: theme.colors.textSoft,
                          fontSize: "0.96rem",
                          lineHeight: 1.7,
                        }}
                      >
                        El progreso del usuario se guardará localmente en el navegador
                        para poder continuar en futuras sesiones.
                      </p>
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    ...glassCard,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    gap: theme.spacing.lg,
                  }}
                >
                  <div>
                    <p style={smallLabel}>Quick info</p>

                    <h3
                      style={{
                        margin: `${theme.spacing.sm} 0 0 0`,
                        color: theme.colors.text,
                        fontWeight: 900,
                        fontSize: "1.45rem",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      Antes de empezar
                    </h3>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: theme.spacing.md,
                    }}
                  >
                    <div style={innerCard}>
                      <div
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "0.45rem",
                        }}
                      >
                        01
                      </div>
                      <div
                        style={{
                          color: theme.colors.text,
                          fontWeight: 800,
                          marginBottom: "0.3rem",
                        }}
                      >
                        Tu progreso será personal
                      </div>
                      <div
                        style={{
                          color: theme.colors.textSoft,
                          lineHeight: 1.6,
                          fontSize: "0.95rem",
                        }}
                      >
                        Cada usuario mantiene sus estadísticas, lecciones y repaso de errores.
                      </div>
                    </div>

                    <div style={innerCard}>
                      <div
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "0.45rem",
                        }}
                      >
                        02
                      </div>
                      <div
                        style={{
                          color: theme.colors.text,
                          fontWeight: 800,
                          marginBottom: "0.3rem",
                        }}
                      >
                        Elige tu nivel
                      </div>
                      <div
                        style={{
                          color: theme.colors.textSoft,
                          lineHeight: 1.6,
                          fontSize: "0.95rem",
                        }}
                      >
                        Después podrás entrar en Principiante, Intermedio o Avanzado.
                      </div>
                    </div>

                    <div style={innerCard}>
                      <div
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          marginBottom: "0.45rem",
                        }}
                      >
                        03
                      </div>
                      <div
                        style={{
                          color: theme.colors.text,
                          fontWeight: 800,
                          marginBottom: "0.3rem",
                        }}
                      >
                        Práctica guiada
                      </div>
                      <div
                        style={{
                          color: theme.colors.textSoft,
                          lineHeight: 1.6,
                          fontSize: "0.95rem",
                        }}
                      >
                        Harás ejercicios, repaso de errores y seguimiento del progreso.
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      ...ui.badge,
                      borderRadius: "999px",
                      alignSelf: "flex-start",
                    }}
                  >
                    Listo para empezar
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>  
    </div>
  );
}