const Modal = ({ open, title, onClose, children, footer }) => {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", 
      inset: 0,
      background: "rgba(15, 23, 42, 0.45)",
      backdropFilter: "blur(6px)", // Premium background layer separation blur
      WebkitBackdropFilter: "blur(6px)",
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center",
      zIndex: 1000,
      animation: "fadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 16, // Clean modern border smoothing match
        padding: 32,
        minWidth: 440,
        maxWidth: 640,
        width: "92%",
        boxShadow: "0 25px 50px -12px rgba(15, 23, 42, 0.25)",
        border: "1px solid rgba(226, 232, 240, 0.8)",
        boxSizing: "border-box"
      }}>
        {/* Header Block Section */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
          <h3 style={{ 
            margin: 0, 
            color: "#0f172a", 
            fontSize: 20, 
            fontWeight: 800, 
            letterSpacing: "-0.5px" 
          }}>
            {title}
          </h3>
          <button 
            onClick={onClose} 
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.transform = "scale(1.08)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#f1f5f9";
              e.currentTarget.style.color = "#64748b";
              e.currentTarget.style.transform = "scale(1)";
            }}
            style={{
              border: "none", 
              background: "#f1f5f9",
              borderRadius: "50%", // Rounded layout close circle button
              width: 32, 
              height: 32,
              fontSize: 20, 
              lineHeight: 0,
              cursor: "pointer", 
              color: "#64748b",
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center",
              transition: "all 0.15s cubic-bezier(0.16, 1, 0.3, 1)",
              outline: "none"
            }}
          >
            &times;
          </button>
        </div>

        {/* Core Body Container Frame */}
        <div style={{ 
          color: "#334155",
          fontSize: 14,
          lineHeight: 1.6,
          fontWeight: 500
        }}>
          {children}
        </div>

        {/* Action Panel Footer Wrapper Layout */}
        {footer && (
          <div style={{ 
            marginTop: 24, 
            paddingTop: 20, 
            borderTop: "1px solid #e2e8f0", 
            display: "flex", 
            justifyContent: "flex-end", 
            gap: 12,
            alignItems: "center"
          }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;