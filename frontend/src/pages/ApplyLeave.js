import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import Button from "../components/Button";
import api from "../api";

const inp = { display: "block", padding: "10px 14px", margin: "8px 0 16px", width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, boxSizing: "border-box", background: "#f8fafc" };
const label = { fontSize: 13, fontWeight: 600, color: "#475569" };

const ApplyLeave = () => {
  const [types, setTypes]     = useState([]);
  const [balance, setBalance] = useState([]);
  const [form, setForm]       = useState({ leave_type_id: "", from_date: "", to_date: "", reason: "" });
  const [days, setDays]       = useState(0);
  const nav = useNavigate();

  useEffect(() => {
    api.get("/leaves/types").then((r) => setTypes(r.data));
    api.get("/leaves/balance").then((r) => setBalance(r.data));
  }, []);

  useEffect(() => {
    if (form.from_date && form.to_date) {
      const d = (new Date(form.to_date) - new Date(form.from_date)) / 86400000 + 1;
      setDays(d > 0 ? d : 0);
    }
  }, [form.from_date, form.to_date]);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/leaves/apply", { ...form, total_days: days });
      alert("Leave applied successfully!");
      nav("/my-leaves");
    } catch (err) {
      alert(err.response?.data?.message || "Error applying leave");
    }
  };

  const currentBal = balance.find((b) => String(b.leave_type_id) === String(form.leave_type_id));

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>📝 Apply for Leave</h2>
      <div style={{ background: "#fff", padding: 28, borderRadius: 10, maxWidth: 600, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <form onSubmit={submit}>

          <label style={label}>Leave Type</label>
          <select value={form.leave_type_id} onChange={(e) => setForm({ ...form, leave_type_id: e.target.value })} style={inp} required>
            <option value="">Select Leave Type</option>
            {types.map((t) => {
              const bal = balance.find((b) => b.leave_type_id === t.id);
              return (
                <option key={t.id} value={t.id}>
                  {t.leave_name} — Available: {bal?.available_days ?? t.total_days} days
                </option>
              );
            })}
          </select>

          {currentBal && (
            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13 }}>
              Available: <b style={{ color: "#2563eb" }}>{currentBal.available_days}</b> / {currentBal.total_days} days
            </div>
          )}

          <div style={{ display: "flex", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={label}>From Date</label>
              <input type="date" value={form.from_date} onChange={(e) => setForm({ ...form, from_date: e.target.value })} style={inp} required />
            </div>
            <div style={{ flex: 1 }}>
              <label style={label}>To Date</label>
              <input type="date" value={form.to_date} onChange={(e) => setForm({ ...form, to_date: e.target.value })} style={inp} required />
            </div>
          </div>

          {days > 0 && (
            <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 14 }}>
              Total Days: <b style={{ color: "#16a34a" }}>{days}</b>
            </div>
          )}

          <label style={label}>Reason</label>
          <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} style={{ ...inp, height: 100, resize: "vertical" }} placeholder="Reason for leave..." required />

          <Button type="submit" variant="success" style={{ width: "100%", padding: "12px 0", fontSize: 15 }}>
            Submit Application
          </Button>
        </form>
      </div>
    </Layout>
  );
};

export default ApplyLeave;