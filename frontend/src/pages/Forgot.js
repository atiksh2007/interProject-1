import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

const card = { minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" };
const box  = { background: "#fff", borderRadius: 12, padding: 36, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" };
const inp  = { display: "block", padding: "10px 14px", margin: "10px 0", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };
const btn  = { width: "100%", padding: "12px 0", background: "#2563eb", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer", marginTop: 8 };

export const Forgot = () => {
  const [email, setEmail] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const r = await api.post("/auth/forgot-password", { email });
      alert(r.data.message);
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    }
  };
  return (
    <div style={card}>
      <div style={box}>
        <h2 style={{ margin: "0 0 8px", color: "#1e293b", textAlign: "center" }}>Forgot Password</h2>
        <p style={{ color: "#64748b", textAlign: "center", marginBottom: 24, fontSize: 14 }}>Enter your email to receive a reset link</p>
        <form onSubmit={submit}>
          <input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} style={inp} required />
          <button type="submit" style={btn}>Send Reset Link</button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13 }}><Link to="/" style={{ color: "#2563eb" }}>Back to Login</Link></p>
      </div>
    </div>
  );
};

export default Forgot;