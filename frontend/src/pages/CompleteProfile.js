import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };
const lbl = { fontSize: 13, fontWeight: 600, color: "#475569" };

const CompleteProfile = () => {
  const [form, setForm]         = useState({ department_id: "", phone: "", address: "", designation: "", salary: "" });
  const [departments, setDepts] = useState([]);
  const nav = useNavigate();

  useEffect(() => { api.get("/departments").then((r) => setDepts(r.data)); }, []);

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/employees/me", form);
      alert("Profile created successfully!");
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating profile");
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Segoe UI', sans-serif" }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 36, width: 440, boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
        <h2 style={{ margin: "0 0 8px", color: "#1e293b" }}>Complete Your Profile</h2>
        <p style={{ color: "#64748b", marginBottom: 24, fontSize: 14 }}>Please fill in your details to continue</p>
        <form onSubmit={submit}>
          <label style={lbl}>Department</label>
          <select name="department_id" onChange={handle} style={inp} required>
            <option value="">Select Department</option>
            {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
          </select>
          <label style={lbl}>Designation</label>
          <input name="designation" placeholder="e.g. React Developer" onChange={handle} style={inp} />
          <label style={lbl}>Phone</label>
          <input name="phone" placeholder="e.g. 9876543210" onChange={handle} style={inp} />
          <label style={lbl}>Address</label>
          <input name="address" placeholder="City / Address" onChange={handle} style={inp} />
          <label style={lbl}>Salary</label>
          <input name="salary" type="number" placeholder="e.g. 45000" onChange={handle} style={inp} />
          <button type="submit" style={{ width: "100%", padding: "12px 0", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, fontSize: 15, fontWeight: 600, cursor: "pointer" }}>
            Save Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompleteProfile;