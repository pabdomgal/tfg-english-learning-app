import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, getLastSession } from "../services/storage";
import { formatTag } from "../services/tagFormat";

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function ReviewSession() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  // leer siempre el último estado real
  const lastSession = getLastSession();

  const [mode, setMode] = useState("summary");

  // estado del reintento
  const [practiceIndex, setPracticeIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  if (!lastSession) {
    return (
      <div>
        <Header userName={user.name} levelName={user.level ?? "-"} />
        <div style={{ padding: "1rem" }}>
          <h2>Repaso de errores</h2>
          <p>No hay sesión previa registrada.</p>
          <button onClick={() => nav("/menu")}>Volver al menú</button>
        </div>
      </div>
    );
  }

  // si no hay errores, directo al resumen
  if (lastSession.wrong === 0) {
    return (
      <div>
        <Header userName={user.name} levelName={user.level ?? "-"} />
        <div style={{ padding: "1rem" }}>
          <h2>Repaso de errores</h2>
          <p>¡Perfecto! No has tenido errores en la sesión.</p>
          <button onClick={() => nav("/summary")}>Ir al resumen</button>
        </div>
      </div>
    );
  }

  const wrongItems = lastSession.wrongItems || [];
  const currentWrong = wrongItems[practiceIndex] || null;

  function startPractice() {
    setMode("practice");
    setPracticeIndex(0);
    setSelected(null);
    setChecked(false);
    setIsCorrect(null);
  }

  function cancelPractice() {
    setMode("summary");
    setPracticeIndex(0);
    setSelected(null);
    setChecked(false);
    setIsCorrect(null);
  }

  function handleCheckPractice(correctAnswer) {
    if (selected === null) return;
    const ok = selected === correctAnswer;
    setChecked(true);
    setIsCorrect(ok);
  }

  function handleNextPractice() {
    const next = practiceIndex + 1;
    if (next < wrongItems.length) {
      setPracticeIndex(next);
      setSelected(null);
      setChecked(false);
      setIsCorrect(null);
    } else {
      // fin del reintento
      nav("/summary");
    }
  }

  // -- VISTA: PRACTICAR ERRORES ---
  if (mode === "practice") {
    if (!currentWrong) {
      return (
        <div>
          <Header userName={user.name} levelName={user.level ?? "-"} />
          <div style={{ padding: "1rem" }}>
            <h2>Practicar errores</h2>
            <p>No hay errores para practicar.</p>
            <button onClick={() => nav("/summary")}>Ir al resumen</button>
          </div>
        </div>
      );
    }

    const correctAnswer = currentWrong.answer;
    const prevAnswer = currentWrong.selected;

    // opciones simples: correcta vs respuesta anterior
    const options = shuffle(
      Array.from(new Set([correctAnswer, prevAnswer])).filter(Boolean)
    );

    return (
      <div>
        <Header userName={user.name} levelName={user.level ?? "-"} />
        <div style={{ padding: "1rem" }}>
          <h2>Practicar errores</h2>

          <p>
            <strong>
              Error {practiceIndex + 1} de {wrongItems.length}
            </strong>
          </p>

          <p>
            <strong>Ejercicio:</strong> {currentWrong.prompt}
          </p>

          <div style={{ display: "grid", gap: "0.6rem", maxWidth: "30rem" }}>
            {options.map((opt) => (
              <label key={opt} style={{ display: "flex", gap: "0.6rem" }}>
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

          <div style={{ marginTop: "1rem" }}>
            {!checked ? (
              <>
                <button
                  onClick={() => handleCheckPractice(correctAnswer)}
                  disabled={selected === null}
                >
                  Comprobar
                </button>
                <button onClick={cancelPractice} style={{ marginLeft: "1rem" }}>
                  Cancelar reintento
                </button>
              </>
            ) : (
              <>
                <p style={{ marginTop: "1rem" }}>
                  {isCorrect
                    ? " Correcto"
                    : ` Incorrecto. Respuesta correcta: ${correctAnswer}`}
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
    );
  }

  // ------ VISTA: RESUMEN DE ERRORES -------
  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: "1rem" }}>
        <h2>Repaso de errores</h2>

        <p>
          Has fallado <strong>{lastSession.wrong}</strong> de{" "}
          <strong>{lastSession.total}</strong> ejercicios.
        </p>

        <h3>Tipos de error más frecuentes</h3>
        <ul>
          {Object.entries(lastSession.errorTagsCount || {})
            .sort((a, b) => b[1] - a[1])
            .map(([tag, count]) => (
              <li key={tag}>
                <strong>{formatTag(tag)}</strong>: {count}
              </li>
            ))}
        </ul>

        <h3>Detalle de fallos</h3>
        <ul>
          {wrongItems.map((w) => (
            <li key={w.exerciseId} style={{ marginBottom: "1rem" }}>
              <div>
                <strong>Ejercicio:</strong> {w.prompt}
              </div>
              <div>
                <strong>Tu respuesta:</strong> {w.selected}
              </div>
              <div>
                <strong>Correcta:</strong> {w.answer}
              </div>
            </li>
          ))}
        </ul>

        <div style={{ marginTop: "1rem" }}>
          <button onClick={startPractice}>Practicar errores</button>
          <button onClick={() => nav("/summary")} style={{ marginLeft: "1rem" }}>
            Finalizar repaso
          </button>
        </div>
      </div>
    </div>
  );
}
