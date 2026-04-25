import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, addUser } from "../services/storage";

export default function WelcomeCreateUser() {
  const nav = useNavigate();
  const location = useLocation();

  const { user } = useMemo(() => getActiveUser(), []);
  const [name, setName] = useState("");

  const isForcedStart = location.pathname === "/start";

  useEffect(() => {
    if (!isForcedStart && user) {
      nav(user.level ? "/menu" : "/level", { replace: true });
    }
  }, [isForcedStart, user, nav]);

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

      <div style={{ padding: "1rem" }}>
        <div
          style={{
            maxWidth: "680px",
            margin: "0 auto",
            background: "#ffffff",
            border: "1px solid #d9e1f0",
            borderRadius: "16px",
            boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
            padding: "1.75rem",
          }}
        >
          <div style={{ marginBottom: "1.5rem" }}>
            <h2 style={{ marginBottom: "0.5rem" }}>Bienvenido</h2>

            {isForcedStart && user ? (
              <p style={{ color: "#5b6780", margin: 0 }}>
                Ya existe un usuario activo. Puedes crear otro nuevo si quieres.
              </p>
            ) : (
              <p style={{ color: "#5b6780", margin: 0 }}>
                Crea un usuario para comenzar a utilizar la aplicación.
              </p>
            )}
          </div>

          <div
            style={{
              background: "#f8fbff",
              border: "1px solid #d9e1f0",
              borderRadius: "16px",
              padding: "1.25rem",
            }}
          >
            <label
              htmlFor="user-name"
              style={{
                display: "block",
                fontWeight: 600,
                color: "#16325c",
                marginBottom: "0.6rem",
              }}
            >
              Nombre del usuario
            </label>

            <input
              id="user-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Escribe tu nombre"
              style={{
                width: "100%",
                maxWidth: "420px",
                backgroundColor: "#fff",
                marginBottom: "1rem",
              }}
            />

            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
              <button onClick={handleCreate}>Crear usuario</button>

              {user && (
                <button onClick={() => nav(user.level ? "/menu" : "/level")}>
                  Volver
                </button>
              )}
            </div>
          </div>

          <div
            style={{
              marginTop: "1.25rem",
              padding: "1rem",
              background: "#f8fafc",
              border: "1px solid #d9e1f0",
              borderRadius: "14px",
            }}
          >
            <p style={{ margin: 0, color: "#5b6780", fontSize: "0.95rem" }}>
              El progreso del usuario se guardará localmente en el navegador para
              poder continuar en futuras sesiones.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}