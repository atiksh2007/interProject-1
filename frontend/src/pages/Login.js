import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const roleColors = {
  admin:    "#7c3aed",
  manager:  "#2563eb",
  hr:       "#0891b2",
  employee: "#16a34a",
};

const Login = () => {
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const { login } = useAuth();

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await api.post("/auth/login", form);
      const { token, role: ur, userId, name } = r.data;

      if (ur !== role) return alert(`This account is not registered as ${role}`);

      login({ token, role: ur, userId, name });

      if (ur === "employee") {
        const p = await api.get("/employees");
        nav(p.data.length === 0 ? "/complete-profile" : "/dashboard");
      } else {
        nav("/dashboard");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const inp = {
    display: "block", padding: "10px 14px", margin: "10px 0",
    width: "100%", border: "1px solid #e2e8f0", borderRadius: 8,
    fontSize: 14, boxSizing: "border-box", outline: "none",
    background: "#f8fafc",
  };

  // Step 1 — Role selection
  if (!role) return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <h1 style={{ color: "#fff", fontSize: 28, marginBottom: 8 }}>i-SOFTZONE HRMS</h1>
        <p style={{ color: "#94a3b8", marginBottom: 40 }}>Select your role to continue</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          {["admin", "manager", "hr", "employee"].map((r) => (
            <button key={r} onClick={() => setRole(r)} style={{
              padding: "20px 32px", background: roleColors[r],
              color: "#fff", border: "none", borderRadius: 10,
              cursor: "pointer", fontSize: 16, fontWeight: 600,
              textTransform: "capitalize", minWidth: 130,
              boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
              transition: "transform 0.1s",
            }}>
              {r === "admin" ? "🛡️" : r === "manager" ? "👔" : r === "hr" ? "💼" : "👤"} {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  // Step 2 — Login form
  return (
    <div style={{ minHeight: "100vh", background: "#0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 380, boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
        <button onClick={() => setRole(null)} style={{ border: "none", background: "none", color: "#64748b", cursor: "pointer", marginBottom: 16, fontSize: 14 }}>← Back</button>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ background: roleColors[role], borderRadius: "50%", width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 12px" }}>
            {role === "admin" ? "🛡️" : role === "manager" ? "👔" : role === "hr" ? "💼" : "👤"}
          </div>
          <h2 style={{ margin: 0, color: "#1e293b", textTransform: "capitalize" }}>Login as {role}</h2>
        </div>
        <form onSubmit={submit}>
          <input name="email" placeholder="Email address" onChange={handle} style={inp} required />
          <input name="password" type="password" placeholder="Password" onChange={handle} style={inp} required />
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "12px 0", background: roleColors[role],
            color: "#fff", border: "none", borderRadius: 8,
            fontSize: 15, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer",
            marginTop: 8, opacity: loading ? 0.7 : 1,
          }}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 16, fontSize: 13, color: "#64748b" }}>
          <Link to="/forgot" style={{ color: "#2563eb" }}>Forgot Password?</Link>
          {" · "}
          <Link to="/signup" style={{ color: "#2563eb" }}>Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;