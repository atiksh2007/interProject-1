const colors = {
  primary: { bg: "#2563eb", color: "#fff" },
  success:{ bg: "#16a34a", color: "#fff" },
  danger: { bg: "#dc2626", color: "#fff" },
  warning:{ bg: "#d97706", color: "#fff" },
  secondary:{ bg: "#475569", color: "#fff" },
};

const Button = ({ children, variant = "primary", onClick, type = "button", disabled, style = {} }) => {
  const { bg, color } = colors[variant] || colors.primary;
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{
        background: bg,
        color,
        border: "none",
        padding: "8px 18px",
        borderRadius: 6,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
        fontWeight: 500,
        fontSize: 14,
        transition: "opacity 0.2s",
        ...style,
      }}
    >
      {children}
    </button>
  );
};

export default Button;