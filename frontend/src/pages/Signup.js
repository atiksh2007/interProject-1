import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

const inp = {
  display: "block",
  padding: "10px 14px",
  margin: "10px 0",
  width: "100%",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  fontSize: 14,
  boxSizing: "border-box",
  background: "#f8fafc"
};

const Signup = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "employee"
  });

  const nav = useNavigate();

  const handle = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();

    // ✅ frontend validation
    if (form.password !== form.confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      await api.post("/auth/signup", {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role
      });

      alert("Signup successful! You can now login.");
      nav("/");
    } catch (err) {
      alert(err.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Segoe UI', sans-serif"
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 12,
          padding: 36,
          width: 380,
          boxShadow: "0 20px 60px rgba(0,0,0,0.4)"
        }}
      >
        <h2 style={{ margin: "0 0 24px", color: "#1e293b", textAlign: "center" }}>
          Create Account
        </h2>

        <form onSubmit={submit}>
          <input
            name="name"
            placeholder="Full Name"
            onChange={handle}
            style={inp}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handle}
            style={inp}
            required
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handle}
            style={inp}
            required
          />

          {/* ✅ Confirm Password */}
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handle}
            style={inp}
            required
          />

          <select name="role" onChange={handle} style={inp}>
            <option value="employee">Employee</option>
            <option value="manager">Manager</option>
            <option value="hr">HR</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            style={{
              width: "100%",
              padding: "12px 0",
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
              marginTop: 8
            }}
          >
            Register
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 16,
            fontSize: 13,
            color: "#64748b"
          }}
        >
          Already have an account?{" "}
          <Link to="/" style={{ color: "#2563eb" }}>
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;