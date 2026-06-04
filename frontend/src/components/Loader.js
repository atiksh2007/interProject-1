const Loader = () => (
  <div style={{ textAlign: "center", padding: 40 }}>
    <div style={{
      border: "4px solid #e2e8f0",
      borderTop: "4px solid #2563eb",
      borderRadius: "50%",
      width: 44,
      height: 44,
      animation: "spin 0.8s linear infinite",
      margin: "0 auto",
    }} />
    <style>{`@keyframes spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }`}</style>
    <p style={{ color: "#64748b", marginTop: 12 }}>Loading...</p>
  </div>
);

export default Loader;