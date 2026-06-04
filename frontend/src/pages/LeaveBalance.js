import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import api from "../api";

const LeaveBalance = () => {
  const [balance, setBalance] = useState([]);

  useEffect(() => { api.get("/leaves/balance").then((r) => setBalance(r.data)); }, []);

  const totalAvail = balance.reduce((s, b) => s + (b.available_days || 0), 0);
  const totalMax   = balance.reduce((s, b) => s + (b.total_days || 0), 0);
  const totalUsed  = totalMax - totalAvail;

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>💰 My Leave Balance</h2>

      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 28 }}>
        <Card title="Total Available" value={totalAvail} color="#16a34a" />
        <Card title="Total Used" value={totalUsed}  color="#dc2626" />
        <Card title="Total Quota"value={totalMax}   color="#2563eb" />
      </div>

      <div style={{ background: "#fff", borderRadius: 10, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#1e293b" }}>
              {["Leave Type", "Total Days", "Available", "Used", "Progress"].map((h) => (
                <th key={h} style={{ padding: "12px 16px", color: "#cbd5e1", fontSize: 13, fontWeight: 600, textAlign: "left" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {balance.map((b, i) => {
              const used = (b.total_days || 0) - (b.available_days || 0);
              const pct  = b.total_days ? Math.round((used / b.total_days) * 100) : 0;
              return (
                <tr key={b.id} style={{ borderBottom: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <td style={{ padding: "14px 16px", fontWeight: 600, color: "#334155" }}>{b.leave_name}</td>
                  <td style={{ padding: "14px 16px", color: "#64748b" }}>{b.total_days}</td>
                  <td style={{ padding: "14px 16px" }}><b style={{ color: "#16a34a" }}>{b.available_days ?? 0}</b></td>
                  <td style={{ padding: "14px 16px" }}><b style={{ color: "#dc2626" }}>{used}</b></td>
                  <td style={{ padding: "14px 16px", minWidth: 140 }}>
                    <div style={{ background: "#e2e8f0", borderRadius: 10, height: 8, overflow: "hidden" }}>
                      <div style={{ background: pct > 80 ? "#dc2626" : "#2563eb", width: `${pct}%`, height: "100%", borderRadius: 10 }} />
                    </div>
                    <small style={{ color: "#64748b" }}>{pct}% used</small>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default LeaveBalance;