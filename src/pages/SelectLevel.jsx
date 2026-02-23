import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, setUserLevel } from "../services/storage";

export default function SelectLevel() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const [level, setLevel] = useState("Principiante");

  useEffect(() => {
    if (!user) {
      nav("/start", { replace: true });
      return;
    }
    if (user.level) {
      nav("/menu", { replace: true });
    }
  }, [user, nav]);

  if (!user || user.level) return null;

  function handleConfirm() {
    setUserLevel(level);
    nav("/menu", { replace: true });
  }

  return (
    <div>
      <Header userName={user.name} levelName={user.level ?? "-"} />
      <div style={{ padding: 16 }}>
        <h2>Selecciona tu nivel inicial</h2>

        <div>
          <label>
            <input
              type="radio"
              checked={level === "Principiante"}
              onChange={() => setLevel("Principiante")}
            />
            Principiante
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              checked={level === "Intermedio"}
              onChange={() => setLevel("Intermedio")}
            />
            Intermedio
          </label>
        </div>

        <div>
          <label>
            <input
              type="radio"
              checked={level === "Avanzado"}
              onChange={() => setLevel("Avanzado")}
            />
            Avanzado
          </label>
        </div>

        <div style={{ marginTop: 12 }}>
          <button onClick={handleConfirm}>Confirmar nivel</button>
        </div>
      </div>
    </div>
  );
}