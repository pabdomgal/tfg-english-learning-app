import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";
import { downloadDiplomaPDF } from "../services/download";
import { theme, ui } from "../styles/theme";
import lertiLogo from "../assets/LERTI.png";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

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
    maxWidth: "980px",
    margin: "0 auto",
    padding: "16px",
    borderRadius: "10px",
    background: "#f5efe2",
    border: "8px solid #243f8f",
    boxShadow:
      "0 28px 70px rgba(2,8,25,0.22), inset 0 0 0 1px rgba(255,255,255,0.35)",
  };

  const diplomaInner = {
    position: "relative",
    minHeight: "920px",
    padding: "clamp(26px, 4vw, 52px)",
    border: "4px solid #243f8f",
    outline: "1px solid rgba(197,165,69,0.45)",
    outlineOffset: "-10px",
    background:
      "linear-gradient(180deg, rgba(255,250,241,0.98), rgba(247,241,228,0.98))",
    overflow: "hidden",
  };

  const goldLine = {
    width: "100%",
    height: "4px",
    borderRadius: "999px",
    background: "linear-gradient(90deg, #c89d2b 0%, #dfc164 50%, #c89d2b 100%)",
  };

  const sectionLabel = {
    margin: 0,
    color: "#6e7a97",
    fontSize: "0.9rem",
    fontWeight: 700,
    letterSpacing: "0.12em",
    textTransform: "uppercase",
    textAlign: "center",
  };

  const cornerBase = {
    position: "absolute",
    width: "84px",
    height: "84px",
    borderColor: "rgba(200,157,43,0.42)",
    pointerEvents: "none",
  };

  const sealOuter = {
    width: "160px",
    height: "160px",
    borderRadius: "999px",
    position: "relative",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background:
      "radial-gradient(circle at 30% 30%, #fffdf7 0%, #f1e6c8 58%, #d8bf76 100%)",
    boxShadow:
      "0 10px 26px rgba(122,92,21,0.20), inset 0 2px 8px rgba(255,255,255,0.85)",
    border: "2px solid rgba(189,149,48,0.75)",
  };

  const sealMiddle = {
    width: "132px",
    height: "132px",
    borderRadius: "999px",
    background:
      "radial-gradient(circle at 30% 30%, #fffefb 0%, #f8f1dc 65%, #e8d29a 100%)",
    border: "1.5px solid rgba(189,149,48,0.65)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    boxShadow: "inset 0 2px 10px rgba(255,255,255,0.7)",
  };

  const sealInner = {
    width: "102px",
    height: "102px",
    borderRadius: "999px",
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.96), rgba(248,243,229,0.96))",
    border: "1.5px dashed rgba(189,149,48,0.6)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    padding: "0.6rem",
    boxSizing: "border-box",
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

        @media (max-width: 900px) {
          .diploma-footer-area {
            flex-direction: column !important;
            align-items: center !important;
            gap: 1.5rem !important;
          }

          .diploma-seal-wrap {
            align-self: center !important;
          }
        }

        @media (max-width: 640px) {
          .diploma-actions {
            flex-direction: column !important;
            align-items: stretch !important;
          }

          .diploma-actions button {
            width: 100%;
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

          .diploma-paper {
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
                <div style={diplomaOuter} className="diploma-paper">
                  <div style={diplomaInner}>
                    <div
                      style={{
                        position: "relative",
                        zIndex: 1,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        minHeight: "780px",
                        textAlign: "center",
                        gap: "1rem",
                      }}
                    >
                      <img
                        src={lertiLogo}
                        alt="LERTI"
                        style={{
                          width: "140px",
                          height: "auto",
                          objectFit: "contain",
                        }}
                      />

                      <h2
                        style={{
                          margin: 0,
                          color: "#223b85",
                          fontSize: "clamp(2rem, 4vw, 3rem)",
                          fontWeight: 800,
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        Aún no has completado ningún nivel
                      </h2>

                      <p
                        style={{
                          margin: 0,
                          color: "#3e3e3e",
                          fontSize: "1.1rem",
                          fontFamily: "Georgia, 'Times New Roman', serif",
                        }}
                      >
                        Completa un nivel para desbloquear tu certificado oficial.
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
                  <div style={diplomaOuter} className="diploma-paper">
                    <div style={diplomaInner}>
                      <div
                        style={{
                          ...cornerBase,
                          top: "12px",
                          left: "12px",
                          borderTop: "3px solid rgba(200,157,43,0.42)",
                          borderLeft: "3px solid rgba(200,157,43,0.42)",
                          borderTopLeftRadius: "18px",
                        }}
                      />
                      <div
                        style={{
                          ...cornerBase,
                          top: "12px",
                          right: "12px",
                          borderTop: "3px solid rgba(200,157,43,0.42)",
                          borderRight: "3px solid rgba(200,157,43,0.42)",
                          borderTopRightRadius: "18px",
                        }}
                      />
                      <div
                        style={{
                          ...cornerBase,
                          bottom: "12px",
                          left: "12px",
                          borderBottom: "3px solid rgba(200,157,43,0.42)",
                          borderLeft: "3px solid rgba(200,157,43,0.42)",
                          borderBottomLeftRadius: "18px",
                        }}
                      />
                      <div
                        style={{
                          ...cornerBase,
                          bottom: "12px",
                          right: "12px",
                          borderBottom: "3px solid rgba(200,157,43,0.42)",
                          borderRight: "3px solid rgba(200,157,43,0.42)",
                          borderBottomRightRadius: "18px",
                        }}
                      />

                      <img
                        src={lertiLogo}
                        alt="LERTI marca de agua"
                        style={{
                          position: "absolute",
                          inset: 0,
                          margin: "auto",
                          width: "360px",
                          maxWidth: "58%",
                          opacity: 0.045,
                          objectFit: "contain",
                          pointerEvents: "none",
                        }}
                      />

                      <div
                        style={{
                          position: "relative",
                          zIndex: 1,
                          minHeight: "100%",
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "space-between",
                          gap: "1.6rem",
                        }}
                      >
                        <div>
                          <div style={goldLine} />

                          <div
                            style={{
                              marginTop: "1.7rem",
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
                                width: "150px",
                                height: "auto",
                                objectFit: "contain",
                                marginBottom: "0.9rem",
                              }}
                            />

                            <p style={sectionLabel}>English Training App</p>

                            <h1
                              style={{
                                margin: "1rem 0 0 0",
                                fontSize: "clamp(2.3rem, 4vw, 3.5rem)",
                                lineHeight: 1,
                                textAlign: "center",
                                color: "#223b85",
                                fontWeight: 800,
                                fontFamily: "Georgia, 'Times New Roman', serif",
                                letterSpacing: "-0.03em",
                              }}
                            >
                              CERTIFICADO
                            </h1>

                            <p
                              style={{
                                margin: "0.35rem 0 0 0",
                                fontSize: "clamp(1.1rem, 2vw, 1.5rem)",
                                textAlign: "center",
                                color: "#5b4b2a",
                                fontWeight: 500,
                                fontFamily: "Georgia, 'Times New Roman', serif",
                              }}
                            >
                              de finalización
                            </p>
                          </div>
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            textAlign: "center",
                            gap: "1.1rem",
                          }}
                        >
                          <p
                            style={{
                              margin: 0,
                              color: "#2d2d2d",
                              fontSize: "1.1rem",
                              fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                          >
                            Se certifica que
                          </p>

                          <h2
                            style={{
                              margin: 0,
                              color: "#111111",
                              fontSize: "clamp(2rem, 4vw, 3rem)",
                              fontWeight: 800,
                              fontFamily: "Georgia, 'Times New Roman', serif",
                              letterSpacing: "-0.02em",
                            }}
                          >
                            {user.name}
                          </h2>

                          <p
                            style={{
                              margin: 0,
                              color: "#2d2d2d",
                              fontSize: "1.15rem",
                              maxWidth: "700px",
                              lineHeight: 1.7,
                              fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                          >
                            ha completado satisfactoriamente el nivel
                          </p>

                          <div
                            style={{
                              padding: "0.3rem 1.25rem 0.15rem",
                              borderTop: "2px solid rgba(200,157,43,0.45)",
                              borderBottom: "2px solid rgba(200,157,43,0.45)",
                            }}
                          >
                            <div
                              style={{
                                color: "#b28a2b",
                                fontSize: "clamp(2.1rem, 4vw, 3.35rem)",
                                fontWeight: 900,
                                textTransform: "uppercase",
                                letterSpacing: "0.03em",
                                fontFamily: "Georgia, 'Times New Roman', serif",
                                textShadow: "0 1px 0 rgba(255,255,255,0.65)",
                              }}
                            >
                              {completedLevel}
                            </div>
                          </div>

                          <p
                            style={{
                              margin: "1rem 0 0 0",
                              color: "#2d2d2d",
                              fontSize: "1.02rem",
                              fontFamily: "Georgia, 'Times New Roman', serif",
                            }}
                          >
                            Fecha: {today}
                          </p>
                        </div>

                        <div
                          className="diploma-footer-area"
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            gap: "1rem",
                            marginTop: "1rem",
                          }}
                        >
                          <div
                            style={{
                              flex: 1,
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: "1rem",
                            }}
                          >
                            <div style={{ ...goldLine, maxWidth: "78%" }} />

                            <div
                              style={{
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                                gap: "0.4rem",
                              }}
                            >
                              <div
                                style={{
                                  color: "#243f8f",
                                  fontSize: "1.12rem",
                                  fontWeight: 700,
                                  fontFamily: "Georgia, 'Times New Roman', serif",
                                }}
                              >
                                LERTI
                              </div>

                              <div
                                style={{
                                  color: "#4b4b4b",
                                  fontSize: "0.98rem",
                                  fontFamily: "Georgia, 'Times New Roman', serif",
                                }}
                              >
                                English Training App
                              </div>
                            </div>
                          </div>

                          <div
                            className="diploma-seal-wrap"
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              alignSelf: "flex-end",
                            }}
                          >
                            <div style={sealOuter}>
                              <div
                                style={{
                                  position: "absolute",
                                  inset: 0,
                                  borderRadius: "999px",
                                  background:
                                    "repeating-conic-gradient(from 0deg, rgba(189,149,48,0.22) 0deg 8deg, transparent 8deg 16deg)",
                                  WebkitMask:
                                    "radial-gradient(circle, transparent 62px, black 63px)",
                                  mask:
                                    "radial-gradient(circle, transparent 62px, black 63px)",
                                  opacity: 0.55,
                                }}
                              />

                              <div style={sealMiddle}>
                                <div style={sealInner}>
                                  <div
                                    style={{
                                      fontSize: "0.52rem",
                                      color: "#8e6d18",
                                      fontWeight: 800,
                                      letterSpacing: "0.08em",
                                      lineHeight: 1.1,
                                      textTransform: "uppercase",
                                      marginBottom: "0.25rem",
                                    }}
                                  >
                                    English Training App
                                  </div>

                                  <img
                                    src={lertiLogo}
                                    alt="Sello LERTI"
                                    style={{
                                      width: "54px",
                                      height: "54px",
                                      objectFit: "contain",
                                      marginBottom: "0.2rem",
                                    }}
                                  />

                                  <div
                                    style={{
                                      fontSize: "0.72rem",
                                      color: "#243f8f",
                                      fontWeight: 900,
                                      letterSpacing: "0.06em",
                                      lineHeight: 1,
                                    }}
                                  >
                                    LERTI
                                  </div>

                                  <div
                                    style={{
                                      fontSize: "0.56rem",
                                      color: "#8e6d18",
                                      fontWeight: 800,
                                      letterSpacing: "0.08em",
                                      lineHeight: 1.1,
                                      textTransform: "uppercase",
                                      marginTop: "0.18rem",
                                    }}
                                  >
                                    Academy
                                  </div>
                                </div>
                              </div>
                            </div>
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
                      Descargar diploma (PDF)
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