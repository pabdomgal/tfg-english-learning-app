import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";
import { downloadDiplomaPDF } from "../services/download";

const LEVELS = ["Principiante", "Intermedio", "Avanzado"];

export default function LevelDiploma() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

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

  const today = new Date().toLocaleDateString();

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />

      <div style={{ padding: 16 }}>
        <h2>Logro / Diploma</h2>

        {!completedLevel ? (
          <>
            <p>Aún no has completado ningún nivel.</p>

            <div style={{ marginTop: 12 }}>
              <button onClick={() => nav("/menu")}>Volver al menú</button>
            </div>
          </>
        ) : (
          <>
            <p>¡Enhorabuena! Has completado un nivel en la aplicación.</p>

            <div
              style={{
                marginTop: 16,
                padding: 20,
                border: "2px solid #ccc",
                borderRadius: 12,
                maxWidth: 500,
                background: "#fafafa",
              }}
            >
              <h3 style={{ marginTop: 0 }}>Diploma de finalización</h3>

              <p>
                Se certifica que <strong>{user.name}</strong> ha completado el
                nivel <strong>{completedLevel}</strong>.
              </p>

              <p>
                <strong>Fecha:</strong> {today}
              </p>
            </div>

            <div style={{ marginTop: 16 }}>
              <button
                onClick={() =>
                  downloadDiplomaPDF(user.name, completedLevel, today)
                }
              >
                Descargar diploma (PDF)
              </button>
            </div>

            <div style={{ marginTop: 12 }}>
              <button onClick={() => nav("/menu")}>Continuar</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}