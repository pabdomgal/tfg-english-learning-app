import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import {
  getActiveUser,
  getLastSession,
  loadState,
  saveState,
} from "../services/storage";
import lessons from "../data/lessons.json";
import { formatTag } from "../services/tagFormat";
import { theme, ui } from "../styles/theme";

function buildRecommendation(errorTagsCount) {
  const entries = Object.entries(errorTagsCount || {});
  if (entries.length === 0) return "Vas muy bien. Sigue con la práctica diaria.";

  entries.sort((a, b) => b[1] - a[1]);
  const [topTag, topCount] = entries[0];

  if (topTag === "grammar") {
    return `Recomendación: repasa gramática (fallos: ${topCount}).`;
  }
  if (topTag === "vocabulary") {
    return `Recomendación: refuerza vocabulario (fallos: ${topCount}).`;
  }
  if (topTag === "listening") {
    return `Recomendación: practica listening (fallos: ${topCount}).`;
  }

  return `Recomendación: refuerza el área "${formatTag(topTag)}" (fallos: ${topCount}).`;
}

function formatAnswer(value) {
  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (item?.left && item?.right) return `${item.left} → ${item.right}`;
        return JSON.stringify(item);
      })
      .join(" | ");
  }
  return String(value ?? "-");
}

function getPedagogicalTip(item) {
  if (!item) return null;

  const tags = Array.isArray(item.tags) ? item.tags : [];
  const answerText = Array.isArray(item.answer)
    ? item.answer.map((p) => `${p.left}-${p.right}`).join(" | ")
    : String(item.answer ?? "").toLowerCase();

  if (item.type === "order_words") {
    if (answerText.includes("every day")) {
      return "Recuerda que 'todos los días' se traduce como 'every day'.";
    }

    if (answerText.includes("at school")) {
      return "Fíjate bien en la preposición correcta dentro de la expresión completa.";
    }

    if (answerText.includes("at home")) {
      return "Recuerda que 'en casa' suele expresarse como 'at home'.";
    }

    return "Fíjate en el orden de la frase: sujeto + verbo + complementos.";
  }

  if (item.type === "listening_build") {
    return "Escucha otra vez y fíjate en el orden exacto de las palabras.";
  }

  if (item.type === "match_pairs") {
    return "Relaciona primero las palabras que tengas totalmente claras y deja las dudosas para el final.";
  }

  if (item.type === "fill_blank") {
    if (tags.includes("verb_to_be")) {
      return "Recuerda: I am, he/she/it is, you/we/they are.";
    }

    if (tags.includes("present_simple")) {
      if (answerText.endsWith("s")) {
        return "Aquí la forma correcta lleva -s porque el sujeto es he, she o it.";
      }
      return "Fíjate bien en qué sujeto acompaña al verbo antes de completar.";
    }

    return "Lee la frase completa antes de decidir la palabra que falta.";
  }

  if (item.type === "multiple_choice") {
    if (tags.includes("verb_to_be")) {
      return "Repasa qué forma de 'to be' corresponde a cada sujeto.";
    }

    if (tags.includes("present_simple")) {
      if (answerText.endsWith("s")) {
        return "Observa si el sujeto necesita verbo con -s o sin -s.";
      }
      return "Fíjate bien en el sujeto para decidir la forma correcta del verbo.";
    }

    if (tags.includes("vocabulary")) {
      return "Piensa primero en el significado exacto de la palabra clave.";
    }

    return "Busca la opción que encaje mejor en significado y estructura.";
  }

  if (tags.includes("listening")) {
    return "Escucha otra vez y presta atención al orden exacto de las palabras.";
  }

  if (tags.includes("translation")) {
    return "Fíjate bien en el orden natural de la frase en inglés.";
  }

  if (tags.includes("vocabulary")) {
    return "Piensa primero en el significado exacto de la palabra clave.";
  }

  if (tags.includes("grammar")) {
    return "Revisa bien la estructura gramatical antes de comprobar.";
  }

  return "Revisa la estructura de la frase y vuelve a intentarlo.";
}

function ProgressRing({ value = 0, label = "" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 50;
  const stroke = 9;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: "122px",
        height: "122px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <svg
        height={radius * 2}
        width={radius * 2}
        style={{
          transform: "rotate(-90deg)",
          overflow: "visible",
          filter: "drop-shadow(0 0 10px rgba(212,255,38,0.14))",
        }}
      >
        <circle
          stroke="rgba(255,255,255,0.08)"
          fill="transparent"
          strokeWidth={stroke}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
        <circle
          stroke={theme.colors.accent}
          fill="transparent"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset,
            transition: "stroke-dashoffset 0.45s ease",
          }}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "0.15rem",
        }}
      >
        <span
          style={{
            fontSize: "0.78rem",
            color: theme.colors.textSoft,
            fontWeight: 700,
          }}
        >
          {label || "Resultado"}
        </span>
        <span
          style={{
            fontSize: "1.85rem",
            color: theme.colors.text,
            fontWeight: 900,
            lineHeight: 1,
            letterSpacing: "-0.04em",
          }}
        >
          {safeValue}%
        </span>
      </div>
    </div>
  );
}

function getLessonsCountByLevel(levelName) {
  const levelLessons = lessons?.[levelName];
  return Array.isArray(levelLessons) ? levelLessons.length : 0;
}

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

function getCompletedLevelFromProgress(user) {
  const levelProgress = user?.levelProgress || {};
  const completedLevels = LEVELS.filter((level) => levelProgress[level]?.completed);
  return completedLevels.length > 0
    ? completedLevels[completedLevels.length - 1]
    : null;
}

export default function SessionSummary() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const lastSession = useMemo(() => getLastSession(), []);

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
      <div style={ui.page}>
        <div style={ui.shell}>
          <Header userName={user.name} levelName={user.level ?? "-"} />
          <div style={{ marginTop: theme.spacing.xl }}>
            <div
              style={{
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
              }}
            >
              <h2
                style={{
                  margin: 0,
                  color: theme.colors.text,
                  fontSize: "2.2rem",
                  fontWeight: 900,
                  letterSpacing: "-0.04em",
                }}
              >
                Resumen
              </h2>
              <p
                style={{
                  marginTop: theme.spacing.md,
                  color: theme.colors.textSoft,
                }}
              >
                No hay ninguna sesión registrada todavía.
              </p>
              <div style={{ marginTop: theme.spacing.xl }}>
                <button
                  style={{
                    ...ui.secondaryButton,
                    minHeight: "52px",
                    borderRadius: "16px",
                    fontWeight: 700,
                  }}
                  onClick={() => nav("/menu")}
                >
                  Volver al menú
                </button>
              </div>
            </div>
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

  const currentLevelName = user.level ?? "Principiante";
  const lp = user.levelProgress?.[currentLevelName] || null;

  const lessonsCount = getLessonsCountByLevel(currentLevelName);
  const currentLessonIndex = user.lessonIndexByLevel?.[currentLevelName] ?? 0;

  const lastCompletedLevel = getCompletedLevelFromProgress(user);

  const isCurrentLevelAlreadyCompleted =
    user.levelProgress?.[currentLevelName]?.completed === true;

  let completedLessons = 0;

  if (isCurrentLevelAlreadyCompleted) {
    completedLessons = lessonsCount;
  } else {
    completedLessons =
      lessonsCount > 0
        ? Math.max(0, Math.min(currentLessonIndex, lessonsCount))
        : 0;
  }

  if (lastCompletedLevel && lastCompletedLevel !== currentLevelName) {
    // El usuario ya pasó al siguiente nivel.
    // Seguimos mostrando el progreso del nivel actual.
  }

  const lessonsPercent =
    lessonsCount > 0
      ? Math.round((completedLessons / lessonsCount) * 100)
      : 0;

  const levelPercent =
    lp && lp.totalExercises > 0
      ? Math.round((lp.correct / lp.totalExercises) * 100)
      : 0;

  const isLevelFullyDone = lessonsCount > 0 && completedLessons >= lessonsCount;
  const hasPassedLevel = isLevelFullyDone && levelPercent >= 60;
  const hasFailedLevel = isLevelFullyDone && levelPercent < 60;

  let levelStatusText = "En progreso";
  let levelStatusColor = theme.colors.textSoft;

  if (hasPassedLevel) {
    levelStatusText = "Nivel completado";
    levelStatusColor = "#d8ffe7";
  } else if (hasFailedLevel) {
    levelStatusText = "Se repetirá el nivel";
    levelStatusColor = "#ffe1e6";
  }

  const wrongItems = Array.isArray(lastSession.wrongItems) ? lastSession.wrongItems : [];

  const mainShell = {
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
    borderRadius: "24px",
    padding: "1.15rem 1.2rem",
    border: `1px solid ${theme.colors.border}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "0 12px 28px rgba(2,8,25,0.14)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const sectionCard = {
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

  const tagChip = {
    background: "rgba(212,255,38,0.10)",
    border: `1px solid ${theme.colors.borderAccent}`,
    borderRadius: "999px",
    padding: "0.45rem 0.8rem",
    fontSize: "0.92rem",
    fontWeight: 700,
    color: theme.colors.text,
    boxShadow: "0 0 0 1px rgba(212,255,38,0.06)",
  };

  const metricCard = {
    ...glassCard,
    minHeight: "130px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const promptCard = {
    borderRadius: "22px",
    padding: "1rem 1.15rem",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.035)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const primaryButtonStyle = {
    ...ui.primaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
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

        .summary-main-card {
          animation: fadeSlideUp 0.5s ease;
        }

        .summary-hover:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 720px) {
          .summary-top-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={mainShell} className="summary-main-card">
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
                className="summary-top-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: theme.spacing.xl,
                  alignItems: "center",
                  marginBottom: theme.spacing.xl,
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
                    Session summary
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
                    Resumen de la sesión
                  </h2>

                  <p
                    style={{
                      margin: `${theme.spacing.md} 0 0 0`,
                      color: theme.colors.textSoft,
                      fontSize: "1rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Aquí puedes ver el resultado de la sesión y tu progreso general.
                  </p>
                </div>

                <div
                  style={{
                    ...glassCard,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    minWidth: "150px",
                  }}
                >
                  <ProgressRing value={percent} label="Acierto" />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={metricCard} className="summary-hover">
                  <div
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Ejercicios
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: theme.colors.text,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {lastSession.total}
                  </div>
                </div>

                <div style={metricCard} className="summary-hover">
                  <div
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Aciertos
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: "#d8ffe7",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {lastSession.correct}
                  </div>
                </div>

                <div style={metricCard} className="summary-hover">
                  <div
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Errores
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: "#ffd7df",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {lastSession.wrong}
                  </div>
                </div>

                <div style={metricCard} className="summary-hover">
                  <div
                    style={{
                      color: theme.colors.textMuted,
                      fontSize: "0.78rem",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    Porcentaje
                  </div>
                  <div
                    style={{
                      fontSize: "2rem",
                      fontWeight: 900,
                      color: theme.colors.text,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {percent}%
                  </div>
                </div>
              </div>

              {lp && (
                <div style={{ ...sectionCard, marginBottom: theme.spacing.xl }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: theme.spacing.md,
                      flexWrap: "wrap",
                      marginBottom: theme.spacing.lg,
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
                        Current level
                      </p>
                      <h3
                        style={{
                          margin: `${theme.spacing.sm} 0 0 0`,
                          color: theme.colors.text,
                          fontWeight: 900,
                          fontSize: "1.45rem",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        Progreso del nivel actual
                      </h3>
                    </div>

                    <div
                      style={{
                        ...ui.badge,
                        borderRadius: "999px",
                        background: hasPassedLevel
                          ? "rgba(69,212,131,0.16)"
                          : hasFailedLevel
                            ? "rgba(255,107,129,0.16)"
                            : theme.colors.accentSoft,
                        border: hasPassedLevel
                          ? "1px solid rgba(69,212,131,0.35)"
                          : hasFailedLevel
                            ? "1px solid rgba(255,107,129,0.35)"
                            : `1px solid ${theme.colors.borderAccent}`,
                        color: hasPassedLevel
                          ? "#d8ffe7"
                          : hasFailedLevel
                            ? "#ffe1e6"
                            : theme.colors.accent,
                        boxShadow: "none",
                      }}
                    >
                      {levelStatusText}
                    </div>
                  </div>

                  <p
                    style={{
                      marginBottom: "0.75rem",
                      color: theme.colors.textSoft,
                      lineHeight: 1.6,
                    }}
                  >
                    <strong style={{ color: theme.colors.text }}>Objetivo:</strong>{" "}
                    completar todas las lecciones del nivel y alcanzar al menos un 60%
                    de acierto global en ese nivel.
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gap: theme.spacing.lg,
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                    }}
                  >
                    <div style={glassCard}>
                      <div
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Lecciones completadas
                      </div>
                      <div
                        style={{
                          marginTop: theme.spacing.sm,
                          fontSize: "1.5rem",
                          fontWeight: 900,
                          color: theme.colors.text,
                        }}
                      >
                        {completedLessons} / {lessonsCount}
                      </div>
                      <div style={{ marginTop: theme.spacing.md }}>
                        <div style={ui.progressTrack}>
                          <div style={ui.progressBar(lessonsPercent)} />
                        </div>
                      </div>
                    </div>

                    <div style={glassCard}>
                      <div
                        style={{
                          color: theme.colors.textMuted,
                          fontSize: "0.78rem",
                          fontWeight: 800,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                        }}
                      >
                        Acierto en el nivel
                      </div>
                      <div
                        style={{
                          marginTop: theme.spacing.sm,
                          fontSize: "1.5rem",
                          fontWeight: 900,
                          color: levelStatusColor,
                        }}
                      >
                        {levelPercent}%
                      </div>
                      <div style={{ marginTop: theme.spacing.md }}>
                        <div style={ui.progressTrack}>
                          <div style={ui.progressBar(levelPercent)} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ ...sectionCard, marginBottom: theme.spacing.xl }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: theme.spacing.md,
                    flexWrap: "wrap",
                    marginBottom: theme.spacing.lg,
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
                      Recommendation
                    </p>
                    <h3
                      style={{
                        margin: `${theme.spacing.sm} 0 0 0`,
                        color: theme.colors.text,
                        fontWeight: 900,
                        fontSize: "1.45rem",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      Recomendación
                    </h3>
                  </div>

                  <div style={{ ...ui.badge, borderRadius: "999px" }}>
                    Siguiente foco
                  </div>
                </div>

                <p
                  style={{
                    margin: 0,
                    color: theme.colors.textSoft,
                    lineHeight: 1.7,
                    fontSize: "1rem",
                  }}
                >
                  {recommendation}
                </p>
              </div>

              <div style={{ ...sectionCard, marginBottom: theme.spacing.xl }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: theme.spacing.md,
                    flexWrap: "wrap",
                    marginBottom: theme.spacing.lg,
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
                      Error tags
                    </p>
                    <h3
                      style={{
                        margin: `${theme.spacing.sm} 0 0 0`,
                        color: theme.colors.text,
                        fontWeight: 900,
                        fontSize: "1.45rem",
                        letterSpacing: "-0.03em",
                      }}
                    >
                      Detalle por tipo
                    </h3>
                  </div>

                  <div style={{ ...ui.badge, borderRadius: "999px" }}>Tags</div>
                </div>

                {Object.keys(lastSession.errorTagsCount || {}).length === 0 ? (
                  <p style={{ margin: 0, color: theme.colors.textSoft }}>
                    No se detectaron tipos de error.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {Object.entries(lastSession.errorTagsCount)
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, count]) => (
                        <span key={tag} style={tagChip}>
                          {formatTag(tag)} ({count})
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {wrongItems.length > 0 && (
                <div style={sectionCard}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: theme.spacing.md,
                      flexWrap: "wrap",
                      marginBottom: theme.spacing.lg,
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
                        Error details
                      </p>
                      <h3
                        style={{
                          margin: `${theme.spacing.sm} 0 0 0`,
                          color: theme.colors.text,
                          fontWeight: 900,
                          fontSize: "1.45rem",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        Errores de esta sesión
                      </h3>
                    </div>

                    <div style={{ ...ui.badge, borderRadius: "999px" }}>
                      {wrongItems.length} errores
                    </div>
                  </div>

                  <div style={{ display: "grid", gap: theme.spacing.lg }}>
                    {wrongItems.map((item) => {
                      const pedagogicalTip = getPedagogicalTip(item);

                      return (
                        <div
                          key={item.exerciseId}
                          style={{
                            ...promptCard,
                            padding: "1.1rem 1.15rem",
                          }}
                          className="summary-hover"
                        >
                          <div style={{ marginBottom: "0.75rem" }}>
                            <span
                              style={{
                                background: "rgba(255,255,255,0.06)",
                                border: `1px solid ${theme.colors.border}`,
                                borderRadius: "999px",
                                padding: "0.35rem 0.75rem",
                                fontSize: "0.82rem",
                                fontWeight: 700,
                                color: theme.colors.textSoft,
                              }}
                            >
                              {item.type ? item.type.replaceAll("_", " ") : "ejercicio"}
                            </span>
                          </div>

                          <div style={{ marginBottom: "0.6rem", color: theme.colors.text }}>
                            <strong>Ejercicio:</strong> {item.prompt}
                          </div>

                          <div style={{ marginBottom: "0.45rem", color: "#ffd7df" }}>
                            <strong>Tu respuesta:</strong> {formatAnswer(item.selected)}
                          </div>

                          <div style={{ color: "#d8ffe7" }}>
                            <strong>Correcta:</strong> {formatAnswer(item.answer)}
                          </div>

                          {pedagogicalTip && (
                            <div
                              style={{
                                marginTop: "0.75rem",
                                color: "#ffe9b8",
                                fontSize: "0.95rem",
                                fontWeight: 600,
                                lineHeight: 1.5,
                              }}
                            >
                              💡 Pista: {pedagogicalTip}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div
                style={{
                  marginTop: theme.spacing.xl,
                  display: "flex",
                  gap: theme.spacing.md,
                  flexWrap: "wrap",
                }}
              >
                <button style={primaryButtonStyle} onClick={() => nav("/menu")}>
                  Volver al menú
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}