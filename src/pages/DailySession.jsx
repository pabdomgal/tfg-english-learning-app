import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, saveSessionResult } from "../services/storage";
import { getCurrentLesson, buildDailySession } from "../services/lessonEngine";

export default function DailySession() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  const [phase, setPhase] = useState("vocab");

  // Multi-ejercicio
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionResults, setSessionResults] = useState([]);

  // Estado del ejercicio actual
  const [selected, setSelected] = useState(null);
  const [textAnswer, setTextAnswer] = useState("");
  const [orderedWords, setOrderedWords] = useState([]);
  const [availableWords, setAvailableWords] = useState([]);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Guardado seguro del último resultado
  const [lastResult, setLastResult] = useState(null);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const lessonIndex = user.lessonIndexByLevel?.[user.level] ?? 0;
  const lesson = getCurrentLesson(user.level, lessonIndex);

  const levelSessions = user.levelProgress?.[user.level]?.sessions ?? 0;
  const exercises = buildDailySession(user.level, lessonIndex, 5, levelSessions);
  const exercise = exercises[currentIndex] ?? null;

  useEffect(() => {
    if (exercise?.type === "order_words") {
      setAvailableWords(exercise.options ?? []);
      setOrderedWords([]);
      setChecked(false);
      setIsCorrect(null);
    }
  }, [exercise]);

  function handleCancel() {
    nav("/menu");
  }

  function goToExercise() {
    setPhase("exercise");
    setCurrentIndex(0);
    setSessionResults([]);
    setLastResult(null);
    resetExerciseState();
  }

  function resetExerciseState() {
    setSelected(null);
    setTextAnswer("");
    setOrderedWords([]);
    setAvailableWords(exercise?.type === "order_words" ? exercise.options ?? [] : []);
    setChecked(false);
    setIsCorrect(null);
  }

  function normalizeText(value) {
    return String(value ?? "").trim().toLowerCase();
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
    if (!exercise || exercise.type !== "order_words") return;

    setOrderedWords([]);
    setAvailableWords(exercise.options ?? []);
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

    if (exercise.type === "order_words") {
      if (!orderedWords.length) return;
      userAnswer = orderedWords.join(" ");
      ok = normalizeText(userAnswer) === normalizeText(exercise.answer);
    }

    setChecked(true);
    setIsCorrect(ok);

    const result = {
      exerciseId: exercise.id,
      prompt: exercise.prompt,
      answer: exercise.answer,
      selected: userAnswer,
      isCorrect: ok,
      tags: exercise.tags ?? [],
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
      resetExerciseState();
    } else {
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
          Principiante: 1,
          Intermedio: 1,
          Avanzado: 2,
        },
      });

      nav("/review");
    }
  }

  const isCheckDisabled =
    !exercise ||
    (exercise.type === "multiple_choice" && selected === null) ||
    (exercise.type === "fill_blank" && !textAnswer.trim()) ||
    (exercise.type === "order_words" && orderedWords.length === 0);

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />

      <div style={{ padding: "1rem" }}>
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #d9e1f0",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
            padding: "1.5rem",
          }}
        >
          <h2 style={{ marginBottom: "0.5rem" }}>Lección diaria</h2>

          {lesson && (
            <p style={{ color: "#5b6780", marginBottom: "1.5rem" }}>
              <strong style={{ color: "#16325c" }}>Lección actual:</strong> {lesson.title} ({lesson.id})
            </p>
          )}

          {!lesson ? (
            <>
              <p>No hay lecciones cargadas para este nivel todavía.</p>
              <button onClick={() => nav("/menu")}>Volver</button>
            </>
          ) : phase === "vocab" ? (
            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1.25rem",
              }}
            >
              <h3 style={{ marginBottom: "0.5rem" }}>Introducción de vocabulario</h3>
              <p style={{ color: "#5b6780", marginBottom: "1rem" }}>
                Repasa las palabras clave que aparecerán en la lección.
              </p>

              <ul style={{ marginBottom: "1.25rem" }}>
                {lesson.vocab.map((v) => (
                  <li key={v.word}>
                    <strong>{v.word}</strong> — {v.meaning}
                  </li>
                ))}
              </ul>

              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                <button onClick={goToExercise}>Comenzar ejercicios</button>
                <button onClick={handleCancel}>Cancelar sesión</button>
              </div>
            </div>
          ) : (
            <>
              {!exercise ? (
                <>
                  <p>No hay ejercicios definidos para esta lección.</p>
                  <button onClick={() => nav("/menu")}>Volver</button>
                </>
              ) : (
                <div
                  style={{
                    background: "#f8fbff",
                    border: "1px solid #d9e1f0",
                    borderRadius: "16px",
                    padding: "1.25rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      flexWrap: "wrap",
                      gap: "0.75rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <p style={{ margin: 0, fontWeight: 700, color: "#16325c" }}>
                      Ejercicio {currentIndex + 1} de {exercises.length}
                    </p>

                    <span
                      style={{
                        background: "#eef3ff",
                        border: "1px solid #bfd0f5",
                        borderRadius: "999px",
                        padding: "0.35rem 0.75rem",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#16325c",
                      }}
                    >
                      {exercise.type}
                    </span>
                  </div>

                  <p style={{ fontSize: "1.1rem", marginBottom: "1rem" }}>
                    {exercise.prompt}
                  </p>

                  {exercise.type === "multiple_choice" && (
                    <div style={{ display: "grid", gap: "0.75rem", maxWidth: "34rem" }}>
                      {exercise.options.map((opt) => (
                        <label
                          key={opt}
                          style={{
                            display: "flex",
                            gap: "0.75rem",
                            alignItems: "center",
                            background: "#ffffff",
                            border: "1px solid #d9e1f0",
                            borderRadius: "12px",
                            padding: "0.85rem 1rem",
                          }}
                        >
                          <input
                            type="radio"
                            name={`mc_${currentIndex}`}
                            checked={selected === opt}
                            onChange={() => {
                              setSelected(opt);
                              setChecked(false);
                              setIsCorrect(null);
                            }}
                          />
                          {opt}
                        </label>
                      ))}
                    </div>
                  )}

                  {exercise.type === "fill_blank" && (
                    <div style={{ maxWidth: "34rem", marginTop: "0.75rem" }}>
                      <label
                        htmlFor={`fb_${currentIndex}`}
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "600",
                          color: "#16325c",
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
                          width: "100%",
                          padding: "0.85rem 1rem",
                          border: "2px solid #bfd0f5",
                          borderRadius: "12px",
                          backgroundColor: "#fff",
                          color: "#000",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                        }}
                      />
                    </div>
                  )}

                  {exercise.type === "order_words" && (
                    <div style={{ maxWidth: "44rem", marginTop: "0.75rem" }}>
                      <p
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          color: "#16325c",
                        }}
                      >
                        Forma la frase pulsando las palabras:
                      </p>

                      <div
                        style={{
                          minHeight: "64px",
                          padding: "0.9rem",
                          border: "2px solid #bfd0f5",
                          borderRadius: "12px",
                          backgroundColor: "#fff",
                          marginBottom: "1rem",
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.5rem",
                          alignItems: "center",
                        }}
                      >
                        {orderedWords.length > 0 ? (
                          orderedWords.map((word, i) => (
                            <button
                              key={`${word}_selected_${i}`}
                              type="button"
                              onClick={() => handleRemoveWord(i)}
                            >
                              {word}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: "#5b6780" }}>Tu frase aparecerá aquí</span>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                        {availableWords.map((word, idx) => (
                          <button
                            key={`${word}_${idx}`}
                            type="button"
                            onClick={() => handleAddWord(word, idx)}
                          >
                            {word}
                          </button>
                        ))}
                      </div>

                      <div style={{ marginTop: "0.9rem" }}>
                        <button type="button" onClick={handleResetWords}>
                          Reiniciar frase
                        </button>
                      </div>
                    </div>
                  )}

                  {exercise.type !== "multiple_choice" &&
                    exercise.type !== "fill_blank" &&
                    exercise.type !== "order_words" && (
                      <p style={{ color: "crimson", fontWeight: 600 }}>
                        Tipo de ejercicio no soportado todavía: {exercise.type}
                      </p>
                    )}

                  <div style={{ marginTop: "1.25rem" }}>
                    {!checked ? (
                      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                        <button onClick={handleCheck} disabled={isCheckDisabled}>
                          Comprobar
                        </button>
                        <button onClick={handleCancel}>Cancelar sesión</button>
                      </div>
                    ) : (
                      <>
                        <p
                          style={{
                            marginBottom: "1rem",
                            fontWeight: 600,
                            color: isCorrect ? "#157347" : "#c0392b",
                          }}
                        >
                          {isCorrect
                            ? "✅ Correcto"
                            : `❌ Incorrecto. Respuesta correcta: ${exercise.answer}`}
                        </p>

                        <button onClick={handleNext}>
                          {currentIndex + 1 < exercises.length
                            ? "Siguiente ejercicio"
                            : "Finalizar sesión"}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}