export default function Header({ userName = "-", levelName = "-" }) {
  return (
    <div style={{ padding: "12px", borderBottom: "1px solid #ddd" }}>
      <strong>APP INGLÉS</strong>
      <span style={{ marginLeft: "12px" }}>Usuario: {userName}</span>
      <span style={{ marginLeft: "12px" }}>Nivel: {levelName}</span>
    </div>
  );
}
