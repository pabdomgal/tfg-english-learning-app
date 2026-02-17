import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import { getActiveUser, addUser } from "../services/storage";

export default function WelcomeCreateUser() {
  const nav = useNavigate();
  const { user } = useMemo(() => getActiveUser(), []);
  const [name, setName] = useState("");

  // Si ya hay usuario activo: directo
  if (user) {
    setTimeout(() => nav(user.level ? "/menu" : "/level", { replace: true }), 0);
    return null;
  }

  function handleCreate() {
    const clean = name.trim();
    if (!clean) return;
    const { user: newUser } = addUser(clean);
    nav(newUser.level ? "/menu" : "/level", { replace: true });
  }

  return (
    <div>
      <Header />
      <div style={{ padding: 16 }}>
        <h2>Bienvenido</h2>
        <p>Crea un usuario para comenzar.</p>

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
        </div>
      </div>
    </div>
  );
}
