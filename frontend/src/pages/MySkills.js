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

  const pill = (s, action, variant) => {
    const isDanger = variant === "danger";
    return (
      <div 
        key={s.id} 
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = isDanger ? "#fca5a5" : "#bfdbfe";
          e.currentTarget.style.background = isDanger ? "#fff5f5" : "#eff6ff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "#e2e8f0";
          e.currentTarget.style.background = "#f8fafc";
        }}
        style={{ 
          display: "flex", 
          alignItems: "center", 
          justifyContent: "space-between", 
          background: "#f8fafc", 
          border: "1px solid #e2e8f0", 
          borderRadius: 10, 
          padding: "12px 16px", 
          marginBottom: 10,
          transition: "all 0.15s ease-in-out"
        }}
      >
        <span style={{ color: "#0f172a", fontWeight: 600, fontSize: 14 }}>
          ⚡ {s.skill_name}
        </span>
        <Button 
          variant={variant} 
          onClick={() => action(s.id)} 
          style={{ 
            fontSize: 12, 
            padding: "5px 14px",
            borderRadius: 6,
            fontWeight: 700
          }}
        >
          {isDanger ? "Remove" : "Add"}
        </Button>
      </div>
    );
  };

  return (
    <Layout>
      {/* Page Header Title Layout */}
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>🎯 My Skills</h2>
      </div>

      {/* Main Two-Column Grid Setup */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
        
        {/* Left Card: Active Inventory Panel */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 28, 
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ color: "#047857", margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>
              ✅ Endorsed Inventory
            </h3>
            <span style={{ background: "#ecfdf5", color: "#047857", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
              {assigned.length} Active
            </span>
          </div>
          
          <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: 4 }}>
            {assigned.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ color: "#94a3b8", margin: 0, fontSize: 14, fontWeight: 500 }}>No specific skills highlighted yet.</p>
              </div>
            ) : assigned.map((s) => pill(s, remove, "danger"))}
          </div>
        </div>

        {/* Right Card: Discovery Library Panel */}
        <div style={{ 
          background: "#fff", 
          borderRadius: 16, 
          padding: 28, 
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.02)" 
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h3 style={{ color: "#3b6cf8", margin: 0, fontSize: 16, fontWeight: 800, letterSpacing: "-0.3px" }}>
              📚 Available Directory
            </h3>
            <span style={{ background: "#eff6ff", color: "#3b6cf8", fontSize: 12, fontWeight: 700, padding: "2px 8px", borderRadius: 6 }}>
              {available.length} Listed
            </span>
          </div>

          <div style={{ maxHeight: "450px", overflowY: "auto", paddingRight: 4 }}>
            {available.length === 0 ? (
              <div style={{ padding: "40px 0", textAlign: "center" }}>
                <p style={{ color: "#047857", margin: 0, fontSize: 14, fontWeight: 600 }}>🎉 Remarkable! You've claimed every skill option.</p>
              </div>
            ) : available.map((s) => pill(s, add, "primary"))}
          </div>
        </div>

      </div>
    </Layout>
  );
};

export default MySkills;