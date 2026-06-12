import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import api from "../api";

const LeaveBalance = () => {
  const [balance, setBalance] = useState([]);

  useEffect(() => { 
    api.get("/leaves/balance").then((r) => setBalance(r.data)); 
  }, []);

  const totalAvail = balance.reduce((s, b) => s + (b.available_days || 0), 0);
  const totalMax   = balance.reduce((s, b) => s + (b.total_days || 0), 0);
  const totalUsed  = totalMax - totalAvail;

  return (
    <Layout>
      {/* Title Header Layout Block */}
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>💰 My Leave Balance</h2>
      </div>

      {/* Aggregate Balance Cards Matrix */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 32 }}>
        <Card title="Total Available" value={`${totalAvail} Days`} color="#16a34a" />
        <Card title="Total Used" value={`${totalUsed} Days`}  color="#e11d48" />
        <Card title="Total Quota" value={`${totalMax} Days`}   color="#3b6cf8" />
      </div>

      {/* Premium Integrated Utilization Data Table */}
      <div style={{ 
        background: "#fff", 
        borderRadius: 16, 
        overflow: "hidden", 
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(15, 23, 42, 0.03)" 
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
              {["Leave Type Classification", "Total Quota", "Available", "Used", "Utilization Progress"].map((h, i) => (
                <th 
                  key={h} 
                  style={{ 
                    padding: "16px 24px", 
                    color: "#475569", 
                    fontSize: 12, 
                    fontWeight: 800, 
                    textAlign: "left",
                    textTransform: "uppercase",
                    letterSpacing: "0.5px"
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {balance.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: "32px 24px", textAlign: "center", color: "#94a3b8", fontStyle: "italic" }}>
                  No leave policy matrix allocations detected.
                </td>
              </tr>
            ) : (
              balance.map((b, i) => {
                const used = (b.total_days || 0) - (b.available_days || 0);
                const pct  = b.total_days ? Math.round((used / b.total_days) * 100) : 0;
                
                return (
                  <tr 
                    key={b.id} 
                    onMouseEnter={(e) => { e.currentTarget.style.background = "#f8fafc"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = i % 2 === 0 ? "#fff" : "rgba(248, 250, 252, 0.55)"; }}
                    style={{ 
                      borderBottom: "1px solid #e2e8f0", 
                      background: i % 2 === 0 ? "#fff" : "rgba(248, 250, 252, 0.55)",
                      transition: "background 0.15s ease-in-out"
                    }}
                  >
                    <td style={{ padding: "16px 24px", fontWeight: 700, color: "#0f172a", fontSize: 14 }}>
                      📁 {b.leave_name}
                    </td>
                    <td style={{ padding: "16px 24px", color: "#475569", fontWeight: 600, fontSize: 14 }}>
                      {b.total_days} Days
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14 }}>
                      <span style={{ color: "#047857", background: "#ecfdf5", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>
                        {b.available_days ?? 0} Avail
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", fontSize: 14 }}>
                      <span style={{ color: used > 0 ? "#b91c1c" : "#64748b", background: used > 0 ? "#fff5f5" : "#f1f5f9", padding: "4px 10px", borderRadius: 6, fontWeight: 700 }}>
                        {used} Used
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", minWidth: 180 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ background: "#e2e8f0", borderRadius: 10, height: 8, flex: 1, overflow: "hidden" }}>
                          <div 
                            style={{ 
                              background: pct > 80 ? "#e11d48" : pct > 50 ? "#f97316" : "#3b6cf8", 
                              width: `${Math.min(pct, 100)}%`, 
                              height: "100%", 
                              borderRadius: 10,
                              transition: "width 0.4s cubic-bezier(0.16, 1, 0.3, 1)"
                            }} 
                          />
                        </div>
                        <span style={{ color: pct > 80 ? "#e11d48" : "#475569", fontSize: 12, fontWeight: 700, minWidth: 60, textAlign: "right" }}>
                          {pct}% used
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default LeaveBalance;