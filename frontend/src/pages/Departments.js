import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import api from "../api";

const inp = { padding: "10px 14px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#f8fafc", width: 280 };

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
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>🏢 Departments</h2>
      <form onSubmit={add} style={{ display: "flex", gap: 10, marginBottom: 24, background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <input placeholder="Department Name" value={name} onChange={(e) => setName(e.target.value)} style={inp} required />
        <Button type="submit" variant="success">Add Department</Button>
      </form>
      <Table
        columns={[{ key: "id", label: "#" }, { key: "department_name", label: "Department Name" }]}
        rows={departments}
        actions={(r) => <Button variant="danger" onClick={() => del(r.id)}>Delete</Button>}
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
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>🎯 Skills</h2>
      <form onSubmit={add} style={{ display: "flex", gap: 10, marginBottom: 24, background: "#fff", padding: 20, borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <input placeholder="Skill Name" value={name} onChange={(e) => setName(e.target.value)} style={inp} required />
        <Button type="submit" variant="success">Add Skill</Button>
      </form>
      <Table
        columns={[{ key: "id", label: "#" }, { key: "skill_name", label: "Skill Name" }]}
        rows={skills}
        actions={(r) => <Button variant="danger" onClick={() => del(r.id)}>Delete</Button>}
      />
    </Layout>
  );
};

export default Departments;