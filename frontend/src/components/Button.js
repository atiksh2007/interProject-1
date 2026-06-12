import { useState } from "react";

const variantThemes = {
  primary:   { normal: { bg: "#3b6cf8", color: "#fff", border: "transparent" }, hover: { bg: "#2557df", border: "transparent", shadow: "0 4px 12px rgba(59, 108, 248, 0.25)" } },
  success:   { normal: { bg: "#16a34a", color: "#fff", border: "transparent" }, hover: { bg: "#11813a", border: "transparent", shadow: "0 4px 12px rgba(22, 163, 74, 0.25)" } },
  danger:    { normal: { bg: "#fef2f2", color: "#ef4444", border: "#fee2e2" },   hover: { bg: "#fee2e2", border: "#fca5a5", shadow: "0 4px 12px rgba(239, 68, 68, 0.15)" } },
  warning:   { normal: { bg: "#f1f5f9", color: "#f97316", border: "#cbd5e1" },   hover: { bg: "#fff7ed", border: "#fed7aa", shadow: "0 4px 12px rgba(249, 115, 22, 0.15)" } },
  secondary: { normal: { bg: "#f8fafc", color: "#475569", border: "#cbd5e1" },   hover: { bg: "#f1f5f9", border: "#94a3b8", shadow: "0 4px 12px rgba(71, 85, 105, 0.1)" } },
};

const Button = ({ 
  children, 
  variant = "primary", 
  onClick, 
  type = "button", 
  disabled, 
  style = {},
  onMouseEnter,
  onMouseLeave,
  ...props 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const theme = variantThemes[variant] || variantThemes.primary;

  const handleMouseEnter = (e) => {
    setIsHovered(true);
    if (onMouseEnter) onMouseEnter(e);
  };

  const handleMouseLeave = (e) => {
    setIsHovered(false);
    if (onMouseLeave) onMouseLeave(e);
  };

  const dynamicStyles = disabled
    ? {
        background: theme.normal.bg,
        color: theme.normal.color,
        borderColor: theme.normal.border,
        boxShadow: "none",
        transform: "none",
      }
    : isHovered
    ? {
        background: theme.hover.bg,
        color: theme.hover.color || theme.normal.color,
        borderColor: theme.hover.border,
        boxShadow: theme.hover.shadow,
        transform: "translateY(-1px)",
      }
    : {
        background: theme.normal.bg,
        color: theme.normal.color,
        borderColor: theme.normal.border,
        boxShadow: "none",
        transform: "none",
      };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid transparent",
        padding: "8px 18px",
        borderRadius: 8, // Modern curved rounding match
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        fontWeight: 700, // Premium bold emphasis
        fontSize: 13,
        letterSpacing: "0.2px",
        boxSizing: "border-box",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        outline: "none",
        ...dynamicStyles,
        ...style, // Prioritizes hardcoded styles from parent layout sheets
      }}
    >
      {children}
    </button>
  );
};

export default Button;