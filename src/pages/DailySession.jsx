import { useMemo, useState } from "react";
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
  const [checked, setChecked] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  // Guardado seguro del último resultado (por si setState aún no se reflejó)
  const [lastResult, setLastResult] = useState(null);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  // Obtenemos el índice de la lección desde el usuario (si no existe, 0)
  const lessonIndex = user.lessonIndexByLevel?.[user.level] ?? 0;

  // La lección actual la decide el motor
  const lesson = getCurrentLesson(user.level, lessonIndex);

  // Los ejercicios diarios los decide el motor (limitados)
  const levelSessions = user.levelProgress?.[user.level]?.sessions ?? 0;
  const exercises = buildDailySession(user.level, lessonIndex, 5, levelSessions);
  const exercise = exercises[currentIndex] ?? null;

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
    setChecked(false);
    setIsCorrect(null);
  }

  function handleCheck() {
    if (!exercise || selected === null) return;

    const ok = selected === exercise.answer;
    setChecked(true);
    setIsCorrect(ok);

    const result = {
      exerciseId: exercise.id,
      prompt: exercise.prompt,
      answer: exercise.answer,
      selected,
      isCorrect: ok,
      tags: exercise.tags ?? [],
    };

    // guardamos el último resultado de forma “segura”
    setLastResult(result);

    // Evitar duplicados: reemplaza si ya existía ese exerciseId
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
      // Fin de la sesión: construimos resultados finales “seguros”
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

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: "1rem" }}>
        <h2>Lección diaria</h2>

        {/* mostrar qué lección es */}
        {lesson && (
          <p style={{ marginTop: "0.25rem" }}>
            <strong>Lección actual:</strong> {lesson.title} ({lesson.id})
          </p>
        )}

        {!lesson ? (
          <>
            <p>No hay lecciones cargadas para este nivel todavía.</p>
            <button onClick={() => nav("/menu")}>Volver</button>
          </>
        ) : phase === "vocab" ? (
          <>
            <h3>Introducción de vocabulario</h3>
            <p>Repasa las palabras clave que aparecerán en la lección.</p>

            <ul>
              {lesson.vocab.map((v) => (
                <li key={v.word}>
                  <strong>{v.word}</strong> — {v.meaning}
                </li>
              ))}
            </ul>

            <button onClick={goToExercise}>Comenzar ejercicios</button>
            <button onClick={handleCancel} style={{ marginLeft: "1rem" }}>
              Cancelar sesión
            </button>
          </>
        ) : (
          <>
            {!exercise ? (
              <>
                <p>No hay ejercicios definidos para esta lección.</p>
                <button onClick={() => nav("/menu")}>Volver</button>
              </>
            ) : (
              <>
                <p>
                  <strong>
                    Ejercicio {currentIndex + 1} de {exercises.length}
                  </strong>
                </p>

                <p>{exercise.prompt}</p>

                <div style={{ display: "grid", gap: "0.6rem", maxWidth: "30rem" }}>
                  {exercise.options.map((opt) => (
                    <label key={opt} style={{ display: "flex", gap: "0.6rem" }}>
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

                <div style={{ marginTop: "1rem" }}>
                  {!checked ? (
                    <>
                      <button onClick={handleCheck} disabled={selected === null}>
                        Comprobar
                      </button>
                      <button onClick={handleCancel} style={{ marginLeft: "1rem" }}>
                        Cancelar sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <p>
                        {isCorrect
                          ? " Correcto"
                          : ` Incorrecto. Respuesta correcta: ${exercise.answer}`}
                      </p>
                      <button onClick={handleNext}>
                        {currentIndex + 1 < exercises.length
                          ? "Siguiente ejercicio"
                          : "Finalizar sesión"}
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}