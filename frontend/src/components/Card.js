const Card = ({ title, value, color = "#2563eb" }) => (
  <div style={{
    background: "#fff",
    padding: "20px 24px",
    borderRadius: 10,
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    minWidth: 160,
    borderLeft: `5px solid ${color}`,
    flex: "1 1 160px",
  }}>
    <p style={{ margin: 0, color: "#64748b", fontSize: 13, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>{title}</p>
    <p style={{ fontSize: 32, fontWeight: 700, margin: "6px 0 0 0", color }}>{value ?? "-"}</p>
  </div>
);

export default Card;