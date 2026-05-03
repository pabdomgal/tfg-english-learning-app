import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, getLastSession } from "../services/storage";
import { formatTag } from "../services/tagFormat";
import { buildReviewSession } from "../services/lessonEngine";
import { theme, ui } from "../styles/theme";

function shuffle(arr) {
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

function formatExerciseType(type) {
  if (type === "multiple_choice") return "Test";
  if (type === "fill_blank") return "Completar hueco";
  if (type === "order_words") return "Traducir y ordenar";
  if (type === "match_pairs") return "Unir palabras";
  if (type === "listening_build") return "Listening";
  return type;
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
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

function getPedagogicalTip(exercise) {
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

function ProgressRing({ value = 0, label = "" }) {
  const safeValue = Math.max(0, Math.min(100, value));
  const radius = 48;
  const stroke = 9;
  const normalizedRadius = radius - stroke / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (safeValue / 100) * circumference;

  return (
    <div
      style={{
        position: "relative",
        width: "118px",
        height: "118px",
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
          gap: "0.12rem",
        }}
      >
        <span
          style={{
            fontSize: "0.75rem",
            color: theme.colors.textSoft,
            fontWeight: 700,
          }}
        >
          {label || "Repaso"}
        </span>
        <span
          style={{
            fontSize: "1.75rem",
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

export default function ReviewSession() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const lastSession = useMemo(() => getLastSession(), []);

  const [mode, setMode] = useState("summary");

  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [orderedWords, setOrderedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [multipleChoiceOptions, setMultipleChoiceOptions] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  const [selectedLeft, setSelectedLeft] = useState(null);
  const [selectedRight, setSelectedRight] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [rightOptions, setRightOptions] = useState([]);

  const successAudioRef = useRef(null);
  const [showSuccessFx, setShowSuccessFx] = useState(false);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const wrongItems = useMemo(() => {
    const wrongItemsAll = lastSession?.wrongItems || [];
    return buildReviewSession(wrongItemsAll, wrongItemsAll.length || 1);
  }, [lastSession]);

  const currentWrong = useMemo(() => {
    return wrongItems[practiceIndex] || null;
  }, [wrongItems, practiceIndex]);

  const pedagogicalTip = getPedagogicalTip(currentWrong);

  function resetPracticeState() {
    setSelected(null);
    setTextAnswer("");
    setOrderedWords([]);
    setAvailableWords([]);
    setMultipleChoiceOptions([]);
    setChecked(false);
    setIsCorrect(null);

    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedPairs([]);
    setRightOptions([]);
  }

  function startPractice() {
    setMode("practice");
    setPracticeIndex(0);
    resetPracticeState();
  }

  function cancelPractice() {
    setMode("summary");
    setPracticeIndex(0);
    resetPracticeState();
  }

  useEffect(() => {
    if (mode !== "practice" || !currentWrong) return;

    if (
      currentWrong.type === "order_words" ||
      currentWrong.type === "listening_build"
    ) {
      const derivedOptions =
        currentWrong.options && Array.isArray(currentWrong.options)
          ? shuffle(currentWrong.options)
          : currentWrong.answer
            ? shuffle(String(currentWrong.answer).split(" ").filter(Boolean))
            : [];

      setAvailableWords(derivedOptions);
      setOrderedWords([]);
      setSelected(null);
      setTextAnswer("");
      setMultipleChoiceOptions([]);
      setChecked(false);
      setIsCorrect(null);

      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setRightOptions([]);
      return;
    }

    if (currentWrong.type === "fill_blank") {
      setTextAnswer("");
      setSelected(null);
      setOrderedWords([]);
      setAvailableWords([]);
      setMultipleChoiceOptions([]);
      setChecked(false);
      setIsCorrect(null);

      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setRightOptions([]);
      return;
    }

    if (currentWrong.type === "multiple_choice") {
      const correctAnswer = currentWrong.answer;
      const prevAnswer = currentWrong.selected;

      const options = shuffle(
        Array.from(new Set([correctAnswer, prevAnswer])).filter(Boolean)
      );

      setMultipleChoiceOptions(options);
      setSelected(null);
      setTextAnswer("");
      setOrderedWords([]);
      setAvailableWords([]);
      setChecked(false);
      setIsCorrect(null);

      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setRightOptions([]);
      return;
    }

    if (currentWrong.type === "match_pairs") {
      setSelected(null);
      setTextAnswer("");
      setOrderedWords([]);
      setAvailableWords([]);
      setMultipleChoiceOptions([]);
      setChecked(false);
      setIsCorrect(null);

      setSelectedLeft(null);
      setSelectedRight(null);
      setMatchedPairs([]);
      setRightOptions(buildFixedRightOptions(currentWrong.answer ?? []));
    }
  }, [mode, currentWrong?.exerciseId, currentWrong?.type]);

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
      !currentWrong ||
      (currentWrong.type !== "order_words" &&
        currentWrong.type !== "listening_build")
    ) {
      return;
    }

    const derivedOptions =
      currentWrong.options && Array.isArray(currentWrong.options)
        ? shuffle(currentWrong.options)
        : currentWrong.answer
          ? shuffle(String(currentWrong.answer).split(" ").filter(Boolean))
          : [];

    setOrderedWords([]);
    setAvailableWords(derivedOptions);
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

  function handleCheckPractice() {
    if (!currentWrong) return;

    const correctAnswer = currentWrong.answer;
    let ok = false;

    if (currentWrong.type === "multiple_choice") {
      if (selected === null) return;
      ok = selected === correctAnswer;
    }

    if (currentWrong.type === "fill_blank") {
      if (!textAnswer.trim()) return;
      ok = normalizeText(textAnswer) === normalizeText(correctAnswer);
    }

    if (
      currentWrong.type === "order_words" ||
      currentWrong.type === "listening_build"
    ) {
      if (!orderedWords.length) return;
      const builtAnswer = orderedWords.join(" ");
      ok = normalizeText(builtAnswer) === normalizeText(correctAnswer);
    }

    if (currentWrong.type === "match_pairs") {
      const expected = Array.isArray(correctAnswer) ? correctAnswer : [];
      if (matchedPairs.length !== expected.length) return;

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

      if (successAudioRef.current) {
        successAudioRef.current.currentTime = 0;
        successAudioRef.current.play().catch(() => {});
      }

      setTimeout(() => {
        setShowSuccessFx(false);
      }, 500);
    }
  }

  function handleNextPractice() {
    const next = practiceIndex + 1;
    if (next < wrongItems.length) {
      setPracticeIndex(next);
      resetPracticeState();
    } else {
      nav("/summary");
    }
  }

  const primaryButtonStyle = (disabled = false) => ({
    ...ui.primaryButton,
    ...(disabled ? ui.disabledButton : {}),
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 800,
    letterSpacing: "0.01em",
    boxShadow: disabled ? "none" : theme.shadows.primaryGlow,
  });

  const secondaryButtonStyle = {
    ...ui.secondaryButton,
    minHeight: "52px",
    borderRadius: "16px",
    fontWeight: 700,
  };

  const ghostButtonStyle = {
    ...ui.ghostButton,
    minHeight: "44px",
    borderRadius: "14px",
    fontWeight: 700,
  };

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
    borderRadius: "24px",
    padding: "1.2rem 1.2rem",
    border: `1px solid ${theme.colors.border}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "0 12px 28px rgba(2,8,25,0.14)",
    backdropFilter: theme.blur.md,
    WebkitBackdropFilter: theme.blur.md,
  };

  const summaryCard = {
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
    minHeight: "66px",
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
    minHeight: "82px",
    padding: "1rem",
    border: `1px solid ${theme.colors.borderStrong}`,
    background:
      "linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)",
  };

  const chipBase = {
    ...ui.chipButton,
    borderRadius: "16px",
    minHeight: "46px",
    padding: "0.72rem 1rem",
    fontWeight: 700,
    boxShadow: "0 10px 20px rgba(2,8,25,0.12)",
    background: "rgba(255,255,255,0.06)",
    transition:
      "transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease",
  };

  const chipSelected = {
    ...ui.chipButton,
    ...ui.chipButtonSelected,
    borderRadius: "16px",
    minHeight: "46px",
    padding: "0.72rem 1rem",
    fontWeight: 800,
    boxShadow: "0 0 0 1px rgba(212,255,38,0.18), 0 14px 26px rgba(2,8,25,0.18)",
    background: "rgba(212,255,38,0.12)",
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
    color: disabled ? "rgba(255,255,255,0.28)" : "#eef4ff",
    transition: "all 0.2s ease",
  });

  if (!lastSession) {
    return (
      <div style={ui.page}>
        <div style={ui.shell}>
          <Header userName={user.name} levelName={user.level ?? "-"} />
          <div style={{ marginTop: theme.spacing.xl }}>
            <div style={pageShell}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    color: theme.colors.text,
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Repaso de errores
                </h2>
                <p
                  style={{
                    marginTop: theme.spacing.md,
                    color: theme.colors.textSoft,
                  }}
                >
                  No hay sesión previa registrada.
                </p>
                <div style={{ marginTop: theme.spacing.xl }}>
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
        </div>
      </div>
    );
  }

  if (lastSession.wrong === 0) {
    return (
      <div style={ui.page}>
        <div style={ui.shell}>
          <Header userName={user.name} levelName={user.level ?? "-"} />
          <div style={{ marginTop: theme.spacing.xl }}>
            <div style={pageShell}>
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2
                  style={{
                    margin: 0,
                    color: theme.colors.text,
                    fontSize: "2.2rem",
                    fontWeight: 900,
                    letterSpacing: "-0.04em",
                  }}
                >
                  Repaso de errores
                </h2>
                <p
                  style={{
                    marginTop: theme.spacing.md,
                    color: "#d8ffe7",
                    fontWeight: 700,
                  }}
                >
                  ¡Perfecto! No has tenido errores en la sesión.
                </p>
                <div style={{ marginTop: theme.spacing.xl }}>
                  <button
                    style={primaryButtonStyle()}
                    onClick={() => nav("/summary")}
                  >
                    Ir al resumen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (mode === "practice") {
    if (!currentWrong) {
      return (
        <div style={ui.page}>
          <div style={ui.shell}>
            <Header userName={user.name} levelName={user.level ?? "-"} />
            <div style={{ marginTop: theme.spacing.xl }}>
              <div style={pageShell}>
                <div style={{ position: "relative", zIndex: 1 }}>
                  <h2
                    style={{
                      margin: 0,
                      color: theme.colors.text,
                      fontSize: "2.2rem",
                      fontWeight: 900,
                      letterSpacing: "-0.04em",
                    }}
                  >
                    Practicar errores
                  </h2>
                  <p
                    style={{
                      marginTop: theme.spacing.md,
                      color: theme.colors.textSoft,
                    }}
                  >
                    No hay errores para practicar.
                  </p>
                  <div style={{ marginTop: theme.spacing.xl }}>
                    <button
                      style={secondaryButtonStyle}
                      onClick={() => nav("/summary")}
                    >
                      Ir al resumen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    const correctAnswer = currentWrong.answer;

    const isCheckDisabled =
      (currentWrong.type === "multiple_choice" && selected === null) ||
      (currentWrong.type === "fill_blank" && !textAnswer.trim()) ||
      ((currentWrong.type === "order_words" ||
        currentWrong.type === "listening_build") &&
        orderedWords.length === 0) ||
      (currentWrong.type === "match_pairs" &&
        matchedPairs.length !== (currentWrong.answer ?? []).length);

    const progressValue =
      wrongItems.length > 0
        ? Math.round(((practiceIndex + 1) / wrongItems.length) * 100)
        : 0;

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

          .review-main-card {
            animation: fadeSlideUp 0.5s ease;
          }

          .review-option:hover {
            transform: translateY(-2px);
          }

          .review-chip:hover {
            transform: translateY(-2px);
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

          @media (max-width: 860px) {
            .pairs-grid-mobile {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 720px) {
            .review-top-grid {
              grid-template-columns: 1fr !important;
            }
          }
        `}</style>

        <div style={ui.shell}>
          <Header userName={user.name} levelName={user.level ?? "-"} />

          <div style={{ marginTop: theme.spacing.xl }}>
            <div style={pageShell} className="review-main-card">
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
                <audio ref={successAudioRef} preload="auto" style={{ display: "none" }}>
                  <source src="/audio/ui/success.mp3" type="audio/mpeg" />
                </audio>

                <div
                  className="review-top-grid"
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
                      Practice mode
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
                      Practicar errores
                    </h2>

                    <p
                      style={{
                        margin: `${theme.spacing.md} 0 0 0`,
                        color: theme.colors.textSoft,
                        fontSize: "1rem",
                      }}
                    >
                      Error {practiceIndex + 1} de {wrongItems.length}
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
                    <ProgressRing
                      value={progressValue}
                      label={`${practiceIndex + 1}/${wrongItems.length}`}
                    />
                  </div>
                </div>

                <div style={summaryCard}>
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
                        Actividad
                      </p>
                      <p
                        style={{
                          margin: `${theme.spacing.sm} 0 0 0`,
                          color: theme.colors.text,
                          fontWeight: 900,
                          fontSize: "1.6rem",
                          letterSpacing: "-0.04em",
                        }}
                      >
                        {formatExerciseType(currentWrong.type)}
                      </p>
                    </div>

                    <div style={{ ...ui.badge, borderRadius: "999px" }}>
                      Repaso
                    </div>
                  </div>

                  <div style={{ ...promptCard, marginBottom: theme.spacing.xl }}>
                    <p
                      style={{
                        margin: 0,
                        color: theme.colors.text,
                        fontSize: "1.08rem",
                        fontWeight: 700,
                        lineHeight: 1.6,
                      }}
                    >
                      {currentWrong.prompt}
                    </p>
                  </div>

                  {currentWrong.type === "multiple_choice" && (
                    <div
                      style={{
                        display: "grid",
                        gap: theme.spacing.md,
                        maxWidth: "100%",
                      }}
                    >
                      {multipleChoiceOptions.map((opt) => {
                        const isActive = selected === opt;
                        return (
                          <label
                            key={opt}
                            style={optionCardStyle(isActive)}
                            className="review-option"
                          >
                            <input
                              type="radio"
                              name={`retry_${practiceIndex}`}
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

                  {currentWrong.type === "fill_blank" && (
                    <div style={{ maxWidth: "42rem", marginTop: theme.spacing.md }}>
                      <label
                        htmlFor={`review_fb_${practiceIndex}`}
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
                        id={`review_fb_${practiceIndex}`}
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

                  {currentWrong.type === "order_words" && (
                    <div style={{ maxWidth: "52rem", marginTop: theme.spacing.md }}>
                      {currentWrong.sourceText && (
                        <div style={{ ...promptCard, marginBottom: theme.spacing.lg }}>
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
                            Frase en español
                          </p>
                          <p
                            style={{
                              margin: `${theme.spacing.sm} 0 0 0`,
                              color: theme.colors.text,
                              fontWeight: 900,
                              fontSize: "1.08rem",
                            }}
                          >
                            {currentWrong.sourceText}
                          </p>
                        </div>
                      )}

                      <p
                        style={{
                          marginBottom: theme.spacing.sm,
                          color: theme.colors.text,
                          fontWeight: 800,
                        }}
                      >
                        Forma la frase en inglés pulsando las palabras:
                      </p>

                      <div style={answerStage}>
                        {orderedWords.length > 0 ? (
                          orderedWords.map((word, i) => (
                            <button
                              key={`${word}_selected_${i}`}
                              type="button"
                              onClick={() => handleRemoveWord(i)}
                              style={chipSelected}
                              className="review-chip"
                            >
                              {word}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: theme.colors.textMuted }}>
                            Tu frase en inglés aparecerá aquí
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
                            className="review-chip"
                          >
                            {word}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: theme.spacing.lg }}>
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

                  {currentWrong.type === "listening_build" && (
                    <div style={{ maxWidth: "52rem", marginTop: theme.spacing.md }}>
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
                              Listening mode
                            </p>
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

                          <div style={{ ...ui.badge, borderRadius: "999px" }}>
                            Audio
                          </div>
                        </div>

                        <audio
                          key={currentWrong.audio || currentWrong.exerciseId}
                          controls
                          preload="none"
                          style={{ width: "100%" }}
                        >
                          <source src={currentWrong.audio} type="audio/mpeg" />
                          Tu navegador no soporta el audio.
                        </audio>
                      </div>

                      {currentWrong.translation && (
                        <div style={{ ...promptCard, marginBottom: theme.spacing.lg }}>
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
                            Traducción de apoyo
                          </p>
                          <p
                            style={{
                              margin: `${theme.spacing.sm} 0 0 0`,
                              color: theme.colors.text,
                              fontWeight: 900,
                              fontSize: "1.08rem",
                            }}
                          >
                            {currentWrong.translation}
                          </p>
                        </div>
                      )}

                      <p
                        style={{
                          marginBottom: theme.spacing.sm,
                          color: theme.colors.text,
                          fontWeight: 800,
                        }}
                      >
                        Construye la frase en inglés pulsando las palabras:
                      </p>

                      <div style={answerStage}>
                        {orderedWords.length > 0 ? (
                          orderedWords.map((word, i) => (
                            <button
                              key={`${word}_listening_selected_${i}`}
                              type="button"
                              onClick={() => handleRemoveWord(i)}
                              style={chipSelected}
                              className="review-chip"
                            >
                              {word}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: theme.colors.textMuted }}>
                            Tu frase en inglés aparecerá aquí
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
                            className="review-chip"
                          >
                            {word}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: theme.spacing.lg }}>
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

                  {currentWrong.type === "match_pairs" && (
                    <div style={{ marginTop: theme.spacing.md, maxWidth: "100%" }}>
                      <p
                        style={{
                          fontWeight: 800,
                          marginBottom: theme.spacing.sm,
                          color: theme.colors.text,
                        }}
                      >
                        Selecciona una palabra en inglés y su traducción correcta:
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
                            {(currentWrong.answer ?? []).map((pair) => {
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
                                  className="review-option"
                                >
                                  <span
                                    style={{
                                      color: alreadyMatched
                                        ? "rgba(255,255,255,0.28)"
                                        : "#eef4ff",
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
                                  className="review-option"
                                >
                                  <span
                                    style={{
                                      color: alreadyMatched
                                        ? "rgba(255,255,255,0.28)"
                                        : "#eef4ff",
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

                      <div style={{ ...promptCard, marginTop: theme.spacing.lg, maxWidth: "700px" }}>
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

                  <div style={{ marginTop: theme.spacing.xxxl }}>
                    {!checked ? (
                      <div style={{ display: "flex", gap: theme.spacing.md, flexWrap: "wrap" }}>
                        <button
                          onClick={handleCheckPractice}
                          disabled={isCheckDisabled}
                          style={primaryButtonStyle(isCheckDisabled)}
                        >
                          Comprobar
                        </button>
                        <button onClick={cancelPractice} style={secondaryButtonStyle}>
                          Cancelar reintento
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
                              ? currentWrong.type === "match_pairs"
                                ? "✅ Correcto. Has unido todas las parejas correctamente."
                                : "✅ Correcto"
                              : currentWrong.type === "match_pairs"
                                ? "❌ Incorrecto. Revisa las parejas y vuelve a intentarlo."
                                : `❌ Incorrecto. Respuesta correcta: ${formatAnswer(correctAnswer)}`}
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

                        <button onClick={handleNextPractice} style={primaryButtonStyle()}>
                          {practiceIndex + 1 < wrongItems.length
                            ? "Siguiente"
                            : "Finalizar reintento"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const errorRate =
    lastSession.total > 0
      ? Math.round((lastSession.wrong / lastSession.total) * 100)
      : 0;

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

        .review-main-card {
          animation: fadeSlideUp 0.5s ease;
        }

        .review-hover:hover {
          transform: translateY(-2px);
        }

        @media (max-width: 720px) {
          .review-summary-top {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div style={ui.shell}>
        <Header userName={user.name} levelName={user.level ?? "-"} />

        <div style={{ marginTop: theme.spacing.xl }}>
          <div style={pageShell} className="review-main-card">
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
                className="review-summary-top"
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
                    Error review
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
                    Repaso de errores
                  </h2>

                  <p
                    style={{
                      margin: `${theme.spacing.md} 0 0 0`,
                      color: theme.colors.textSoft,
                      fontSize: "1rem",
                      lineHeight: 1.55,
                    }}
                  >
                    Has fallado <strong>{lastSession.wrong}</strong> de{" "}
                    <strong>{lastSession.total}</strong> ejercicios.
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
                  <ProgressRing value={errorRate} label="Errores" />
                </div>
              </div>

              <div
                style={{
                  display: "grid",
                  gap: theme.spacing.lg,
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  marginBottom: theme.spacing.xl,
                }}
              >
                <div style={glassCard}>
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
                    Errores seleccionados
                  </p>
                  <p
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      fontSize: "1.8rem",
                      fontWeight: 900,
                      color: theme.colors.text,
                    }}
                  >
                    {wrongItems.length}
                  </p>
                </div>

                <div style={glassCard}>
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
                    Estado
                  </p>
                  <p
                    style={{
                      margin: `${theme.spacing.sm} 0 0 0`,
                      fontSize: "1.05rem",
                      fontWeight: 800,
                      color: theme.colors.textSoft,
                    }}
                  >
                    Listo para practicar
                  </p>
                </div>
              </div>

              <div style={{ ...summaryCard, marginBottom: theme.spacing.xl }}>
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
                      Patrones detectados
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
                      Tipos de error más frecuentes
                    </h3>
                  </div>

                  <div style={{ ...ui.badge, borderRadius: "999px" }}>
                    Análisis
                  </div>
                </div>

                {Object.keys(lastSession.errorTagsCount || {}).length === 0 ? (
                  <p style={{ margin: 0, color: theme.colors.textSoft }}>
                    No se detectaron patrones de error.
                  </p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
                    {Object.entries(lastSession.errorTagsCount || {})
                      .sort((a, b) => b[1] - a[1])
                      .map(([tag, count]) => (
                        <span
                          key={tag}
                          style={{
                            background: "rgba(212,255,38,0.10)",
                            border: `1px solid ${theme.colors.borderAccent}`,
                            borderRadius: "999px",
                            padding: "0.48rem 0.85rem",
                            fontSize: "0.92rem",
                            fontWeight: 700,
                            color: theme.colors.text,
                            boxShadow: "0 0 0 1px rgba(212,255,38,0.06)",
                          }}
                        >
                          {formatTag(tag)} ({count})
                        </span>
                      ))}
                  </div>
                )}
              </div>

              <div style={summaryCard}>
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
                      Detalle
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
                      Errores a repasar
                    </h3>
                  </div>

                  <div style={{ ...ui.badge, borderRadius: "999px" }}>
                    {wrongItems.length} items
                  </div>
                </div>

                <div style={{ display: "grid", gap: theme.spacing.lg }}>
                  {wrongItems.map((w) => (
                    <div
                      key={w.exerciseId}
                      style={{
                        ...promptCard,
                        padding: "1.1rem 1.15rem",
                      }}
                      className="review-hover"
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
                          {formatExerciseType(w.type)}
                        </span>
                      </div>

                      <div style={{ marginBottom: "0.6rem", color: theme.colors.text }}>
                        <strong>Ejercicio:</strong> {w.prompt}
                      </div>

                      <div style={{ marginBottom: "0.45rem", color: "#ffd7df" }}>
                        <strong>Tu respuesta:</strong> {formatAnswer(w.selected)}
                      </div>

                      <div style={{ color: "#d8ffe7" }}>
                        <strong>Correcta:</strong> {formatAnswer(w.answer)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div
                style={{
                  marginTop: theme.spacing.xl,
                  display: "flex",
                  gap: theme.spacing.md,
                  flexWrap: "wrap",
                }}
              >
                <button style={primaryButtonStyle()} onClick={startPractice}>
                  Practicar errores
                </button>
                <button
                  style={secondaryButtonStyle}
                  onClick={() => nav("/summary")}
                >
                  Finalizar repaso
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}