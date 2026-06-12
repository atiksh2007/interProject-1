import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };
const lbl = { fontSize: 13, fontWeight: 600, color: "#475569" };

const CreateEmployee = () => {
  const [form, setForm]           = useState({ user_id: "", department_id: "", phone: "", address: "", designation: "", salary: "" });
  const [departments, setDepts]   = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selected, setSelected]   = useState([]);
  const [files, setFiles]         = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/departments").then((r) => setDepts(r.data));
    api.get("/skills").then((r) => setAllSkills(r.data));
  }, []);

  const toggle = (id) => setSelected((p) => p.includes(id) ? p.filter((s) => s !== id) : [...p, id]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const emp = await api.post("/employees", form);
      const eid = emp.data.id;

      for (const sid of selected) await api.post("/employees/skills", { employee_id: eid, skill_id: sid });

      if (files.length > 0) {
        const fd = new FormData();
        files.forEach((f) => fd.append("images", f));
        fd.append("employee_id", eid);
        await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
      }

      alert("Employee created successfully!");
      nav("/employees");
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>➕ Create Employee</h2>
      <div style={{ background: "#fff", borderRadius: 10, padding: 28, maxWidth: 700, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label style={lbl}>User ID</label>
              <input name="user_id" placeholder="User ID from users table" onChange={(e) => setForm({ ...form, user_id: e.target.value })} style={inp} required />
            </div>
            <div>
              <label style={lbl}>Department</label>
              <select name="department_id" onChange={(e) => setForm({ ...form, department_id: e.target.value })} style={inp} required>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </select>
            </div>
            <div>
              <label style={lbl}>Designation</label>
              <input placeholder="e.g. React Developer" onChange={(e) => setForm({ ...form, designation: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <input placeholder="Phone number" onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Address</label>
              <input placeholder="City / Address" onChange={(e) => setForm({ ...form, address: e.target.value })} style={inp} />
            </div>
            <div>
              <label style={lbl}>Salary</label>
              <input type="number" placeholder="e.g. 45000" onChange={(e) => setForm({ ...form, salary: e.target.value })} style={inp} />
            </div>
          </div>

          <label style={lbl}>Skills</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "8px 0 20px" }}>
            {allSkills.map((s) => (
              <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 6, background: selected.includes(s.id) ? "#eff6ff" : "#f8fafc", border: `1px solid ${selected.includes(s.id) ? "#2563eb" : "#e2e8f0"}`, borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14 }}>
                <input type="checkbox" checked={selected.includes(s.id)} onChange={() => toggle(s.id)} />
                {s.skill_name}
              </label>
            ))}
          </div>

          <label style={lbl}>Images</label>
          <input type="file" multiple accept="image/jpeg,image/png" onChange={(e) => setFiles([...e.target.files])} style={{ margin: "8px 0 20px", fontSize: 14 }} />

          <div style={{ display: "flex", gap: 10 }}>
            <Button type="submit" variant="success">Create Employee</Button>
            <Button variant="secondary" onClick={() => nav("/employees")}>Cancel</Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEmployee;