import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";
import { formatTag } from "../services/tagFormat";
import { theme, ui } from "../styles/theme";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

import { Line, Radar } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Title,
  Tooltip,
  Legend
);

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

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(value || 0)));
}

function average(list) {
  if (!list.length) return 0;
  return list.reduce((acc, n) => acc + n, 0) / list.length;
}

function getSkillScores(history = []) {
  const buckets = {
    vocabulary: [],
    grammar: [],
    listening: [],
    translation: [],
    present_simple: [],
    verb_to_be: [],
    past_simple: [],
    business: [],
    travel: [],
    school: [],
    free_time: [],
    analysis: [],
  };

  history.forEach((session) => {
    const percent =
      session.total > 0 ? (session.correct / session.total) * 100 : 0;

    const errorTags = session.errorTagsCount || {};
    const hasTags = Object.keys(errorTags).length > 0;

    if (!hasTags) {
      Object.keys(buckets).forEach((key) => {
        buckets[key].push(percent);
      });
      return;
    }

    Object.keys(buckets).forEach((key) => {
      const failures = errorTags[key] || 0;
      const penalty = failures * 18;
      const score = Math.max(12, percent - penalty);
      if (errorTags[key] > 0) {
        buckets[key].push(score);
      }
    });
  });

  const vocab = clampPercent(
    average(
      [
        average(buckets.vocabulary),
        average(buckets.travel),
        average(buckets.school),
        average(buckets.free_time),
        average(buckets.business),
        average(buckets.analysis),
      ].filter(Boolean)
    )
  );

  const grammar = clampPercent(
    average(
      [
        average(buckets.grammar),
        average(buckets.present_simple),
        average(buckets.verb_to_be),
        average(buckets.past_simple),
      ].filter(Boolean)
    )
  );

  const listening = clampPercent(average(buckets.listening));
  const reading = clampPercent(
    average(
      [
        average(buckets.translation),
        average(buckets.school),
        average(buckets.analysis),
      ].filter(Boolean)
    )
  );

  const fluency = clampPercent(
    average([vocab, grammar, listening, reading])
  );

  return {
    vocabulary: vocab || 18,
    grammar: grammar || 18,
    listening: listening || 18,
    reading: reading || 18,
    fluency: fluency || 18,
  };
}

function projectCEFR(percent, sessions) {
  if (sessions < 2) return "A2";
  if (percent < 45) return "A2";
  if (percent < 60) return "B1";
  if (percent < 75) return "B1 Alto";
  if (percent < 88) return "B2";
  return "C1";
}

function getTopStrengthsAndWeaknesses(history = []) {
  const tagTotals = {};

  history.forEach((session) => {
    const tags = session.errorTagsCount || {};
    Object.entries(tags).forEach(([tag, count]) => {
      tagTotals[tag] = (tagTotals[tag] || 0) + count;
    });
  });

  const entries = Object.entries(tagTotals);

  if (entries.length === 0) {
    return {
      strengths: [
        { label: "Buen equilibrio general", score: 90 },
        { label: "Sesiones sin errores relevantes", score: 92 },
      ],
      weaknesses: [{ label: "Aún sin áreas críticas detectadas", score: 12 }],
    };
  }

  const weaknesses = entries
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([tag, count]) => ({
      label: formatTag(tag),
      score: Math.max(20, 100 - count * 12),
      rawCount: count,
    }));

  const allKnown = [
    "vocabulary",
    "grammar",
    "listening",
    "translation",
    "present_simple",
    "verb_to_be",
    "past_simple",
    "travel",
    "school",
    "free_time",
    "business",
    "analysis",
  ];

  const strengths = allKnown
    .map((tag) => ({
      tag,
      count: tagTotals[tag] || 0,
    }))
    .sort((a, b) => a.count - b.count)
    .slice(0, 3)
    .map((item) => ({
      label: formatTag(item.tag),
      score: Math.max(72, 100 - item.count * 10),
      rawCount: item.count,
    }));

  return { strengths, weaknesses };
}

