import { useState } from "react";

const Card = ({ title, value, color }) => {
  const [hover, setHover] = useState(false);

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        flex: 1,
        minWidth: 220,
        background: hover ? "#f8fbff" : "#ffffff", // blue tint background
        borderRadius: 16,
        padding: 24,
        boxShadow: hover
          ? "0 15px 35px rgba(59,108,248,0.18)"
          : "0 10px 25px rgba(59,108,248,0.08)",
        border: "1px solid #dbeafe",
        position: "relative",
        overflow: "hidden",
        transform: hover ? "scale(1.01)" : "scale(1)",
        transition: "all 0.25s ease",
      }}
    >
      {/* top color bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: 4,
          background: color,
        }}
      />

      <p
        style={{
          margin: 0,
          color: "#64748b",
          fontSize: 13,
          fontWeight: 500,
        }}
      >
        {title}
      </p>

      <h2
        style={{
          marginTop: 14,
          marginBottom: 0,
          color: "#0f172a",
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {value ?? 0}
      </h2>
    </div>
  );
};

export default Card;