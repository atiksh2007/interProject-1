import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const inpStyle = { 
  display: "block", padding: "10px 14px", margin: "8px 0 16px", 
  width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, 
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc", 
  outline: "none", color: "#334155", fontWeight: 500,
  transition: "all 0.15s ease-in-out" 
};

const lbl = { fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.3px" };

// A modular Input element wrapper to cleanly handle border glows on focus without bloating code
const FormInput = ({ element = "input", children, ...props }) => {
  const Element = element;
  return (
    <Element
      {...props}
      style={inpStyle}
      onFocus={(e) => {
        e.target.style.background = "#fff";
        e.target.style.borderColor = "#3b6cf8";
        e.target.style.boxShadow = "0 0 0 3px rgba(59, 108, 248, 0.15)";
      }}
      onBlur={(e) => {
        e.target.style.background = "#f8fafc";
        e.target.style.borderColor = "#cbd5e1";
        e.target.style.boxShadow = "none";
      }}
    >
      {children}
    </Element>
  );
};

// Skill badge list child to maintain local hover tracking per item
const SkillBadge = ({ skill, isSelected, onToggle }) => {
  const [isHovered, setIsHovered] = useState(false);

  const getBackground = () => {
    if (isSelected) return "#eff6ff";
    if (isHovered) return "#f1f5f9";
    return "#f8fafc";
  };

  return (
    <label
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 8,
        background: getBackground(),
        border: `1px solid ${isSelected ? "#3b6cf8" : isHovered ? "#cbd5e1" : "#e2e8f0"}`,
        borderRadius: 20, padding: "6px 14px", cursor: "pointer", fontSize: 13,
        fontWeight: isSelected ? 600 : 500, color: isSelected ? "#2563eb" : "#475569",
        boxShadow: isSelected ? "0 2px 8px rgba(59, 108, 248, 0.1)" : "none",
        transform: isHovered ? "translateY(-1px)" : "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <input 
        type="checkbox" 
        checked={isSelected} 
        onChange={onToggle} 
        style={{ cursor: "pointer", accentColor: "#3b6cf8" }}
      />
      {skill.skill_name}
    </label>
  );
};

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
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>➕ Create Employee</h2>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: 32, maxWidth: 750, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.01)" }}>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
            <div>
              <label style={lbl}>User ID</label>
              <FormInput placeholder="User ID from users table" onChange={(e) => setForm({ ...form, user_id: e.target.value })} required />
            </div>
            <div>
              <label style={lbl}>Department</label>
              <FormInput element="select" onChange={(e) => setForm({ ...form, department_id: e.target.value })} required>
                <option value="">Select Department</option>
                {departments.map((d) => <option key={d.id} value={d.id}>{d.department_name}</option>)}
              </FormInput>
            </div>
            <div>
              <label style={lbl}>Designation</label>
              <FormInput placeholder="e.g. React Developer" onChange={(e) => setForm({ ...form, designation: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Phone</label>
              <FormInput placeholder="Phone number" onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Address</label>
              <FormInput placeholder="City / Address" onChange={(e) => setForm({ ...form, address: e.target.value })} />
            </div>
            <div>
              <label style={lbl}>Salary</label>
              <FormInput type="number" placeholder="e.g. 45000" onChange={(e) => setForm({ ...form, salary: e.target.value })} />
            </div>
          </div>

          <div style={{ margin: "12px 0 24px" }}>
            <label style={lbl}>Skills Matrix</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
              {allSkills.map((s) => (
                <SkillBadge 
                  key={s.id} 
                  skill={s} 
                  isSelected={selected.includes(s.id)} 
                  onToggle={() => toggle(s.id)} 
                />
              ))}
            </div>
          </div>

          <div style={{ margin: "24px 0", background: "#f8fafc", padding: "16px 20px", borderRadius: 10, border: "1px dashed #cbd5e1" }}>
            <label style={lbl}>Identification Records & Images</label>
            <input 
              type="file" 
              multiple 
              accept="image/jpeg,image/png" 
              onChange={(e) => setFiles([...e.target.files])} 
              style={{ display: "block", marginTop: 10, fontSize: 13, color: "#475569", fontWeight: 600, cursor: "pointer" }} 
            />
          </div>

          <div style={{ display: "flex", gap: 12, borderTop: "1px solid #f1f5f9", paddingTop: 24, marginTop: 12 }}>
            <Button 
              type="submit" 
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.background = "#e0f2fe";
                e.currentTarget.style.color = "#2563eb";
                e.currentTarget.style.borderColor = "#3b6cf8";
                e.currentTarget.style.boxShadow = "0 0 15px rgba(59, 108, 248, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#3b6cf8";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "transparent";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{ 
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 8, fontWeight: 700, 
                padding: "10px 24px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent" 
              }}
            >
              Create Employee
            </Button>
            
            <Button 
              variant="secondary" 
              onClick={() => nav("/employees")}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.boxShadow = "0 0 10px rgba(148, 163, 184, 0.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#f8fafc";
                e.currentTarget.style.borderColor = "#e2e8f0";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{ 
                transition: "all 0.2s ease-in-out", borderRadius: 8, fontWeight: 600, 
                padding: "10px 24px", background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" 
              }}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default CreateEmployee;