export default function Stats() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  useEffect(() => {
    if (!user) {
      nav("/start", { replace: true });
    }
  }, [user, nav]);

  if (!user) return null;

  const s = user.stats || {
    sessions: 0,
    totalExercises: 0,
    correct: 0,
    wrong: 0,
  };

  const total = s.totalExercises || 0;
  const percent = total > 0 ? Math.round((s.correct / total) * 100) : 0;
  const history = user.history || [];

  const skillScores = getSkillScores(history);
  const projectedCEFR = projectCEFR(percent, s.sessions);
  const { strengths, weaknesses } = getTopStrengthsAndWeaknesses(history);

  const recentHistory = [...history].reverse().slice(0, 8);

  const lineData = {
    labels: history.map((_, i) => `S${i + 1}`),
    datasets: [
      {
        label: "% de acierto",
        data: history.map((session) =>
          session.total > 0 ? Math.round((session.correct / session.total) * 100) : 0
        ),
        borderColor: theme.colors.accent,
        backgroundColor: "rgba(212,255,38,0.12)",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 3,
        pointHoverRadius: 5,
        fill: false,
      },
      {
        label: "Ejercicios completados",
        data: history.map((session) => session.total || 0),
        borderColor: "#5b8cff",
        backgroundColor: "rgba(91,140,255,0.10)",
        tension: 0.35,
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 4,
        yAxisID: "y1",
      },
    ],
  };

  const radarData = {
    labels: [
      "Vocabulario",
      "Gramática",
      "Comprensión Auditiva",
      "Comprensión Lectora",
      "Fluidez",
    ],
    datasets: [
      {
        label: "Perfil actual",
        data: [
          skillScores.vocabulary,
          skillScores.grammar,
          skillScores.listening,
          skillScores.reading,
          skillScores.fluency,
        ],
        backgroundColor: "rgba(212,255,38,0.14)",
        borderColor: theme.colors.accent,
        borderWidth: 2,
        pointBackgroundColor: theme.colors.accent,
        pointBorderColor: "#0b1f55",
        pointHoverBackgroundColor: "#fff",
        pointHoverBorderColor: theme.colors.accent,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.colors.textSoft,
          font: {
            weight: "700",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(8, 20, 52, 0.96)",
        titleColor: "#fff",
        bodyColor: "#dce8ff",
        borderColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
        ticks: {
          color: theme.colors.textMuted,
        },
      },
      y: {
        beginAtZero: true,
        suggestedMax: 100,
        grid: {
          color: "rgba(255,255,255,0.06)",
        },
        ticks: {
          color: theme.colors.textMuted,
        },
      },
      y1: {
        beginAtZero: true,
        position: "right",
        grid: {
          drawOnChartArea: false,
        },
        ticks: {
          color: theme.colors.textMuted,
        },
      },
    },
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: theme.colors.textSoft,
          font: {
            weight: "700",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(8, 20, 52, 0.96)",
        titleColor: "#fff",
        bodyColor: "#dce8ff",
        borderColor: "rgba(255,255,255,0.10)",
        borderWidth: 1,
      },
    },
    scales: {
      r: {
        min: 0,
        max: 100,
        ticks: {
          display: false,
          stepSize: 20,
        },
        angleLines: {
          color: "rgba(255,255,255,0.10)",
        },
        grid: {
          color: "rgba(255,255,255,0.10)",
        },
        pointLabels: {
          color: theme.colors.textSoft,
          font: {
            size: 11,
            weight: "700",
          },
        },
      },
    },
  };

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

  const glassCard = {
    borderRadius: "22px",
    padding: "1rem 1.1rem",
    border: `1px solid ${theme.colors.border}`,
    background: "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.025))",
    boxShadow: "0 10px 24px rgba(2,8,25,0.16)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const statCard = {
    ...glassCard,
    minHeight: "122px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
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

        .stats-main-card {
          animation: fadeSlideUp 0.5s ease;
        }

        @media (max-width: 980px) {
          .stats-top-grid {
            grid-template-columns: 1fr !important;
          }

          .stats-mid-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={mainShell} className="stats-main-card">
            <div
              style={{
                position: "absolute",
                top: "-100px",
                right: "-80px",
                width: "260px",
                height: "260px",
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
                width: "220px",
                height: "220px",
                borderRadius: "999px",
                background: theme.colors.violetSoft,
                filter: "blur(70px)",
                pointerEvents: "none",
                opacity: 0.7,
              }}
            />

            <div style={{ position: "relative", zIndex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: theme.spacing.lg,
                  flexWrap: "wrap",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div>
                  <p style={smallLabel}>Advanced analytics</p>
                  <h2
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      color: theme.colors.text,
                      fontSize: "clamp(2.1rem, 4vw, 3.2rem)",
                      fontWeight: 900,
                      letterSpacing: "-0.05em",
                      lineHeight: 1,
                    }}
                  >
                    Estadísticas avanzadas
                  </h2>
                  <p
                    style={{
                      margin: `${theme.spacing.md} 0 0 0`,
                      color: theme.colors.textSoft,
                      fontSize: "1rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Análisis profundo de tu progreso, nivel actual y habilidades clave.
                  </p>
                </div>

                <div style={glassCard}>
                  <ProgressRing value={percent} label="Global" />
                </div>
              </div>

              <div
                className="stats-top-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1.4fr 1fr",
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={sectionCard}>
                  <p style={smallLabel}>Evolución reciente</p>
                  <h3
                    style={{
                      margin: `${theme.spacing.sm} 0 ${theme.spacing.lg} 0`,
                      color: theme.colors.text,
                      fontWeight: 900,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Análisis de progreso semanal
                  </h3>

                  <div style={{ height: "300px" }}>
                    <Line data={lineData} options={lineOptions} />
                  </div>
                </div>

                <div style={sectionCard}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateRows: "1fr auto",
                      gap: theme.spacing.lg,
                      height: "100%",
                    }}
                  >
                    <div>
                      <p style={smallLabel}>Mapa de habilidades</p>
                      <h3
                        style={{
                          margin: `${theme.spacing.sm} 0 ${theme.spacing.lg} 0`,
                          color: theme.colors.text,
                          fontWeight: 900,
                          fontSize: "1.25rem",
                          letterSpacing: "-0.03em",
                        }}
                      >
                        Habilidades por categoría
                      </h3>

                      <div style={{ height: "300px" }}>
                        <Radar data={radarData} options={radarOptions} />
                      </div>
                    </div>

                    <div
                      style={{
                        ...glassCard,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: theme.spacing.md,
                        flexWrap: "wrap",
                      }}
                    >
                      <div>
                        <div style={smallLabel}>Nivel CEFR proyectado</div>
                        <div
                          style={{
                            marginTop: theme.spacing.sm,
                            color: theme.colors.text,
                            fontSize: "1.45rem",
                            fontWeight: 900,
                            letterSpacing: "-0.03em",
                          }}
                        >
                          {projectedCEFR}
                        </div>
                      </div>

                      <div style={{ ...ui.badge, borderRadius: "999px" }}>
                        Perfil actual
                      </div>
                    </div>
                  </div>
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
                <div style={statCard}>
                  <div style={smallLabel}>Sesiones completadas</div>
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 900,
                      color: theme.colors.text,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {s.sessions}
                  </div>
                </div>

                <div style={statCard}>
                  <div style={smallLabel}>Ejercicios totales</div>
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 900,
                      color: theme.colors.text,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {s.totalExercises}
                  </div>
                </div>

                <div style={statCard}>
                  <div style={smallLabel}>Aciertos totales</div>
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 900,
                      color: "#d8ffe7",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {s.correct}
                  </div>
                </div>

                <div style={statCard}>
                  <div style={smallLabel}>Errores totales</div>
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 900,
                      color: "#ffd7df",
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {s.wrong}
                  </div>
                </div>

                <div style={statCard}>
                  <div style={smallLabel}>Porcentaje global</div>
                  <div
                    style={{
                      fontSize: "1.9rem",
                      fontWeight: 900,
                      color: theme.colors.accent,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    {percent}%
                  </div>
                </div>
              </div>

              <div
                className="stats-mid-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: theme.spacing.lg,
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={sectionCard}>
                  <p style={smallLabel}>Strengths</p>
                  <h3
                    style={{
                      margin: `${theme.spacing.sm} 0 ${theme.spacing.lg} 0`,
                      color: theme.colors.text,
                      fontWeight: 900,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Puntos fuertes
                  </h3>

                  <div style={{ display: "grid", gap: theme.spacing.md }}>
                    {strengths.map((item, index) => (
                      <div
                        key={`${item.label}_${index}`}
                        style={{
                          ...glassCard,
                          border: "1px solid rgba(69,212,131,0.24)",
                          background: "rgba(69,212,131,0.10)",
                        }}
                      >
                        <div
                          style={{
                            color: theme.colors.text,
                            fontWeight: 800,
                            marginBottom: "0.35rem",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            color: "#d8ffe7",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {item.score}% dominio
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={sectionCard}>
                  <p style={smallLabel}>Weak points</p>
                  <h3
                    style={{
                      margin: `${theme.spacing.sm} 0 ${theme.spacing.lg} 0`,
                      color: theme.colors.text,
                      fontWeight: 900,
                      fontSize: "1.25rem",
                      letterSpacing: "-0.03em",
                    }}
                  >
                    Áreas a mejorar
                  </h3>

                  <div style={{ display: "grid", gap: theme.spacing.md }}>
                    {weaknesses.map((item, index) => (
                      <div
                        key={`${item.label}_${index}`}
                        style={{
                          ...glassCard,
                          border: "1px solid rgba(255,107,129,0.24)",
                          background: "rgba(255,107,129,0.10)",
                        }}
                      >
                        <div
                          style={{
                            color: theme.colors.text,
                            fontWeight: 800,
                            marginBottom: "0.35rem",
                          }}
                        >
                          {item.label}
                        </div>
                        <div
                          style={{
                            color: "#ffe1e6",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                          }}
                        >
                          {item.rawCount
                            ? `${item.rawCount} fallos detectados`
                            : `${item.score}%`}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={sectionCard}>
                <p style={smallLabel}>Recent sessions</p>
                <h3
                  style={{
                    margin: `${theme.spacing.sm} 0 ${theme.spacing.lg} 0`,
                    color: theme.colors.text,
                    fontWeight: 900,
                    fontSize: "1.25rem",
                    letterSpacing: "-0.03em",
                  }}
                >
                  Historial reciente
                </h3>

                {recentHistory.length === 0 ? (
                  <p style={{ color: theme.colors.textSoft, margin: 0 }}>
                    No hay sesiones registradas todavía.
                  </p>
                ) : (
                  <div style={{ display: "grid", gap: theme.spacing.md }}>
                    {recentHistory.map((session) => {
                      const sessionPercent =
                        session.total > 0
                          ? Math.round((session.correct / session.total) * 100)
                          : 0;

                      return (
                        <div
                          key={session.id}
                          style={{
                            ...glassCard,
                            borderRadius: "18px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: "1rem",
                              flexWrap: "wrap",
                              marginBottom: "0.65rem",
                            }}
                          >
                            <div style={{ color: theme.colors.textSoft }}>
                              <strong style={{ color: theme.colors.text }}>Fecha:</strong>{" "}
                              {new Date(session.dateISO).toLocaleString()}
                            </div>

                            <span
                              style={{
                                background: "rgba(255,107,129,0.10)",
                                border: "1px solid rgba(255,255,255,0.10)",
                                borderRadius: "999px",
                                padding: "0.3rem 0.7rem",
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: theme.colors.text,
                              }}
                            >
                              {session.correct}/{session.total} ({sessionPercent}%)
                            </span>
                          </div>

                          <div
                            style={{
                              marginBottom: "0.4rem",
                              color: theme.colors.textSoft,
                            }}
                          >
                            <strong style={{ color: theme.colors.text }}>Lección:</strong>{" "}
                            {session.lessonId}
                          </div>

                          {session.errorTagsCount &&
                            Object.keys(session.errorTagsCount).length > 0 && (
                              <div
                                style={{
                                  color: theme.colors.textSoft,
                                  lineHeight: 1.6,
                                }}
                              >
                                <strong style={{ color: theme.colors.text }}>
                                  Errores frecuentes:
                                </strong>{" "}
                                {Object.entries(session.errorTagsCount)
                                  .map(
                                    ([tag, count]) => `${formatTag(tag)} (${count})`
                                  )
                                  .join(", ")}
                              </div>
                            )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

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