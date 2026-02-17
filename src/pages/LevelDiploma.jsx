import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser } from "../services/storage";

export default function LevelDiploma() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);

  if (!user) {
    setTimeout(() => nav("/start", { replace: true }), 0);
    return null;
  }

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: 16 }}>
        <h2>Logro / Diploma (placeholder)</h2>
        <p style={{ fontSize: 12 }}>
          Al completar un nivel, el usuario pasa automáticamente al siguiente nivel.
        </p>

        <button onClick={() => alert("Más adelante generaremos el PDF aquí")}>
          Descargar diploma (PDF)
        </button>

        <div style={{ marginTop: 12 }}>
          <button onClick={() => nav("/menu")}>Continuar</button>
        </div>
      </div>
    </div>
  );
}
