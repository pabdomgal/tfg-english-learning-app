import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, saveSessionResult } from "../services/storage";
import { getCurrentLesson, buildDailySession } from "../services/lessonEngine";

function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  const lessonIndex = user.lessonIndexByLevel?.[user.level] ?? 0;
  const lesson = getCurrentLesson(user.level, lessonIndex);

  const levelSessions = user.levelProgress?.[user.level]?.sessions ?? 0;
  const exercises = buildDailySession(user.level, lessonIndex, 5, levelSessions);
  const exercise = exercises[currentIndex] ?? null;

  const progressPercent =
    exercises.length > 0 ? Math.round(((currentIndex + 1) / exercises.length) * 100) : 0;

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
      const rights = (exercise.pairs ?? []).map((p) => p.right);
      setRightOptions(shuffleArray(rights));
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

  function handleMatchLeft(leftWord) {
    if (checked) return;
    setSelectedLeft(leftWord);
  }

  function handleMatchRight(rightWord) {
    if (checked) return;
    setSelectedRight(rightWord);
  }

  function handleConfirmPair() {
    if (checked || !selectedLeft || !selectedRight) return;

    const pairExists = matchedPairs.some(
      (p) => p.left === selectedLeft || p.right === selectedRight
    );
    if (pairExists) return;

    setMatchedPairs((prev) => [...prev, { left: selectedLeft, right: selectedRight }]);
    setSelectedLeft(null);
    setSelectedRight(null);
    setChecked(false);
    setIsCorrect(null);
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
          Principiante: 3,
          Intermedio: 3,
          Avanzado: 3,
        },
      });

      nav("/review");
    }
  }

  const isCheckDisabled =
    !exercise ||
    (exercise.type === "multiple_choice" && selected === null) ||
    (exercise.type === "fill_blank" && !textAnswer.trim()) ||
    ((exercise.type === "order_words" || exercise.type === "listening_build") &&
      orderedWords.length === 0) ||
    (exercise.type === "match_pairs" &&
      matchedPairs.length !== (exercise.pairs ?? []).length);

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
              <strong style={{ color: "#16325c" }}>Lección actual:</strong> {lesson.title} (
              {lesson.id})
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
                  <div style={{ marginBottom: "1rem" }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                        marginBottom: "0.6rem",
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
                        {progressPercent}% completado
                      </span>
                    </div>

                    <div
                      style={{
                        width: "100%",
                        height: "10px",
                        background: "#dfe7f5",
                        borderRadius: "999px",
                        overflow: "hidden",
                      }}
                    >
                      <div
                        style={{
                          width: `${progressPercent}%`,
                          height: "100%",
                          background: "linear-gradient(90deg, #4f86ff 0%, #1f4ea3 100%)",
                          borderRadius: "999px",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  </div>

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
                      Actividad actual
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
                      {formatExerciseType(exercise.type)}
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
                      {exercise.sourceText && (
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d9e1f0",
                            borderRadius: "12px",
                            padding: "0.9rem 1rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <p style={{ margin: 0, color: "#5b6780", fontSize: "0.95rem" }}>
                            Frase en español
                          </p>
                          <p
                            style={{
                              margin: "0.35rem 0 0 0",
                              fontWeight: 700,
                              color: "#16325c",
                              fontSize: "1.05rem",
                            }}
                          >
                            {exercise.sourceText}
                          </p>
                        </div>
                      )}

                      <p
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          color: "#16325c",
                        }}
                      >
                        Forma la frase en inglés pulsando las palabras:
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
                          <span style={{ color: "#5b6780" }}>Tu frase en inglés aparecerá aquí</span>
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

                  {exercise.type === "listening_build" && (
                    <div style={{ maxWidth: "44rem", marginTop: "0.75rem" }}>
                      <div
                        style={{
                          background: "#ffffff",
                          border: "1px solid #d9e1f0",
                          borderRadius: "12px",
                          padding: "1rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <p
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontWeight: "600",
                            color: "#16325c",
                          }}
                        >
                          Escucha el audio:
                        </p>

                        <audio controls preload="none" style={{ width: "100%" }}>
                          <source src={exercise.audio} type="audio/mpeg" />
                          Tu navegador no soporta el audio.
                        </audio>
                      </div>

                      {exercise.translation && (
                        <div
                          style={{
                            background: "#ffffff",
                            border: "1px solid #d9e1f0",
                            borderRadius: "12px",
                            padding: "0.9rem 1rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <p style={{ margin: 0, color: "#5b6780", fontSize: "0.95rem" }}>
                            Traducción de apoyo
                          </p>
                          <p
                            style={{
                              margin: "0.35rem 0 0 0",
                              fontWeight: 700,
                              color: "#16325c",
                              fontSize: "1.05rem",
                            }}
                          >
                            {exercise.translation}
                          </p>
                        </div>
                      )}

                      <p
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.5rem",
                          color: "#16325c",
                        }}
                      >
                        Construye la frase en inglés pulsando las palabras:
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
                              key={`${word}_listening_selected_${i}`}
                              type="button"
                              onClick={() => handleRemoveWord(i)}
                            >
                              {word}
                            </button>
                          ))
                        ) : (
                          <span style={{ color: "#5b6780" }}>
                            Tu frase en inglés aparecerá aquí
                          </span>
                        )}
                      </div>

                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem" }}>
                        {availableWords.map((word, idx) => (
                          <button
                            key={`${word}_listening_${idx}`}
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

                  {exercise.type === "match_pairs" && (
                    <div style={{ marginTop: "0.75rem" }}>
                      <p
                        style={{
                          fontWeight: "600",
                          marginBottom: "0.75rem",
                          color: "#16325c",
                        }}
                      >
                        Selecciona una palabra en inglés y su traducción correcta:
                      </p>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                          maxWidth: "700px",
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Inglés</p>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {(exercise.pairs ?? []).map((pair) => {
                              const alreadyMatched = matchedPairs.some((m) => m.left === pair.left);
                              return (
                                <button
                                  key={pair.left}
                                  type="button"
                                  disabled={alreadyMatched}
                                  onClick={() => handleMatchLeft(pair.left)}
                                  style={{
                                    opacity: alreadyMatched ? 0.4 : 1,
                                    cursor: alreadyMatched ? "not-allowed" : "pointer",
                                    border:
                                      selectedLeft === pair.left
                                        ? "2px solid #1f4ea3"
                                        : undefined,
                                  }}
                                >
                                  {pair.left}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Español</p>
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {rightOptions.map((right) => {
                              const alreadyMatched = matchedPairs.some((m) => m.right === right);
                              return (
                                <button
                                  key={right}
                                  type="button"
                                  disabled={alreadyMatched}
                                  onClick={() => handleMatchRight(right)}
                                  style={{
                                    opacity: alreadyMatched ? 0.4 : 1,
                                    cursor: alreadyMatched ? "not-allowed" : "pointer",
                                    border:
                                      selectedRight === right
                                        ? "2px solid #1f4ea3"
                                        : undefined,
                                  }}
                                >
                                  {right}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          marginTop: "1rem",
                          display: "flex",
                          gap: "0.75rem",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={handleConfirmPair}
                          disabled={!selectedLeft || !selectedRight}
                        >
                          Confirmar pareja
                        </button>
                      </div>

                      <div
                        style={{
                          marginTop: "1rem",
                          background: "#fff",
                          border: "1px solid #d9e1f0",
                          borderRadius: "12px",
                          padding: "1rem",
                          maxWidth: "700px",
                        }}
                      >
                        <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
                          Parejas formadas
                        </p>

                        {matchedPairs.length === 0 ? (
                          <p style={{ color: "#5b6780", margin: 0 }}>
                            Aún no has formado ninguna pareja.
                          </p>
                        ) : (
                          <div style={{ display: "grid", gap: "0.5rem" }}>
                            {matchedPairs.map((pair, idx) => (
                              <div
                                key={`${pair.left}_${pair.right}_${idx}`}
                                style={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  alignItems: "center",
                                  gap: "1rem",
                                  background: "#f8fbff",
                                  border: "1px solid #d9e1f0",
                                  borderRadius: "10px",
                                  padding: "0.75rem",
                                }}
                              >
                                <span>
                                  <strong>{pair.left}</strong> — {pair.right}
                                </span>

                                {!checked && (
                                  <button type="button" onClick={() => handleRemovePair(idx)}>
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