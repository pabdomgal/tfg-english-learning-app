import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, getLastSession } from "../services/storage";
import { formatTag } from "../services/tagFormat";
import { buildReviewSession } from "../services/lessonEngine";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
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

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  if (!lastSession) {
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
            <h2>Repaso de errores</h2>
            <p>No hay sesión previa registrada.</p>
            <button onClick={() => nav("/menu")}>Volver al menú</button>
          </div>
        </div>
      </div>
    );
  }

  if (lastSession.wrong === 0) {
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
            <h2>Repaso de errores</h2>
            <p style={{ color: "#157347", fontWeight: 600 }}>
              ¡Perfecto! No has tenido errores en la sesión.
            </p>
            <button onClick={() => nav("/summary")}>Ir al resumen</button>
          </div>
        </div>
      </div>
    );
  }

  const wrongItems = useMemo(() => {
    const wrongItemsAll = lastSession?.wrongItems || [];
    return buildReviewSession(wrongItemsAll, 3);
  }, [lastSession]);

  const currentWrong = useMemo(() => {
    return wrongItems[practiceIndex] || null;
  }, [wrongItems, practiceIndex]);

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
      const rights = (currentWrong.answer ?? []).map((p) => p.right);

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
      setRightOptions(shuffle(rights));
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

  if (mode === "practice") {
    if (!currentWrong) {
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
              <h2>Practicar errores</h2>
              <p>No hay errores para practicar.</p>
              <button onClick={() => nav("/summary")}>Ir al resumen</button>
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
            <h2 style={{ marginBottom: "0.5rem" }}>Practicar errores</h2>

            <div
              style={{
                display: "inline-block",
                background: "#eef3ff",
                border: "1px solid #bfd0f5",
                borderRadius: "999px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.9rem",
                fontWeight: 600,
                color: "#16325c",
                marginBottom: "1rem",
              }}
            >
              Error {practiceIndex + 1} de {wrongItems.length}
            </div>

            <div
              style={{
                background: "#f8fbff",
                border: "1px solid #d9e1f0",
                borderRadius: "16px",
                padding: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ marginBottom: "0.5rem" }}>
                <span
                  style={{
                    background: "#eef3ff",
                    border: "1px solid #bfd0f5",
                    borderRadius: "999px",
                    padding: "0.3rem 0.7rem",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#16325c",
                  }}
                >
                  {formatExerciseType(currentWrong.type)}
                </span>
              </div>

              <p style={{ margin: 0 }}>
                <strong>Ejercicio:</strong> {currentWrong.prompt}
              </p>
            </div>

            {currentWrong.type === "multiple_choice" && (
              <div style={{ display: "grid", gap: "0.75rem", maxWidth: "34rem" }}>
                {multipleChoiceOptions.map((opt) => (
                  <label
                    key={opt}
                    style={{
                      display: "flex",
                      gap: "0.75rem",
                      alignItems: "center",
                      background: "#f8fbff",
                      border: "1px solid #d9e1f0",
                      borderRadius: "12px",
                      padding: "0.85rem 1rem",
                    }}
                  >
                    <input
                      type="radio"
                      name={`retry_${practiceIndex}`}
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

            {currentWrong.type === "fill_blank" && (
              <div style={{ maxWidth: "34rem", marginTop: "0.75rem" }}>
                <label
                  htmlFor={`review_fb_${practiceIndex}`}
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

            {currentWrong.type === "order_words" && (
              <div style={{ maxWidth: "44rem", marginTop: "0.75rem" }}>
                {currentWrong.sourceText && (
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
                      {currentWrong.sourceText}
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

            {currentWrong.type === "listening_build" && (
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
                    <source src={currentWrong.audio} type="audio/mpeg" />
                    Tu navegador no soporta el audio.
                  </audio>
                </div>

                {currentWrong.translation && (
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
                      {currentWrong.translation}
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

            {currentWrong.type === "match_pairs" && (
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
                      {(currentWrong.answer ?? []).map((pair) => {
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

            <div style={{ marginTop: "1.25rem" }}>
              {!checked ? (
                <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                  <button onClick={handleCheckPractice} disabled={isCheckDisabled}>
                    Comprobar
                  </button>
                  <button onClick={cancelPractice}>Cancelar reintento</button>
                </div>
              ) : (
                <>
                  <p
                    style={{
                      marginTop: "1rem",
                      marginBottom: "1rem",
                      fontWeight: 600,
                      color: isCorrect ? "#157347" : "#c0392b",
                    }}
                  >
                    {isCorrect
                      ? currentWrong.type === "match_pairs"
                        ? "✅ Correcto. Has unido todas las parejas correctamente."
                        : "✅ Correcto"
                      : currentWrong.type === "match_pairs"
                        ? "❌ Incorrecto. Revisa las parejas y vuelve a intentarlo."
                        : `❌ Incorrecto. Respuesta correcta: ${correctAnswer}`}
                  </p>
                  <button onClick={handleNextPractice}>
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
    );
  }

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
          <h2 style={{ marginBottom: "0.5rem" }}>Repaso de errores</h2>

          <p style={{ color: "#5b6780", marginBottom: "1rem" }}>
            Has fallado <strong>{lastSession.wrong}</strong> de{" "}
            <strong>{lastSession.total}</strong> ejercicios.
          </p>

          <div
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <p style={{ margin: 0 }}>
              Se han seleccionado <strong>{wrongItems.length}</strong> errores para el
              repaso.
            </p>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <h3 style={{ marginBottom: "0.75rem" }}>Tipos de error más frecuentes</h3>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.75rem" }}>
              {Object.entries(lastSession.errorTagsCount || {})
                .sort((a, b) => b[1] - a[1])
                .map(([tag, count]) => (
                  <span
                    key={tag}
                    style={{
                      background: "#eef3ff",
                      border: "1px solid #bfd0f5",
                      borderRadius: "999px",
                      padding: "0.4rem 0.75rem",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: "#16325c",
                    }}
                  >
                    {formatTag(tag)} ({count})
                  </span>
                ))}
            </div>
          </div>

          <div
            style={{
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1rem",
            }}
          >
            <h3 style={{ marginBottom: "1rem" }}>Detalle de fallos</h3>

            <div style={{ display: "grid", gap: "1rem" }}>
              {wrongItems.map((w) => (
                <div
                  key={w.exerciseId}
                  style={{
                    background: "#ffffff",
                    border: "1px solid #d9e1f0",
                    borderRadius: "14px",
                    padding: "1rem",
                  }}
                >
                  <div style={{ marginBottom: "0.5rem" }}>
                    <span
                      style={{
                        background: "#eef3ff",
                        border: "1px solid #bfd0f5",
                        borderRadius: "999px",
                        padding: "0.3rem 0.7rem",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        color: "#16325c",
                      }}
                    >
                      {formatExerciseType(w.type)}
                    </span>
                  </div>

                  <div style={{ marginBottom: "0.4rem" }}>
                    <strong style={{ color: "#16325c" }}>Ejercicio:</strong> {w.prompt}
                  </div>
                  <div style={{ marginBottom: "0.4rem", color: "#c0392b" }}>
                    <strong>Tu respuesta:</strong>{" "}
                    {Array.isArray(w.selected) ? JSON.stringify(w.selected) : String(w.selected ?? "-")}
                  </div>
                  <div style={{ color: "#157347" }}>
                    <strong>Correcta:</strong>{" "}
                    {Array.isArray(w.answer) ? JSON.stringify(w.answer) : String(w.answer ?? "-")}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button onClick={startPractice}>Practicar errores</button>
            <button onClick={() => nav("/summary")}>Finalizar repaso</button>
          </div>
        </div>
      </div>
    </div>
  );
}