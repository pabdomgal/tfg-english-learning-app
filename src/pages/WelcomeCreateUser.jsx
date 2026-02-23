import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, addUser } from "../services/storage";

export default function WelcomeCreateUser() {
  const nav = useNavigate();
  const location = useLocation();

  const { user } = useMemo(() => getActiveUser(), []);
  const [name, setName] = useState("");

  // Si estás en /start, NO redirigimos automáticamente (pantalla forzada)
  const isForcedStart = location.pathname === "/start";

  // Redirección segura solo para la ruta "/"
  useEffect(() => {
    if (!isForcedStart && user) {
      nav(user.level ? "/menu" : "/level", { replace: true });
    }
  }, [isForcedStart, user, nav]);

  // Si estamos en "/" y hay usuario, mientras redirige no pintamos nada
  if (!isForcedStart && user) return null;

  function handleCreate() {
    const clean = name.trim();
    if (!clean) return;
    const { user: newUser } = addUser(clean);
    nav(newUser.level ? "/menu" : "/level", { replace: true });
  }

  return (
    <div>
      <Header userName={user?.name} levelName={user?.level ?? "-"} />
      <div style={{ padding: 16 }}>
        <h2>Bienvenido</h2>

        {/* Si hay usuario y estamos en /start, mostramos aviso */}
        {isForcedStart && user ? (
          <p>
            Ya existe un usuario activo. Puedes crear otro nuevo si quieres.
          </p>
        ) : (
          <p>Crea un usuario para comenzar.</p>
        )}

        <label>
          Nombre:
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ marginLeft: 8 }}
          />
        </label>

        <div style={{ marginTop: 12 }}>
          <button onClick={handleCreate}>Crear usuario</button>
          {user && (
            <button
              style={{ marginLeft: 12 }}
              onClick={() => nav(user.level ? "/menu" : "/level")}
            >
              Volver
            </button>
          )}
        </div>
      </div>
    </div>
  );
}