import { useEffect, useState } from "react";
import api from "../api";
import Layout from "../components/Layout";
// Inline functional style definitions matching your application ecosystem
const inpStyle = {
  padding: "10px 14px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  background: "#f8fafc",
  color: "#334155",
  fontWeight: 500,
  width: "240px",
  transition: "all 0.15s ease-in-out"
};

// Skill Badge item template to isolate local tracking loops cleanly
const InteractiveSkillBadge = ({ skill, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        background: isHovered ? "#fff5f5" : "#f0f7ff",
        color: isHovered ? "#e11d48" : "#2563eb",
        border: `1px solid ${isHovered ? "#fecdd3" : "#e0f2fe"}`,
        padding: "6px 14px",
        borderRadius: 20,
        fontSize: 13,
        fontWeight: 600,
        boxShadow: isHovered ? "0 4px 12px rgba(225, 29, 72, 0.08)" : "none",
        transform: isHovered ? "translateY(-1px)" : "none",
        transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
      }}
    >
      <span>{skill.skill_name}</span>
      <button
        onClick={() => onDelete(skill.id)}
        style={{
          background: "none",
          border: "none",
          color: isHovered ? "#be123c" : "#60a5fa",
          cursor: "pointer",
          fontSize: 16,
          lineHeight: 1,
          padding: "0 2px",
          fontWeight: 700,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "color 0.15s ease"
        }}
        title="Delete skill"
      >
        ×
      </button>
    </div>
  );
};

function Skills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  const fetchSkills = () =>
    api.get("/skills").then((r) => setSkills(r.data));

  useEffect(() => { fetchSkills(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/skills", { skill_name: name });
      setName("");
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await api.delete(`/skills/${id}`);
      fetchSkills();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <Layout>
    <div style={{ fontFamily: "system-ui, sans-serif", padding: "4px 0" }}>
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>🎯 Skills Matrix</h2>
      </div>

      {/* ── Input Creation Form ── */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", marginBottom: 28, maxWidth: 600 }}>
        <form onSubmit={handleAdd} style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <input
            placeholder="Enter skill name (e.g., Python)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
          />
          <button 
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
              transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 8, fontSize: 14, cursor: "pointer",
              fontWeight: 700, padding: "10px 24px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent" 
            }}
          >
            Add Skill
          </button>
        </form>
      </div>

      {/* ── Skills Grid View ── */}
      <div style={{ background: "#fff", borderRadius: 12, padding: 28, border: "1px solid #e2e8f0", maxWidth: 800 }}>
        <h4 style={{ margin: "0 0 16px", color: "#475569", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
          Active System Skills ({skills.length})
        </h4>
        
        {skills.length === 0 ? (
          <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>No skills have been registered into the database yet.</p>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {skills.map((s) => (
              <InteractiveSkillBadge 
                key={s.id} 
                skill={s} 
                onDelete={handleDelete} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
    </Layout>
  );
}

export default Skills;