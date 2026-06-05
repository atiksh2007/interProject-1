const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(15,23,42,0.6)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 1000,
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 10,
        padding: 28,
        minWidth: 420,
        maxWidth: 620,
        width: "90%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
          <h3 style={{ margin: 0, color: "#1e293b", fontSize: 18 }}>{title}</h3>
          <button onClick={onClose} style={{
            border: "none", background: "#f1f5f9",
            borderRadius: 6, width: 30, height: 30,
            fontSize: 18, cursor: "pointer", color: "#64748b",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ color: "#334155" }}>{children}</div>

        {/* Footer */}
        {footer && (
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #e2e8f0", display: "flex", justifyContent: "flex-end", gap: 8 }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;