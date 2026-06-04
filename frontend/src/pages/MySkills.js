import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const MySkills = () => {
  const [skills, setSkills] = useState([]);

  const fetch = async () => {
    try { setSkills((await api.get("/employees/me/skills")).data); }
    catch (err) { console.log(err); }
  };

  useEffect(() => { fetch(); }, []);

  const add    = async (id) => { try { await api.post("/employees/me/skills",   { skill_id: id }); fetch(); } catch (e) { alert(e.response?.data?.message); } };
  const remove = async (id) => { try { await api.delete(`/employees/me/skills/${id}`); fetch(); } catch { alert("Error"); } };

  const assigned  = skills.filter((s) => s.assigned);
  const available = skills.filter((s) => !s.assigned);

  const pill = (s, action, variant) => (
    <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 14px", marginBottom: 8 }}>
      <span style={{ color: "#1e293b", fontWeight: 500 }}>{s.skill_name}</span>
      <Button variant={variant} onClick={() => action(s.id)} style={{ fontSize: 12, padding: "4px 12px" }}>
        {variant === "danger" ? "Remove" : "Add"}
      </Button>
    </div>
  );

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>🎯 My Skills</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#16a34a", margin: "0 0 16px" }}>✅ Your Skills ({assigned.length})</h3>
          {assigned.length === 0 ? <p style={{ color: "#94a3b8" }}>No skills added yet</p> : assigned.map((s) => pill(s, remove, "danger"))}
        </div>
        <div style={{ background: "#fff", borderRadius: 10, padding: 24, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
          <h3 style={{ color: "#2563eb", margin: "0 0 16px" }}>📚 Available Skills ({available.length})</h3>
          {available.length === 0 ? <p style={{ color: "#94a3b8" }}>You have all skills!</p> : available.map((s) => pill(s, add, "primary"))}
        </div>
      </div>
    </Layout>
  );
};

export default MySkills;