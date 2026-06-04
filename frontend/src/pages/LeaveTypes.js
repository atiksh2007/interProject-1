import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };

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
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>⚙️ Leave Types</h2>
        <Button onClick={() => { setOpen(true); setEditing(null); setForm({ leave_name: "", total_days: "" }); }}>
          + Add Leave Type
        </Button>
      </div>

      <Table
        columns={[
          { key: "id",         label: "#" },
          { key: "leave_name", label: "Leave Name" },
          { key: "total_days", label: "Total Days" },
        ]}
        rows={types}
        actions={(r) => (
          <div style={{ display: "flex", gap: 6 }}>
            <Button onClick={() => { setEditing(r); setForm({ leave_name: r.leave_name, total_days: r.total_days }); setOpen(true); }}>Edit</Button>
            <Button variant="danger" onClick={() => remove(r.id)}>Delete</Button>
          </div>
        )}
      />

      <Modal
        open={open}
        title={editing ? "Edit Leave Type" : "Add Leave Type"}
        onClose={() => setOpen(false)}
        footer={<Button onClick={save}>Save</Button>}
      >
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Leave Name</label>
        <input placeholder="e.g. Casual Leave" value={form.leave_name} onChange={(e) => setForm({ ...form, leave_name: e.target.value })} style={inp} />
        <label style={{ fontSize: 13, fontWeight: 600, color: "#475569" }}>Total Days</label>
        <input type="number" placeholder="e.g. 12" value={form.total_days} onChange={(e) => setForm({ ...form, total_days: e.target.value })} style={inp} />
      </Modal>
    </Layout>
  );
};

export default LeaveTypes;