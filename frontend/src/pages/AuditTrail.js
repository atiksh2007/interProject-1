// frontend/src/pages/AuditTrail.js
import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import api from "../api";

const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#f8fafc" };

const ACTION_COLORS = {
  INSERT: { bg: "#dcfce7", color: "#166534" },
  UPDATE: { bg: "#dbeafe", color: "#1e40af" },
  DELETE: { bg: "#fee2e2", color: "#991b1b" },
};

export default function AuditTrail() {
  const [logs,    setLogs]    = useState({ data: [], total: 0, totalPages: 1 });
  const [tables,  setTables]  = useState([]);
  const [detail,  setDetail]  = useState(null);
  const [page,    setPage]    = useState(1);

  const [filter, setFilter] = useState({ table: "", action: "", from: "", to: "" });

  const fetchLogs = useCallback(async () => {
    try {
      const params = { page, limit: 20, ...filter };
      const r = await api.get("/audit", { params });
      setLogs(r.data);
    } catch (e) { console.error(e); }
  }, [page, filter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);
  useEffect(() => {
    api.get("/audit/tables").then(r => setTables(r.data)).catch(() => {});
  }, []);

  const applyFilter = (key, val) => { setFilter(f => ({ ...f, [key]: val })); setPage(1); };

  const DiffView = ({ old_data, new_data }) => {
    if (!old_data && !new_data) return <p style={{ color: "#94a3b8" }}>No data snapshot</p>;
    const old_ = old_data  ? (typeof old_data  === "string" ? JSON.parse(old_data)  : old_data)  : {};
    const new_ = new_data  ? (typeof new_data  === "string" ? JSON.parse(new_data)  : new_data)  : {};
    const keys = Array.from(new Set([...Object.keys(old_), ...Object.keys(new_)]));

    return (
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
        <thead>
          <tr style={{ background: "#1e293b" }}>
            {["Field","Old Value","New Value"].map(h => (
              <th key={h} style={{ padding: "8px 12px", color: "#cbd5e1", textAlign: "left" }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map(k => {
            const changed = JSON.stringify(old_[k]) !== JSON.stringify(new_[k]);
            return (
              <tr key={k} style={{ background: changed ? "#fef9c3" : "#fff", borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: "7px 12px", fontWeight: 600, color: "#334155" }}>{k}</td>
                <td style={{ padding: "7px 12px", color: "#dc2626" }}>{old_[k] != null ? String(old_[k]) : "-"}</td>
                <td style={{ padding: "7px 12px", color: "#16a34a" }}>{new_[k] != null ? String(new_[k]) : "-"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>🔍 Audit Trail</h2>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 20, background: "#fff", padding: 16, borderRadius: 10, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
        <select value={filter.table} onChange={e => applyFilter("table", e.target.value)} style={inp}>
          <option value="">All Tables</option>
          {tables.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select value={filter.action} onChange={e => applyFilter("action", e.target.value)} style={inp}>
          <option value="">All Actions</option>
          {["INSERT","UPDATE","DELETE"].map(a => <option key={a} value={a}>{a}</option>)}
        </select>
        <input type="date" value={filter.from} onChange={e => applyFilter("from", e.target.value)} style={inp} placeholder="From date" />
        <input type="date" value={filter.to}   onChange={e => applyFilter("to",   e.target.value)} style={inp} placeholder="To date" />
        <Button variant="secondary" onClick={() => { setFilter({ table:"", action:"", from:"", to:"" }); setPage(1); }}>Clear</Button>
      </div>

      <p style={{ color: "#64748b", fontSize: 14, marginBottom: 8 }}>
        {logs.total} record{logs.total !== 1 ? "s" : ""} found
      </p>

      <Table
        columns={[
          { key: "id",               label: "#" },
          { key: "table_name",       label: "Table" },
          { key: "action_type",      label: "Action",
            render: r => {
              const s = ACTION_COLORS[r.action_type] || { bg: "#f1f5f9", color: "#475569" };
              return <span style={{ ...s, padding: "2px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{r.action_type}</span>;
            }
          },
          { key: "record_id",        label: "Record ID" },
          { key: "performed_by_name",label: "By" },
          { key: "created_at",       label: "Time", render: r => new Date(r.created_at).toLocaleString() },
        ]}
        rows={logs.data}
        actions={r => (
          <Button onClick={() => setDetail(r)}>View Diff</Button>
        )}
      />

      {logs.totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
          <Button disabled={page===1} onClick={() => setPage(p=>p-1)} variant="secondary">← Prev</Button>
          <span style={{ color: "#64748b", fontSize: 14 }}>Page {page} of {logs.totalPages}</span>
          <Button disabled={page===logs.totalPages} onClick={() => setPage(p=>p+1)} variant="secondary">Next →</Button>
        </div>
      )}

      {/* Diff Modal */}
      {detail && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: 28, width: "90%", maxWidth: 700, maxHeight: "80vh", overflowY: "auto", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 style={{ margin: 0, color: "#1e293b" }}>
                Change Details — {detail.table_name} #{detail.record_id}
              </h3>
              <button onClick={() => setDetail(null)} style={{ border: "none", background: "#f1f5f9", borderRadius: 6, width: 30, height: 30, fontSize: 18, cursor: "pointer" }}>×</button>
            </div>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
              {detail.action_type} by <b>{detail.performed_by_name}</b> at {new Date(detail.created_at).toLocaleString()}
            </p>
            <DiffView old_data={detail.old_data} new_data={detail.new_data} />
          </div>
        </div>
      )}
    </Layout>
  );
}
