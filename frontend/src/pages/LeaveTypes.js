import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../api";

const inpBaseStyle = { 
  display: "block", padding: "10px 14px", margin: "8px 0 16px", 
  width: "100%", border: "1px solid #cbd5e1", borderRadius: 8, 
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc",
  outline: "none", color: "#334155", fontWeight: 500,
  transition: "all 0.15s ease-in-out"
};

const lbl = { fontSize: 12, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px" };

// Reusable animated input component for form context consistency
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

const LeaveTypes = () => {
  const [types, setTypes]     = useState([]);
  const [form, setForm]       = useState({ leave_name: "", total_days: "" });
  const [editing, setEditing] = useState(null);
  const [open, setOpen]       = useState(false);

  const fetch = async () => setTypes((await api.get("/leave-types")).data);
  useEffect(() => { fetch(); }, []);

  const save = async () => {
    try {
      if (editing) await api.put(`/leave-types/${editing.id}`, form);
      else         await api.post("/leave-types", form);
      setOpen(false); setEditing(null); setForm({ leave_name: "", total_days: "" });
      fetch();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this leave type?")) return;
    try { await api.delete(`/leave-types/${id}`); fetch(); }
    catch { alert("Cannot delete — may have existing applications"); }
  };

  return (
    <Layout>
      {/* Header Panel Wrapper Block */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>⚙️ Leave Types</h2>
        <Button 
          onClick={() => { setOpen(true); setEditing(null); setForm({ leave_name: "", total_days: "" }); }}
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
            transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)", borderRadius: 8, 
            fontWeight: 700, padding: "10px 20px", background: "#3b6cf8", color: "#fff", border: "1px solid transparent"
          }}
        >
          + Add Leave Type
        </Button>
      </div>

      <Table
        columns={[
          { key: "serial_no",   label: "#" },
          { key: "leave_name", label: "Leave Classification", render: (r) => <span style={{ fontWeight: 600, color: "#0f172a" }}>📁 {r.leave_name}</span> },
          { key: "total_days", label: "Annual Allocation Limit", render: (r) => <span style={{ fontWeight: 700, color: "#2563eb" }}>{r.total_days} Days</span> },
        ]}
        rows={types.map((item, index) => ({ ...item, serial_no: index + 1 }))}
        actions={(r) => (
          <div style={{ display: "flex", gap: 8 }}>
            
            {/* EDIT CONFIG BUTTON (ORANGE TINT) */}
            <Button 
              onClick={() => { setEditing(r); setForm({ leave_name: r.leave_name, total_days: r.total_days }); setOpen(true); }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.background = "#fff7ed";
                e.currentTarget.style.color = "#ea580c";
                e.currentTarget.style.borderColor = "#fed7aa";
                e.currentTarget.style.boxShadow = "0 0 12px rgba(234, 88, 12, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.background = "#f1f5f9";
                e.currentTarget.style.color = "#f97316";
                e.currentTarget.style.borderColor = "#cbd5e1";
                e.currentTarget.style.boxShadow = "none";
              }}
              style={{
                transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                fontSize: 13, padding: "6px 14px", background: "#f1f5f9", color: "#f97316", border: "1px solid #cbd5e1"
              }}
            >
              Edit
            </Button>

            {/* REMOVE POLICY BUTTON (RED TINT) */}
            <Button 
              variant="danger" 
              onClick={() => remove(r.id)}
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
              style={{
                transition: "all 0.2s ease-in-out", borderRadius: 6, fontWeight: 700,
                fontSize: 13, padding: "6px 14px", background: "#fef2f2", color: "#ef4444", border: "1px solid #fee2e2"
              }}
            >
              Delete
            </Button>
          </div>
        )}
      />

      {/* Configuration Form Dialog Modal Container */}
      <Modal
        open={open}
        title={editing ? "📝 Edit Leave Policy Matrix" : "⚙️ Define New Leave Class"}
        onClose={() => setOpen(false)}
        footer={
          <Button 
            onClick={save}
            style={{ background: "#3b6cf8", color: "#fff", padding: "10px 24px", fontWeight: 700, borderRadius: 8 }}
          >
            Commit Policy Details
          </Button>
        }
      >
        <div style={{ paddingTop: 8 }}>
          <label style={lbl}>Leave Template Title</label>
          <AnimatedFormInput 
            placeholder="e.g. Sabbatical Leave, Casual Leave" 
            value={form.leave_name} 
            onChange={(e) => setForm({ ...form, leave_name: e.target.value })} 
          />
          
          <label style={lbl}>Allotted Yearly Quantum (Days)</label>
          <AnimatedFormInput 
            type="number" 
            placeholder="e.g. 12" 
            value={form.total_days} 
            onChange={(e) => setForm({ ...form, total_days: e.target.value })} 
          />
        </div>
      </Modal>
    </Layout>
  );
};

export default LeaveTypes;