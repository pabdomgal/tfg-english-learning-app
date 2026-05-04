import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";
import { downloadDiplomaPDF } from "../services/download";
import { theme, ui } from "../styles/theme";
import lertiLogo from "../assets/LERTI.png";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

function Divider({ color = "#C8A13A", width = "100%" }) {
  return (
    <div
      style={{
        width,
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
    >
      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(to right, transparent, ${color})`,
        }}
      />

      <div
        style={{
          width: "6px",
          height: "6px",
          background: color,
          transform: "rotate(45deg)",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          height: "1px",
          background: `linear-gradient(to left, transparent, ${color})`,
        }}
      />
    </div>
  );
}

function Seal({ logoSrc }) {
  return (
    <div
      style={{
        width: "118px",
        height: "118px",
        borderRadius: "999px",
        position: "relative",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
          "radial-gradient(circle at 30% 30%, #fffdf8 0%, #f5ecd3 58%, #d7b85a 100%)",
        border: "2px solid #C8A13A",
        boxShadow:
          "0 12px 26px rgba(90, 63, 10, 0.16), inset 0 2px 8px rgba(255,255,255,0.85)",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: "8px",
          borderRadius: "999px",
          border: "1px dashed rgba(200,161,58,0.85)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: "17px",
          borderRadius: "999px",
          background: "#101D4F",
          border: "1px solid rgba(255,255,255,0.35)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "inset 0 0 18px rgba(0,0,0,0.22)",
        }}
      >
        <img
          src={logoSrc}
          alt="LERTI"
          style={{
            width: "42px",
            height: "42px",
            objectFit: "contain",
            filter: "brightness(0) invert(1)",
          }}
        />
      </div>

      <div
        style={{
          position: "absolute",
          bottom: "-18px",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          fontFamily: "Arial, sans-serif",
          fontSize: "8px",
          color: "#101D4F",
          fontWeight: 800,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          whiteSpace: "nowrap",
        }}
      >
        LERTI Academy
      </div>
    </div>
  );
}

export default function LevelDiploma() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  useEffect(() => {
    if (!user) {
      nav("/start", { replace: true });
    }
  }, [user, nav]);

  if (!user) return null;

  const levelProgress = user.levelProgress || {};

  let completedLevel = user.justCompletedLevel || null;

  if (!completedLevel) {
    const completedLevels = LEVELS.filter(
      (level) => levelProgress[level]?.completed
    );

    completedLevel =
      completedLevels.length > 0
        ? completedLevels[completedLevels.length - 1]
        : null;
  }

  const today = new Date().toLocaleDateString("es-ES");

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

  const primaryButtonStyle = {
    ...ui.primaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
    boxShadow: theme.shadows.primaryGlow,
  };

  const secondaryButtonStyle = {
    ...ui.secondaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 700,
  };

  const diplomaOuter = {
    width: "100%",
    maxWidth: "640px",
    margin: "0 auto",
    background: "#F8F4EA",
    border: "5px solid #101D4F",
    padding: "10px",
    boxShadow: "0 28px 70px rgba(2,8,25,0.24)",
    position: "relative",
  };

  const diplomaPaper = {
    position: "relative",
    minHeight: "850px",
    padding: "42px 44px 38px",
    background:
      "linear-gradient(180deg, #FFFDF8 0%, #F8F4EA 52%, #F6EFDF 100%)",
    border: "1.5px solid #C8A13A",
    overflow: "hidden",
    fontFamily: "Georgia, 'Times New Roman', serif",
  };

  const smallCaps = {
    margin: 0,
    color: "#9CA3AF",
    fontFamily: "Arial, sans-serif",
    fontSize: "9px",
    fontWeight: 700,
    letterSpacing: "4px",
    textTransform: "uppercase",
    textAlign: "center",
  };

  return (
    <div style={ui.page}>
      <style>{`
        @keyframes fadeDiploma {
          from {
            opacity: 0;
            transform: translateY(16px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .diploma-main-card {
          animation: fadeDiploma 0.5s ease;
        }

        .diploma-paper {
          animation: fadeDiploma 0.6s ease;
        }

        @media (max-width: 640px) {
          .diploma-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .diploma-actions button {
            width: 100%;
          }

          .diploma-paper-content {
            padding: 32px 24px 34px !important;
            min-height: 760px !important;
          }

          .diploma-footer {
            flex-direction: column !important;
            align-items: center !important;
            gap: 2rem !important;
          }
        }

        @media print {
          body {
            background: #ffffff !important;
          }

          #root {
            width: 100% !important;
            max-width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .print-shell {
            background: #ffffff !important;
            border: none !important;
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .diploma-paper-wrap {
            box-shadow: none !important;
            margin: 0 auto !important;
            max-width: 100% !important;
          }

          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <div className="no-print">
          <Header userName={user.name} levelName={user.level ?? "-"} />
        </div>

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={pageShell} className="diploma-main-card print-shell">
            <div
              className="no-print"
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
              className="no-print"
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
                className="no-print"
                style={{
                  marginBottom: theme.spacing.xl,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: theme.spacing.lg,
                  flexWrap: "wrap",
                }}
              >
                <div>
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
                    Certificate view
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
                    Diploma del nivel
                  </h2>

                  <p
                    style={{
                      margin: `${theme.spacing.md} 0 0 0`,
                      color: theme.colors.textSoft,
                      fontSize: "1rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Diploma final con estilo premium y listo para PDF.
                  </p>
                </div>

                <div style={{ ...ui.badge, borderRadius: "999px" }}>
                  {completedLevel || "Nivel"}
                </div>
              </div>

              {!completedLevel ? (
                <div style={diplomaOuter} className="diploma-paper-wrap">
                  <div
                    style={{
                      ...diplomaPaper,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                    }}
                    className="diploma-paper diploma-paper-content"
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "1rem",
                        position: "relative",
                        zIndex: 1,
                      }}
                    >
                      <img
                        src={lertiLogo}
                        alt="LERTI"
                        style={{
                          width: "112px",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />

                      <h2
                        style={{
                          margin: "10px 0 0",
                          color: "#101D4F",
                          fontSize: "clamp(1.5rem, 4vw, 2rem)",
                          fontWeight: 800,
                          lineHeight: 1.2,
                        }}
                      >
                        Aún no has completado ningún nivel
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#555",
                          fontSize: "1rem",
                          maxWidth: "420px",
                          lineHeight: 1.6,
                        }}
                      >
                        Completa un nivel para desbloquear tu certificado
                        oficial.
                      </p>

                      <div style={{ marginTop: "1rem" }} className="no-print">
                        <button
                          style={secondaryButtonStyle}
                          onClick={() => nav("/menu")}
                        >
                          Volver al menú
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div style={diplomaOuter} className="diploma-paper-wrap">
                    <div
                      style={diplomaPaper}
                      className="diploma-paper diploma-paper-content"
                    >
                      <div
                        style={{
                          position: "absolute",
                          inset: "10px",
                          border: "2px solid #101D4F",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          position: "absolute",
                          inset: "17px",
                          border: "1px solid rgba(200,161,58,0.72)",
                          pointerEvents: "none",
                        }}
                      />

                      <img
                        src={lertiLogo}
                        alt=""
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          inset: 0,
                          margin: "auto",
                          width: "300px",
                          maxWidth: "56%",
                          opacity: 0.035,
                          objectFit: "contain",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          minHeight: "850px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          textAlign: "center",
                        }}
                      >
                        <img
                          src={lertiLogo}
                          alt="Logo LERTI"
                          style={{
                            width: "108px",
                            height: "auto",
                            objectFit: "contain",
                            marginBottom: "8px",
                          }}
                        />

                        <p style={smallCaps}>English Training App</p>

                        <h1
                          style={{
                            margin: "32px 0 6px",
                            color: "#101D4F",
                            fontSize: "clamp(2.2rem, 5vw, 3rem)",
                            fontWeight: 900,
                            lineHeight: 1,
                            letterSpacing: "6px",
                            textTransform: "uppercase",
                          }}
                        >
                          Certificado
                        </h1>

                        <p
                          style={{
                            ...smallCaps,
                            fontSize: "10px",
                            letterSpacing: "3px",
                            color: "#A7A7A7",
                          }}
                        >
                          de finalización
                        </p>

                        <div style={{ marginTop: "24px", width: "78%" }}>
                          <Divider color="#C8A13A" />
                        </div>

                        <div
                          style={{
                            marginTop: "34px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            gap: "15px",
                            width: "100%",
                          }}
                        >
                          <p style={smallCaps}>Se certifica que</p>

                          <h2
                            style={{
                              margin: 0,
                              color: "#101D4F",
                              fontSize: "clamp(2rem, 5vw, 2.75rem)",
                              fontWeight: 900,
                              lineHeight: 1.08,
                              letterSpacing: "0.3px",
                            }}
                          >
                            {user.name}
                          </h2>

                          <p
                            style={{
                              ...smallCaps,
                              maxWidth: "520px",
                              lineHeight: 1.8,
                              color: "#A7A7A7",
                            }}
                          >
                            ha completado satisfactoriamente el nivel
                          </p>

                          <div style={{ width: "76%", marginTop: "6px" }}>
                            <Divider color="#C8A13A" />
                          </div>

                          <div
                            style={{
                              padding: "14px 0 8px",
                              width: "100%",
                            }}
                          >
                            <span
                              style={{
                                color: "#C8A13A",
                                fontSize: "clamp(1.65rem, 4vw, 2.35rem)",
                                fontWeight: 900,
                                letterSpacing: "9px",
                                textTransform: "uppercase",
                                textShadow: "0 1px 0 rgba(255,255,255,0.8)",
                              }}
                            >
                              {completedLevel}
                            </span>
                          </div>

                          <div style={{ width: "76%" }}>
                            <Divider color="#C8A13A" />
                          </div>

                          <p
                            style={{
                              margin: "18px 0 0",
                              color: "#A7A7A7",
                              fontFamily: "Arial, sans-serif",
                              fontSize: "10px",
                              fontWeight: 700,
                              letterSpacing: "3px",
                              textTransform: "uppercase",
                            }}
                          >
                            Fecha:{" "}
                            <strong
                              style={{
                                color: "#111827",
                                letterSpacing: "1.5px",
                              }}
                            >
                              {today}
                            </strong>
                          </p>
                        </div>

                        <div
                          className="diploma-footer"
                          style={{
                            width: "100%",
                            marginTop: "auto",
                            paddingTop: "42px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "1.5rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "flex-start",
                              gap: "7px",
                              marginLeft: "10px",
                            }}
                          >
                            <div
                              style={{
                                width: "130px",
                                height: "1px",
                                background: "#101D4F",
                              }}
                            />

                            <span
                              style={{
                                color: "#101D4F",
                                fontFamily: "Arial, sans-serif",
                                fontSize: "12px",
                                fontWeight: 900,
                                letterSpacing: "1px",
                              }}
                            >
                              LERTI
                            </span>

                            <span
                              style={{
                                color: "#A7A7A7",
                                fontFamily: "Arial, sans-serif",
                                fontSize: "9px",
                                fontWeight: 700,
                                letterSpacing: "2px",
                                textTransform: "uppercase",
                              }}
                            >
                              English Training App
                            </span>
                          </div>

                          <div
                            style={{
                              marginRight: "8px",
                              marginBottom: "8px",
                            }}
                          >
                            <Seal logoSrc={lertiLogo} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="no-print diploma-actions"
                    style={{
                      marginTop: theme.spacing.xl,
                      display: "flex",
                      gap: theme.spacing.md,
                      flexWrap: "wrap",
                    }}
                  >
                    <button
                      style={primaryButtonStyle}
                      onClick={() =>
                        downloadDiplomaPDF(user.name, completedLevel, today)
                      }
                    >
                      Descargar diploma PDF
                    </button>

                    <button
                      style={secondaryButtonStyle}
                      onClick={() => nav("/menu")}
                    >
                      Continuar
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}