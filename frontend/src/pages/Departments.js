import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import api from "../api";

const inpBaseStyle = { 
  padding: "10px 14px", 
  border: "1px solid #cbd5e1", 
  borderRadius: 8, 
  fontSize: 14, 
  background: "#f8fafc", 
  width: 300,
  outline: "none",
  color: "#334155",
  fontWeight: 500,
  transition: "all 0.15s ease-in-out"
};

// Modular Form Input to cleanly append animated glow on focus states
const AnimatedFormInput = (props) => (
  <input
    {...props}
    style={inpBaseStyle}
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
);

export const Departments = () => {
  const [departments, setDepts] = useState([]);
  const [name, setName]         = useState("");

  const fetch = () => api.get("/departments").then((r) => setDepts(r.data));
  useEffect(() => { fetch(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try { await api.post("/departments", { department_name: name }); setName(""); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try { await api.delete(`/departments/${id}`); fetch(); }
    catch { alert("Delete failed — may have employees assigned"); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>🏢 Departments</h2>
      </div>

      <form onSubmit={add} style={{ 
        display: "flex", gap: 12, marginBottom: 28, background: "#fff", padding: 24, 
        borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", alignItems: "center" 
      }}>
        <AnimatedFormInput placeholder="Department Name (e.g., Engineering)" value={name} onChange={(e) => setName(e.target.value)} required />
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
            padding: "10px 22px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent"
          }}
        >
          Add Department
        </Button>
      </form>

      <Table
        columns={[
          { key: "serial_no", label: "#" }, 
          { key: "department_name", label: "Department Name", render: (r) => <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.department_name}</span> }
        ]}
        rows={departments.map((d, index) => ({ ...d, serial_no: index + 1 }))}
        actions={(r) => (
          <Button 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(220, 38, 38, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "#fee2e2";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => del(r.id)}
            style={{
              transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
              fontSize: 13, padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2"
            }}
          >
            Delete
          </Button>
        )}
      />
    </Layout>
  );
};

export const Skills = () => {
  const [skills, setSkills] = useState([]);
  const [name, setName]     = useState("");

  const fetch = () => api.get("/skills").then((r) => setSkills(r.data));
  useEffect(() => { fetch(); }, []);

  const add = async (e) => {
    e.preventDefault();
    try { await api.post("/skills", { skill_name: name }); setName(""); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const del = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try { await api.delete(`/skills/${id}`); fetch(); }
    catch { alert("Delete failed"); }
  };

  return (
    <Layout>
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>🎯 Skills</h2>
      </div>

      <form onSubmit={add} style={{ 
        display: "flex", gap: 12, marginBottom: 28, background: "#fff", padding: 24, 
        borderRadius: 12, border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", alignItems: "center" 
      }}>
        <AnimatedFormInput placeholder="Skill Name (e.g., Typescript)" value={name} onChange={(e) => setName(e.target.value)} required />
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
            padding: "10px 22px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent"
          }}
        >
          Add Skill
        </Button>
      </form>

      <Table
        columns={[
          { key: "serial_no", label: "#" }, 
          { key: "skill_name", label: "Skill Name", render: (r) => <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.skill_name}</span> }
        ]}
        rows={skills.map((s, index) => ({ ...s, serial_no: index + 1 }))}
        actions={(r) => (
          <Button 
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.03)";
              e.currentTarget.style.background = "#fee2e2";
              e.currentTarget.style.color = "#dc2626";
              e.currentTarget.style.borderColor = "#fca5a5";
              e.currentTarget.style.boxShadow = "0 0 12px rgba(220, 38, 38, 0.3)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.background = "#fef2f2";
              e.currentTarget.style.color = "#ef4444";
              e.currentTarget.style.borderColor = "#fee2e2";
              e.currentTarget.style.boxShadow = "none";
            }}
            onClick={() => del(r.id)}
            style={{
              transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
              fontSize: 13, padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2"
            }}
          >
            Delete
          </Button>
        )}
      />
    </Layout>
  );
};

export default Departments;