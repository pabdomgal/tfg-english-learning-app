import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getActiveUser,
  exportProgressJSON,
  resetActiveUserProgress,
  importProgressJSON,
} from "../services/storage";
import { downloadJSON } from "../services/download";
import { theme, ui } from "../styles/theme";


export default function MainMenu() {
  const nav = useNavigate();
  const { user } = getActiveUser();

  useEffect(() => {
    if (!user) {
      nav("/start", { replace: true });
    }
  }, [user, nav]);

  if (!user) return null;

  function handleExport() {
    const data = exportProgressJSON();
    if (!data) return;
    downloadJSON(`progreso_${user.name}.json`, data);
  }
  
  function handleImport() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        const ok = importProgressJSON(data);
        if (ok) {
          window.location.reload();
        } else {
          alert("El archivo no es válido.");
        }
      } catch {
        alert("Error al leer el archivo.");
      }
    };
    reader.readAsText(file);
  };
  input.click();
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

  const heroCardStyle = {
    position: "relative",
    overflow: "hidden",
    borderRadius: theme.radius.xl,
    padding: theme.spacing.xxl,
    border: `1px solid ${theme.colors.borderStrong}`,
    background: `
      radial-gradient(circle at 15% 10%, rgba(37,99,235,0.14), transparent 22%),
      radial-gradient(circle at 85% 18%, rgba(139,92,246,0.12), transparent 24%),
      linear-gradient(180deg, ${theme.colors.bgPanelStrong} 0%, ${theme.colors.bgPanel} 100%)
    `,
    boxShadow: theme.shadows.card,
    backdropFilter: theme.blur.lg,
    WebkitBackdropFilter: theme.blur.lg,
  };

  const statMiniCard = {
    flex: "1 1 190px",
    minWidth: "190px",
    borderRadius: "22px",
    padding: "1rem 1.1rem",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.05)",
    boxShadow: theme.shadows.cardSoft,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const actionCard = {
    position: "relative",
    overflow: "hidden",
    borderRadius: "24px",
    padding: "1.45rem",
    border: `1px solid ${theme.colors.border}`,
    background: `
      linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))
    `,
    boxShadow: theme.shadows.cardSoft,
    transition: theme.transitions.springy,
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const sectionTitle = {
    margin: 0,
    color: theme.colors.text,
    fontSize: "clamp(2rem, 4vw, 2.7rem)",
    fontWeight: 900,
    letterSpacing: "-0.04em",
    lineHeight: 1.05,
  };

  const cardTitle = {
    margin: 0,
    color: theme.colors.text,
    fontWeight: 850,
    fontSize: "1.22rem",
    letterSpacing: "-0.02em",
  };

  const smallLabel = {
    ...theme.typography.label,
    color: theme.colors.textMuted,
    margin: 0,
  };

  const badgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.38rem 0.9rem",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.borderAccent}`,
    background: theme.colors.accentSoft,
    color: theme.colors.accent,
    fontSize: "0.8rem",
    fontWeight: 800,
    boxShadow: theme.shadows.accentGlow,
    whiteSpace: "nowrap",
  };

  const neutralBadgeStyle = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "0.38rem 0.9rem",
    borderRadius: theme.radius.pill,
    border: `1px solid ${theme.colors.borderStrong}`,
    background: "rgba(255,255,255,0.05)",
    color: theme.colors.textSoft,
    fontSize: "0.8rem",
    fontWeight: 800,
    whiteSpace: "nowrap",
  };

  const mainButtonStyle = {
    ...ui.primaryButton,
    width: "100%",
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    boxShadow: theme.shadows.primaryGlow,
  };

  const secondaryButtonStyle = {
    ...ui.secondaryButton,
    width: "100%",
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 750,
  };

  return (
    <div style={ui.page}>
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .premium-main-card {
          animation: fadeSlideUp 0.45s ease-out;
        }

        .premium-hover:hover {
          transform: translateY(-4px);
          box-shadow: 0 24px 46px rgba(2, 8, 25, 0.34);
          border-color: ${theme.colors.borderStrong};
          background: rgba(255,255,255,0.08);
        }

        .premium-button-hover:hover {
          transform: translateY(-1px);
        }

        @media (max-width: 760px) {
          .menu-top-stats {
            flex-direction: column;
          }

          .menu-actions-grid {
            grid-template-columns: 1fr !important;
          }

          .menu-settings-actions {
            flex-direction: column;
          }

          .menu-settings-actions button {
            width: 100%;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={heroCardStyle} className="premium-main-card">
            <div
              style={{
                position: "absolute",
                top: "-90px",
                right: "-100px",
                width: "280px",
                height: "280px",
                borderRadius: "50%",
                background: theme.colors.primarySoft,
                filter: "blur(70px)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-90px",
                left: "-90px",
                width: "240px",
                height: "240px",
                borderRadius: "50%",
                background: theme.colors.violetSoft,
                filter: "blur(70px)",
                pointerEvents: "none",
                opacity: 0.65,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: theme.spacing.xl,
                  flexWrap: "wrap",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div>
                  <h2 style={sectionTitle}>Menú principal</h2>
                  <p
                    style={{
                      color: theme.colors.textSoft,
                      marginTop: theme.spacing.sm,
                      fontSize: "1rem",
                      maxWidth: "620px",
                      lineHeight: 1.55,
                    }}
                  >
                    Accede rápido a tu sesión, revisa tu progreso o gestiona tu cuenta.
                  </p>
                </div>

                <div style={badgeStyle}>{user.level ?? "-"}</div>
              </div>

              <div
                className="menu-top-stats"
                style={{
                  display: "flex",
                  gap: theme.spacing.lg,
                  flexWrap: "wrap",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={statMiniCard}>
                  <p style={smallLabel}>Usuario</p>
                  <p
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      fontSize: "1.18rem",
                      fontWeight: 850,
                      color: theme.colors.text,
                    }}
                  >
                    {user.name}
                  </p>
                </div>

                <div style={statMiniCard}>
                  <p style={smallLabel}>Nivel</p>
                  <p
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      fontSize: "1.18rem",
                      fontWeight: 850,
                      color: theme.colors.text,
                    }}
                  >
                    {user.level ?? "-"}
                  </p>
                </div>
              </div>

              <div
                className="menu-actions-grid"
                style={{
                  display: "grid",
                  gap: theme.spacing.lg,
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={actionCard} className="premium-hover">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <h3 style={cardTitle}>Sesión diaria</h3>
                    <div style={badgeStyle}>Hoy</div>
                  </div>

                  <p
                    style={{
                      color: theme.colors.textSoft,
                      marginBottom: theme.spacing.lg,
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Empieza tu práctica del día.
                  </p>

                  <button
                    className="premium-button-hover"
                    style={mainButtonStyle}
                    onClick={() => nav("/session")}
                  >
                    Comenzar sesión
                  </button>
                </div>

                <div style={actionCard} className="premium-hover">
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.md,
                    }}
                  >
                    <h3 style={cardTitle}>Estadísticas</h3>
                    <div style={neutralBadgeStyle}>Progreso</div>
                  </div>

                  <p
                    style={{
                      color: theme.colors.textSoft,
                      marginBottom: theme.spacing.lg,
                      fontSize: "0.95rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Consulta tu evolución.
                  </p>

                  <button
                    className="premium-button-hover"
                    style={secondaryButtonStyle}
                    onClick={() => nav("/stats")}
                  >
                    Ver estadísticas
                  </button>
                </div>
              </div>

              <div
                style={{
                  ...actionCard,
                  padding: theme.spacing.xl,
                  background: "rgba(255,255,255,0.045)",
                  boxShadow: "0 12px 28px rgba(2, 8, 25, 0.18)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: theme.spacing.md,
                  }}
                >
                  <h3 style={cardTitle}>Ajustes</h3>
                </div>

                <p
                  style={{
                    color: theme.colors.textSoft,
                    marginBottom: theme.spacing.lg,
                    fontSize: "0.95rem",
                    lineHeight: 1.55,
                  }}
                >
                  Gestiona tu usuario y tus datos guardados.
                </p>

                <div
                  className="menu-settings-actions"
                  style={{
                    display: "flex",
                    gap: theme.spacing.md,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    className="premium-button-hover"
                    style={{ ...ui.secondaryButton, borderRadius: theme.radius.md }}
                    onClick={() => nav("/start")}
                  >
                    Nuevo usuario
                  </button>

                  <button
                    className="premium-button-hover"
                    style={{ ...ui.ghostButton, borderRadius: theme.radius.md }}
                    onClick={handleReset}
                  >
                    Reiniciar progreso
                  </button>

                  <button
                    className="premium-button-hover"
                    style={{ ...ui.ghostButton, borderRadius: theme.radius.md }}
                    onClick={handleExport}
                  >
                    Exportar JSON
                  </button>

                  <button
                    className="premium-button-hover"
                    style={{ ...ui.ghostButton, borderRadius: theme.radius.md }}
                    onClick={handleImport}
                  >
                    Importar JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}