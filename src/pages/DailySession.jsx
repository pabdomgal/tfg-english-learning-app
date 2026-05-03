import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, saveSessionResult } from "../services/storage";
import {
  getCurrentLesson,
  buildDailySession,
  getLessonsCountByLevel,
} from "../services/lessonEngine";
import { theme, ui } from "../styles/theme";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function buildFixedRightOptions(pairs = []) {
  const rights = pairs.map((p) => p.right);

  if (rights.length <= 1) return rights;
  return rights.map((_, index) => rights[(index + 1) % rights.length]);
}

function getPedagogicalTip(exercise, userAnswer = null) {
  if (!exercise) return null;

  const tags = Array.isArray(exercise.tags) ? exercise.tags : [];
  const answerText = Array.isArray(exercise.answer)
    ? exercise.answer.map((p) => `${p.left}-${p.right}`).join(" | ")
    : String(exercise.answer ?? "").toLowerCase();

  if (exercise.type === "order_words") {
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

  if (exercise.type === "listening_build") {
    return "Escucha otra vez y fíjate en el orden exacto de las palabras.";
  }

  if (exercise.type === "match_pairs") {
    return "Relaciona primero las palabras que tengas totalmente claras y deja las dudosas para el final.";
  }

  if (exercise.type === "fill_blank") {
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

  if (exercise.type === "multiple_choice") {
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

function ProgressRing({ value = 0, stepLabel = "" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 48;
  const stroke = 8;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: "112px",
        height: "112px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexShrink: 0,
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
          gap: "0.1rem",
        }}
      >
        <span
          style={{
            fontSize: "0.72rem",
            color: theme.colors.textSoft,
            fontWeight: 700,
          }}
        >
          {stepLabel || "Paso"}
        </span>
        <span
          style={{
            fontSize: "1.55rem",
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

export default function DailySession() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  const [phase, setPhase] = useState("vocab");

  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);

  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [orderedWords, setOrderedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [rightOptions, setRightOptions] = useState([]);

  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [lastResult, setLastResult] = useState(null);
  const [showSuccessFx, setShowSuccessFx] = useState(false);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const lessonIndex = user.lessonIndexByLevel?.[user.level] ?? 0;
  const lesson = getCurrentLesson(user.level, lessonIndex);

  const exercises = useMemo(() => {
    return buildDailySession(user.level, lessonIndex);
  }, [user.level, lessonIndex]);

  const exercise = exercises[currentIndex] ?? null;
  const pedagogicalTip = getPedagogicalTip(exercise, lastResult?.selected);

  const progressPercent =
    exercises.length > 0
      ? Math.round(((currentIndex + 1) / exercises.length) * 100)
      : 0;

  function resetCommonState() {
    setSelected(null);
    setTextAnswer("");
    setChecked(false);
    setIsCorrect(null);

    setOrderedWords([]);
    setAvailableWords([]);

    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setRightOptions([]);
  }

  useEffect(() => {
    if (phase !== "exercise" || !exercise) return;

    resetCommonState();

    if (exercise.type === "order_words" || exercise.type === "listening_build") {
      setAvailableWords(shuffleArray(exercise.options ?? []));
      return;
    }

    if (exercise.type === "match_pairs") {
      setRightOptions(buildFixedRightOptions(exercise.pairs ?? []));
    }
  }, [exercise, phase]);

  function handleCancel() {
    nav("/menu");
  }

  function goToExercise() {
    setPhase("exercise");
    setCurrentIndex(0);
    setSessionResults([]);
    setLastResult(null);
    resetCommonState();
  }

  function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
  }

  function formatExerciseType(type) {
    if (type === "multiple_choice") return "Test";
    if (type === "fill_blank") return "Completar hueco";
    if (type === "order_words") return "Traducir y ordenar";
    if (type === "match_pairs") return "Unir palabras";
    if (type === "listening_build") return "Listening";
    return type;
  }

  function handleAddWord(word, index) {
    if (checked) return;

    setOrderedWords((prev) => [...prev, word]);
    setAvailableWords((prev) => prev.filter((_, i) => i !== index));
    setChecked(false);
    setIsCorrect(null);
  }

  function handleRemoveWord(wordIndex) {
    if (checked) return;

    const word = orderedWords[wordIndex];

    setOrderedWords((prev) => prev.filter((_, i) => i !== wordIndex));
    setAvailableWords((prev) => [...prev, word]);
    setChecked(false);
    setIsCorrect(null);
  }

  function handleResetWords() {
    if (
      !exercise ||
      (exercise.type !== "order_words" && exercise.type !== "listening_build")
    ) {
      return;
    }

    setOrderedWords([]);
    setAvailableWords(shuffleArray(exercise.options ?? []));
    setChecked(false);
    setIsCorrect(null);
  }

  function createPair(leftWord, rightWord) {
    const pairExists = matchedPairs.some(
      (p) => p.left === leftWord || p.right === rightWord
    );
    if (pairExists) return;

    setMatchedPairs((prev) => [...prev, { left: leftWord, right: rightWord }]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setChecked(false);
    setIsCorrect(null);
  }

  function handleMatchLeft(leftWord) {
    if (checked) return;

    const alreadyMatched = matchedPairs.some((m) => m.left === leftWord);
    if (alreadyMatched) return;

    if (selectedRight) {
      createPair(leftWord, selectedRight);
      return;
    }

    setSelectedLeft(leftWord);
  }

  function handleMatchRight(rightWord) {
    if (checked) return;

    const alreadyMatched = matchedPairs.some((m) => m.right === rightWord);
    if (alreadyMatched) return;

    if (selectedLeft) {
      createPair(selectedLeft, rightWord);
      return;
    }

    setSelectedRight(rightWord);
  }

  function handleRemovePair(index) {
    if (checked) return;
    setMatchedPairs((prev) => prev.filter((_, i) => i !== index));
    setChecked(false);
    setIsCorrect(null);
  }

  function handleCheck() {
    if (!exercise) return;

    let userAnswer = null;
    let ok = false;

    if (exercise.type === "multiple_choice") {
      if (selected === null) return;
      userAnswer = selected;
      ok = selected === exercise.answer;
    }

    if (exercise.type === "fill_blank") {
      if (!textAnswer.trim()) return;
      userAnswer = textAnswer.trim();
      ok = normalizeText(userAnswer) === normalizeText(exercise.answer);
    }

    if (exercise.type === "order_words" || exercise.type === "listening_build") {
      if (!orderedWords.length) return;
      userAnswer = orderedWords.join(" ");
      ok = normalizeText(userAnswer) === normalizeText(exercise.answer);
    }

    if (exercise.type === "match_pairs") {
      const expected = exercise.pairs ?? [];
      if (matchedPairs.length !== expected.length) return;

      userAnswer = matchedPairs;

      ok = expected.every((pair) =>
        matchedPairs.some(
          (m) =>
            normalizeText(m.left) === normalizeText(pair.left) &&
            normalizeText(m.right) === normalizeText(pair.right)
        )
      );
    }

    setChecked(true);
    setIsCorrect(ok);

    if (ok) {
      setShowSuccessFx(true);

      const successSound = new Audio("/audio/ui/success.mp3");
      successSound.volume = 1;
      successSound.play().catch((err) => {
        console.error("error reproduciendo success.mp3:", err);
      });

      setTimeout(() => {
        setShowSuccessFx(false);
      }, 500);
    }

    const result = {
      exerciseId: exercise.id,
      type: exercise.type,
      prompt: exercise.prompt,
      answer: exercise.type === "match_pairs" ? exercise.pairs : exercise.answer,
      selected: userAnswer,
      isCorrect: ok,
      tags: exercise.tags ?? [],
      options: exercise.options ?? [],
      sourceText: exercise.sourceText ?? null,
      translation: exercise.translation ?? null,
      audio: exercise.audio ?? null,
    };

    setLastResult(result);

    setSessionResults((prev) => {
      const withoutThis = prev.filter((r) => r.exerciseId !== result.exerciseId);
      return [...withoutThis, result];
    });
  }

  function handleNext() {
    const nextIndex = currentIndex + 1;

    if (nextIndex < exercises.length) {
      setCurrentIndex(nextIndex);
      return;
    }

    const safeResults = lastResult
      ? [
          ...sessionResults.filter((r) => r.exerciseId !== lastResult.exerciseId),
          lastResult,
        ]
      : sessionResults;

    saveSessionResult({
      lessonId: lesson?.id,
      results: safeResults,
      levelName: user.level,
      lessonsCountByLevel: {
        Principiante: getLessonsCountByLevel("Principiante"),
        Intermedio: getLessonsCountByLevel("Intermedio"),
        Avanzado: getLessonsCountByLevel("Avanzado"),
      },
    });

    nav("/review");
  }

  const isCheckDisabled =
    !exercise ||
    (exercise.type === "multiple_choice" && selected === null) ||
    (exercise.type === "fill_blank" && !textAnswer.trim()) ||
    ((exercise.type === "order_words" || exercise.type === "listening_build") &&
      orderedWords.length === 0) ||
    (exercise.type === "match_pairs" &&
      matchedPairs.length !== (exercise.pairs ?? []).length);

  const primaryButtonStyle = (disabled = false) => ({
    ...ui.primaryButton,
    ...(disabled ? ui.disabledButton : {}),
    minHeight: "54px",
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
    boxShadow: disabled ? "none" : theme.shadows.primaryGlow,
    minWidth: "180px",
  });

  const secondaryButtonStyle = {
    ...ui.secondaryButton,
    minHeight: "50px",
    borderRadius: "16px",
    fontWeight: 700,
  };

  const ghostButtonStyle = {
    ...ui.ghostButton,
    minHeight: "42px",
    borderRadius: "14px",
    fontWeight: 700,
  };

  const dashboardShell = {
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

  const compactTopCard = {
    borderRadius: "24px",
    padding: "1.15rem 1.2rem",
    border: `1px solid ${theme.colors.border}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "0 12px 26px rgba(2,8,25,0.16)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const largeActivityCard = {
    borderRadius: "30px",
    padding: "1.55rem",
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

  const subtlePrompt = {
    margin: 0,
    color: theme.colors.textMuted,
    fontSize: "0.78rem",
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
  };

  const promptCard = {
    borderRadius: "22px",
    padding: "1rem 1.15rem",
    border: `1px solid ${theme.colors.border}`,
    background: "rgba(255,255,255,0.035)",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const optionCardStyle = (active = false) => ({
    ...ui.choiceCard,
    borderRadius: "20px",
    minHeight: "68px",
    border: active
      ? `2px solid ${theme.colors.accent}`
      : `1px solid rgba(255,255,255,0.10)`,
    background: active
      ? "linear-gradient(180deg, rgba(212,255,38,0.12), rgba(255,255,255,0.05))"
      : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: active
      ? "0 0 0 1px rgba(212,255,38,0.10), 0 14px 30px rgba(2,8,25,0.20)"
      : "0 8px 18px rgba(2,8,25,0.12)",
    transition: "all 0.22s ease",
    cursor: "pointer",
  });

  const answerStage = {
    ...ui.wordBuildArea,
    borderRadius: "22px",
    minHeight: "88px",
    padding: "1rem",
    border: `1px dashed ${theme.colors.borderStrong}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.03))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const chipBase = {
    ...ui.chipButton,
    borderRadius: "16px",
    minHeight: "48px",
    padding: "0.76rem 1.05rem",
    fontWeight: 700,
    boxShadow: "0 10px 20px rgba(2,8,25,0.12)",
    background: "rgba(255,255,255,0.08)",
    transition:
      "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
    color: theme.colors.text,
  };

  const chipSelected = {
    ...ui.chipButton,
    ...ui.chipButtonSelected,
    borderRadius: "16px",
    minHeight: "48px",
    padding: "0.76rem 1.05rem",
    fontWeight: 800,
    boxShadow: "0 0 0 1px rgba(212,255,38,0.18), 0 14px 26px rgba(2,8,25,0.18)",
    background: "rgba(212,255,38,0.12)",
    color: theme.colors.text,
  };

  const pairButtonStyle = (active = false, disabled = false) => ({
    ...ui.choiceCard,
    justifyContent: "center",
    minHeight: "62px",
    borderRadius: "18px",
    opacity: disabled ? 0.42 : 1,
    cursor: disabled ? "not-allowed" : "pointer",
    border: active
      ? `2px solid ${theme.colors.accent}`
      : `1px solid rgba(255,255,255,0.10)`,
    background: active
      ? "linear-gradient(180deg, rgba(212,255,38,0.12), rgba(255,255,255,0.05))"
      : "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: active
      ? "0 0 0 1px rgba(212,255,38,0.10), 0 14px 28px rgba(2,8,25,0.18)"
      : "0 8px 18px rgba(2,8,25,0.12)",
    fontWeight: 800,
    transition: "all 0.2s ease",
  });

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

        @keyframes softGlow {
          0% { box-shadow: 0 0 0 0 rgba(212,255,38,0.18); }
          70% { box-shadow: 0 0 0 12px rgba(212,255,38,0); }
          100% { box-shadow: 0 0 0 0 rgba(212,255,38,0); }
        }

        @keyframes successPop {
          0% {
            transform: scale(0.985);
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
          40% {
            transform: scale(1.01);
            box-shadow: 0 0 0 10px rgba(52, 211, 153, 0.10);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(52, 211, 153, 0);
          }
        }

        .premium-main-card {
          animation: fadeSlideUp 0.5s ease;
        }

        .premium-option:hover {
          transform: translateY(-2px);
        }

        .premium-chip:hover {
          transform: translateY(-2px);
        }

        .pulse-badge {
          animation: softGlow 2.8s infinite;
        }

        .success-feedback {
          animation: successPop 0.45s ease;
          border-color: rgba(52, 211, 153, 0.45) !important;
          background: linear-gradient(
            180deg,
            rgba(52, 211, 153, 0.14),
            rgba(255, 255, 255, 0.03)
          ) !important;
        }

        @media (max-width: 980px) {
          .daily-top-grid {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 860px) {
          .pairs-grid-mobile {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={dashboardShell} className="premium-main-card">
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
                className="daily-top-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    phase === "exercise" && exercise ? "1fr auto" : "1fr",
                  gap: theme.spacing.lg,
                  alignItems: "start",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={compactTopCard}>
                  <p style={subtlePrompt}>English training session</p>

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
                    Lección diaria
                  </h2>

                  {lesson && (
                    <p
                      style={{
                        margin: `${theme.spacing.md} 0 0 0`,
                        color: theme.colors.textSoft,
                        fontSize: "1rem",
                        lineHeight: 1.5,
                      }}
                    >
                      <strong style={{ color: theme.colors.text }}>
                        Lección actual:
                      </strong>{" "}
                      {lesson.title} ({lesson.id})
                    </p>
                  )}
                </div>

                {phase === "exercise" && exercise && (
                  <div
                    style={{
                      ...compactTopCard,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexDirection: "column",
                      gap: "0.35rem",
                      minWidth: "150px",
                    }}
                  >
                    <ProgressRing
                      value={progressPercent}
                      stepLabel={`${currentIndex + 1}/${exercises.length}`}
                    />
                    <div
                      style={{
                        color: theme.colors.textSoft,
                        fontWeight: 700,
                        fontSize: "0.96rem",
                        marginTop: "-4px",
                      }}
                    >
                      {formatExerciseType(exercise.type)}
                    </div>
                  </div>
                )}
              </div>

              {!lesson ? (
                <>
                  <p style={ui.subtitle}>
                    No hay lecciones cargadas para este nivel todavía.
                  </p>
                  <div style={{ marginTop: theme.spacing.xl }}>
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => nav("/menu")}
                    >
                      Volver
                    </button>
                  </div>
                </>
              ) : phase === "vocab" ? (
                <div style={largeActivityCard}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: theme.spacing.lg,
                      flexWrap: "wrap",
                      alignItems: "flex-start",
                      marginBottom: theme.spacing.xl,
                    }}
                  >
                    <div>
                      <p style={subtlePrompt}>Warm up</p>

                      <h3
                        style={{
                          margin: `${theme.spacing.sm} 0 0 0`,
                          color: theme.colors.text,
                          fontSize: "1.45rem",
                          fontWeight: 900,
                          letterSpacing: "-0.04em",
                        }}
                      >
                        Introducción de vocabulario
                      </h3>

                      <p
                        style={{
                          margin: `${theme.spacing.sm} 0 0 0`,
                          color: theme.colors.textSoft,
                          maxWidth: "700px",
                          lineHeight: 1.6,
                        }}
                      >
                        Repasa las palabras clave antes de empezar.
                      </p>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gap: theme.spacing.md,
                      marginBottom: theme.spacing.xl,
                    }}
                  >
                    {lesson.vocab.map((v) => (
                      <div
                        key={v.word}
                        style={{
                          ...promptCard,
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: theme.spacing.lg,
                          flexWrap: "wrap",
                        }}
                      >
                        <span
                          style={{
                            color: theme.colors.text,
                            fontWeight: 900,
                            fontSize: "1.08rem",
                            letterSpacing: "-0.02em",
                          }}
                        >
                          {v.word}
                        </span>

                        <span
                          style={{
                            color: theme.colors.textSoft,
                            fontWeight: 700,
                            fontSize: "0.98rem",
                          }}
                        >
                          {v.meaning}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: theme.spacing.md,
                      flexWrap: "wrap",
                    }}
                  >
                    <button style={primaryButtonStyle()} onClick={goToExercise}>
                      Comenzar ejercicios
                    </button>
                    <button style={secondaryButtonStyle} onClick={handleCancel}>
                      Cancelar sesión
                    </button>
                  </div>
                </div>
              ) : !exercise ? (
                <>
                  <p style={ui.subtitle}>
                    No hay ejercicios definidos para esta lección.
                  </p>
                  <div style={{ marginTop: theme.spacing.xl }}>
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => nav("/menu")}
                    >
                      Volver
                    </button>
                  </div>
                </>
              ) : (
                <div style={largeActivityCard}>
                  <div style={{ position: "relative", zIndex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: theme.spacing.md,
                        flexWrap: "wrap",
                        marginBottom: theme.spacing.lg,
                      }}
                    >
                      <div>
                        <p style={subtlePrompt}>Actividad actual</p>

                        <p
                          style={{
                            margin: `${theme.spacing.sm} 0 0 0`,
                            color: theme.colors.text,
                            fontWeight: 900,
                            fontSize: "1.5rem",
                            letterSpacing: "-0.04em",
                          }}
                        >
                          {formatExerciseType(exercise.type)}
                        </p>
                      </div>

                      <div style={{ ...ui.badge, borderRadius: "999px" }}>
                        Paso {currentIndex + 1} / {exercises.length}
                      </div>
                    </div>

                    <div style={{ marginBottom: theme.spacing.xl }}>
                      {exercise.type === "order_words" && exercise.sourceText ? (
                        <>
                          <p style={subtlePrompt}>Traduce al inglés</p>
                          <p
                            style={{
                              margin: `${theme.spacing.sm} 0 0 0`,
                              color: theme.colors.text,
                              fontSize: "clamp(1.7rem, 4vw, 2.4rem)",
                              fontWeight: 900,
                              lineHeight: 1.15,
                              letterSpacing: "-0.04em",
                            }}
                          >
                            {exercise.sourceText}
                          </p>
                        </>
                      ) : exercise.type === "listening_build" ? (
                        <>
                          <p style={subtlePrompt}>Escucha y construye la frase</p>
                          {exercise.translation && (
                            <p
                              style={{
                                margin: `${theme.spacing.sm} 0 0 0`,
                                color: theme.colors.text,
                                fontSize: "clamp(1.45rem, 4vw, 2rem)",
                                fontWeight: 900,
                                lineHeight: 1.2,
                                letterSpacing: "-0.04em",
                              }}
                            >
                              {exercise.translation}
                            </p>
                          )}
                        </>
                      ) : (
                        <div style={promptCard}>
                          <p
                            style={{
                              margin: 0,
                              color: theme.colors.text,
                              fontSize: "1.08rem",
                              fontWeight: 700,
                              lineHeight: 1.6,
                            }}
                          >
                            {exercise.prompt}
                          </p>
                        </div>
                      )}
                    </div>

                    {exercise.type === "multiple_choice" && (
                      <div
                        style={{
                          display: "grid",
                          gap: theme.spacing.md,
                          maxWidth: "100%",
                        }}
                      >
                        {exercise.options.map((opt) => {
                          const isActive = selected === opt;

                          return (
                            <label
                              key={opt}
                              style={optionCardStyle(isActive)}
                              className="premium-option"
                            >
                              <input
                                type="radio"
                                name={`mc_${currentIndex}`}
                                checked={isActive}
                                onChange={() => {
                                  setSelected(opt);
                                  setChecked(false);
                                  setIsCorrect(null);
                                }}
                              />
                              <span
                                style={{
                                  color: "#eef4ff",
                                  fontWeight: isActive ? 800 : 700,
                                  fontSize: "1rem",
                                }}
                              >
                                {opt}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}

                    {exercise.type === "fill_blank" && (
                      <div
                        style={{
                          maxWidth: "46rem",
                          marginTop: theme.spacing.md,
                        }}
                      >
                        <label
                          htmlFor={`fb_${currentIndex}`}
                          style={{
                            display: "block",
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.text,
                            fontWeight: 800,
                          }}
                        >
                          Escribe tu respuesta:
                        </label>
                        <input
                          id={`fb_${currentIndex}`}
                          type="text"
                          value={textAnswer}
                          onChange={(e) => {
                            setTextAnswer(e.target.value);
                            setChecked(false);
                            setIsCorrect(null);
                          }}
                          placeholder="Escribe aquí"
                          style={{
                            ...ui.input,
                            minHeight: "58px",
                            borderRadius: "18px",
                            background: "rgba(255,255,255,0.06)",
                            boxShadow: "0 10px 26px rgba(2,8,25,0.12)",
                          }}
                        />
                      </div>
                    )}

                    {exercise.type === "order_words" && (
                      <div style={{ maxWidth: "100%", marginTop: theme.spacing.md }}>
                        <p
                          style={{
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.text,
                            fontWeight: 800,
                          }}
                        >
                          Forma la frase en inglés:
                        </p>

                        <div style={answerStage}>
                          {orderedWords.length > 0 ? (
                            orderedWords.map((word, i) => (
                              <button
                                key={`${word}_selected_${i}`}
                                type="button"
                                onClick={() => handleRemoveWord(i)}
                                style={chipSelected}
                                className="premium-chip"
                              >
                                {word}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: theme.colors.textMuted }}>
                              Pulsa las palabras para construir tu respuesta
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: theme.spacing.md,
                            marginTop: theme.spacing.lg,
                          }}
                        >
                          {availableWords.map((word, idx) => (
                            <button
                              key={`${word}_${idx}`}
                              type="button"
                              onClick={() => handleAddWord(word, idx)}
                              style={chipBase}
                              className="premium-chip"
                            >
                              {word}
                            </button>
                          ))}
                        </div>

                        <div
                          style={{
                            marginTop: theme.spacing.md,
                            display: "flex",
                            gap: theme.spacing.sm,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleResetWords}
                            style={ghostButtonStyle}
                          >
                            Reiniciar frase
                          </button>
                        </div>
                      </div>
                    )}

                    {exercise.type === "listening_build" && (
                      <div style={{ maxWidth: "100%", marginTop: theme.spacing.md }}>
                        <div style={{ ...promptCard, marginBottom: theme.spacing.lg }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              gap: theme.spacing.md,
                              flexWrap: "wrap",
                              marginBottom: theme.spacing.md,
                            }}
                          >
                            <div>
                              <p style={subtlePrompt}>Audio</p>
                              <p
                                style={{
                                  margin: `${theme.spacing.xs} 0 0 0`,
                                  color: theme.colors.text,
                                  fontWeight: 900,
                                  fontSize: "1.08rem",
                                }}
                              >
                                Escucha el audio
                              </p>
                            </div>
                          </div>

                          <audio
                            key={exercise.audio || exercise.id}
                            controls
                            preload="none"
                            style={{ width: "100%" }}
                          >
                            <source src={exercise.audio} type="audio/mpeg" />
                            Tu navegador no soporta el audio.
                          </audio>
                        </div>

                        <p
                          style={{
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.text,
                            fontWeight: 800,
                          }}
                        >
                          Construye la frase en inglés:
                        </p>

                        <div style={answerStage}>
                          {orderedWords.length > 0 ? (
                            orderedWords.map((word, i) => (
                              <button
                                key={`${word}_listening_selected_${i}`}
                                type="button"
                                onClick={() => handleRemoveWord(i)}
                                style={chipSelected}
                                className="premium-chip"
                              >
                                {word}
                              </button>
                            ))
                          ) : (
                            <span style={{ color: theme.colors.textMuted }}>
                              Pulsa las palabras para construir tu respuesta
                            </span>
                          )}
                        </div>

                        <div
                          style={{
                            display: "flex",
                            flexWrap: "wrap",
                            gap: theme.spacing.md,
                            marginTop: theme.spacing.lg,
                          }}
                        >
                          {availableWords.map((word, idx) => (
                            <button
                              key={`${word}_listening_${idx}`}
                              type="button"
                              onClick={() => handleAddWord(word, idx)}
                              style={chipBase}
                              className="premium-chip"
                            >
                              {word}
                            </button>
                          ))}
                        </div>

                        <div
                          style={{
                            marginTop: theme.spacing.md,
                            display: "flex",
                            gap: theme.spacing.sm,
                            flexWrap: "wrap",
                            alignItems: "center",
                          }}
                        >
                          <button
                            type="button"
                            onClick={handleResetWords}
                            style={ghostButtonStyle}
                          >
                            Reiniciar frase
                          </button>
                        </div>
                      </div>
                    )}

                    {exercise.type === "match_pairs" && (
                      <div style={{ marginTop: theme.spacing.md, maxWidth: "100%" }}>
                        <p
                          style={{
                            fontWeight: 800,
                            marginBottom: theme.spacing.sm,
                            color: theme.colors.text,
                            fontSize: "1rem",
                          }}
                        >
                          Une cada palabra con su traducción correcta
                        </p>

                        <p
                          style={{
                            marginTop: 0,
                            marginBottom: theme.spacing.lg,
                            color: theme.colors.textSoft,
                            fontSize: "0.95rem",
                          }}
                        >
                          Pulsa una opción de cada columna y la pareja se formará automáticamente.
                        </p>

                        <div
                          className="pairs-grid-mobile"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: theme.spacing.xl,
                          }}
                        >
                          <div style={promptCard}>
                            <p
                              style={{
                                fontWeight: 900,
                                marginBottom: theme.spacing.sm,
                                color: theme.colors.text,
                              }}
                            >
                              Inglés
                            </p>
                            <div style={{ display: "grid", gap: theme.spacing.sm }}>
                              {(exercise.pairs ?? []).map((pair) => {
                                const alreadyMatched = matchedPairs.some(
                                  (m) => m.left === pair.left
                                );

                                return (
                                  <button
                                    key={pair.left}
                                    type="button"
                                    disabled={alreadyMatched}
                                    onClick={() => handleMatchLeft(pair.left)}
                                    style={pairButtonStyle(
                                      selectedLeft === pair.left,
                                      alreadyMatched
                                    )}
                                    className="premium-option"
                                  >
                                    <span
                                      style={{
                                        color: alreadyMatched
                                          ? "rgba(255,255,255,0.28)"
                                          : "#eef4ff",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {pair.left}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div style={promptCard}>
                            <p
                              style={{
                                fontWeight: 900,
                                marginBottom: theme.spacing.sm,
                                color: theme.colors.text,
                              }}
                            >
                              Español
                            </p>
                            <div style={{ display: "grid", gap: theme.spacing.sm }}>
                              {rightOptions.map((right) => {
                                const alreadyMatched = matchedPairs.some(
                                  (m) => m.right === right
                                );

                                return (
                                  <button
                                    key={right}
                                    type="button"
                                    disabled={alreadyMatched}
                                    onClick={() => handleMatchRight(right)}
                                    style={pairButtonStyle(
                                      selectedRight === right,
                                      alreadyMatched
                                    )}
                                    className="premium-option"
                                  >
                                    <span
                                      style={{
                                        color: alreadyMatched
                                          ? "rgba(255,255,255,0.28)"
                                          : "#eef4ff",
                                        fontWeight: 800,
                                      }}
                                    >
                                      {right}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        <div
                          style={{
                            ...promptCard,
                            marginTop: theme.spacing.lg,
                            maxWidth: "700px",
                          }}
                        >
                          <p
                            style={{
                              fontWeight: 900,
                              marginBottom: theme.spacing.sm,
                              color: theme.colors.text,
                            }}
                          >
                            Parejas formadas
                          </p>

                          {matchedPairs.length === 0 ? (
                            <p style={{ color: theme.colors.textSoft, margin: 0 }}>
                              Aún no has formado ninguna pareja.
                            </p>
                          ) : (
                            <div style={{ display: "grid", gap: theme.spacing.sm }}>
                              {matchedPairs.map((pair, idx) => (
                                <div
                                  key={`${pair.left}_${pair.right}_${idx}`}
                                  style={{
                                    ...ui.pairItem,
                                    borderRadius: "16px",
                                    minHeight: "56px",
                                    background: "rgba(255,255,255,0.05)",
                                    boxShadow: "0 8px 18px rgba(2,8,25,0.12)",
                                  }}
                                >
                                  <span style={{ color: theme.colors.text }}>
                                    <strong>{pair.left}</strong> — {pair.right}
                                  </span>

                                  {!checked && (
                                    <button
                                      type="button"
                                      onClick={() => handleRemovePair(idx)}
                                      style={ghostButtonStyle}
                                    >
                                      Quitar
                                    </button>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {exercise.type !== "multiple_choice" &&
                      exercise.type !== "fill_blank" &&
                      exercise.type !== "order_words" &&
                      exercise.type !== "match_pairs" &&
                      exercise.type !== "listening_build" && (
                        <div style={{ ...ui.resultError, marginTop: theme.spacing.lg }}>
                          Tipo de ejercicio no soportado todavía: {exercise.type}
                        </div>
                      )}

                    <div style={{ marginTop: theme.spacing.xl }}>
                      {!checked ? (
                        <div
                          style={{
                            display: "flex",
                            gap: theme.spacing.md,
                            flexWrap: "wrap",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <button
                            onClick={handleCheck}
                            disabled={isCheckDisabled}
                            style={primaryButtonStyle(isCheckDisabled)}
                          >
                            Comprobar
                          </button>

                          <button onClick={handleCancel} style={ghostButtonStyle}>
                            Cancelar sesión
                          </button>
                        </div>
                      ) : (
                        <>
                          <div
                            className={isCorrect && showSuccessFx ? "success-feedback" : ""}
                            style={
                              isCorrect
                                ? {
                                    ...ui.resultSuccess,
                                    marginBottom: theme.spacing.lg,
                                    borderRadius: "20px",
                                    boxShadow: "0 14px 28px rgba(21,115,71,0.10)",
                                  }
                                : {
                                    ...ui.resultError,
                                    marginBottom: theme.spacing.lg,
                                    borderRadius: "20px",
                                    boxShadow: "0 14px 28px rgba(192,57,43,0.10)",
                                  }
                            }
                          >
                            <div>
                              {isCorrect
                                ? exercise.type === "match_pairs"
                                  ? "✅ Correcto. Has unido todas las parejas correctamente."
                                  : "✅ Correcto"
                                : exercise.type === "match_pairs"
                                  ? "❌ Incorrecto. Revisa las parejas y vuelve a intentarlo."
                                  : `❌ Incorrecto. Respuesta correcta: ${
                                      Array.isArray(exercise.answer)
                                        ? JSON.stringify(exercise.answer)
                                        : exercise.answer
                                    }`}
                            </div>

                            {!isCorrect && pedagogicalTip && (
                              <div
                                style={{
                                  marginTop: "0.65rem",
                                  fontSize: "0.95rem",
                                  lineHeight: 1.5,
                                  color: "#ffe9b8",
                                  fontWeight: 600,
                                }}
                              >
                                💡 Pista: {pedagogicalTip}
                              </div>
                            )}
                          </div>

                          <button onClick={handleNext} style={primaryButtonStyle()}>
                            {currentIndex + 1 < exercises.length
                              ? "Siguiente ejercicio"
                              : "Finalizar sesión"}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}