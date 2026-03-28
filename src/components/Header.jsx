export default function Header({ userName = "-", levelName = "-" }) {
  return (
    <div
      style={{
        background: "#ffffff",
        border: "1px solid #d9e1f0",
        borderRadius: "16px",
        boxShadow: "0 10px 30px rgba(31, 42, 68, 0.08)",
        padding: "1rem 1.25rem",
        marginBottom: "1.5rem",
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "0.75rem",
      }}
    >
      <div
        style={{
          fontWeight: 800,
          fontSize: "1.2rem",
          color: "#16325c",
          letterSpacing: "-0.02em",
        }}
      >
        APP INGLÉS
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.75rem",
          alignItems: "center",
        }}
      >
        <span
          style={{
            background: "#f8fafc",
            border: "1px solid #d9e1f0",
            borderRadius: "999px",
            padding: "0.45rem 0.8rem",
            color: "#1f2a44",
            fontWeight: 500,
          }}
        >
          <strong>Usuario:</strong> {userName}
        </span>

        <span
          style={{
            background: "#eef3ff",
            border: "1px solid #bfd0f5",
            borderRadius: "999px",
            padding: "0.45rem 0.8rem",
            color: "#16325c",
            fontWeight: 600,
          }}
        >
          <strong>Nivel:</strong> {levelName}
        </span>
      </div>
    </div>
  );
}