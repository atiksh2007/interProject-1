import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";

function Login() {
  const [role, setRole] = useState(null);
  const [form, setForm] = useState({ email: "", password: "" });
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/login", form);
      const { token, role: userRole, userId, name } = res.data;

  
      if (userRole !== role) {
        return alert(`This account is not registered as ${role}`);
      }

      localStorage.setItem("token", token);
      localStorage.setItem("role", userRole);
      localStorage.setItem("userId", userId);
      localStorage.setItem("name", name);

      if (userRole === "employee") {
        const profileRes = await api.get("/employees");
        if (profileRes.data.length === 0) {
          navigate("/complete-profile");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  if (!role) {
    return (
      <div>
        <h2>Login As</h2>
        <button onClick={() => setRole("admin")}>Admin</button>
        &nbsp;
        <button onClick={() => setRole("employee")}>Employee</button>
      </div>
    );
  }

  return (
    <div>
      <h2>Login — {role === "admin" ? "Admin" : "Employee"}</h2>
      <button onClick={() => setRole(null)}>← Back</button>

      <form onSubmit={handleSubmit}>
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />
        <button type="submit">Login</button>
      </form>

      <p><Link to="/forgot">Forgot Password?</Link></p>
      <p>Don't have an account? <Link to="/signup">Signup</Link></p>
    </div>
  );
}

export default Login;