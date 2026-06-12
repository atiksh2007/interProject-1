// frontend/src/pages/MyAssets.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import api from "../api";

const STATUS_COLORS = {
  active:   { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" },
  returned: { bg: "#f8fafc", color: "#475569", border: "#e2e8f0" },
};

const AllocationStatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569", border: "#e2e8f0" };
  return (
    <span style={{ 
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 700,
      textTransform: "uppercase", letterSpacing: "0.3px", display: "inline-block"
    }}>
      {status}
    </span>
  );
};

export default function MyAssets() {
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    api.get("/assets/my").then(r => setAllocations(r.data)).catch(() => {});
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Layout>
      {/* Header Section */}
      <div style={{ marginBottom: 28, borderBottom: "1px solid #e2e8f0", paddingBottom: 16 }}>
        <h2 style={{ color: "#0f172a", margin: 0, fontWeight: 800, fontSize: 24, letterSpacing: "-0.5px" }}>💼 My Assets</h2>
      </div>

      {allocations.length === 0 ? (
        /* Refined Empty Slate Panel */
        <div style={{ 
          background: "#fff", borderRadius: 12, padding: "60px 40px", textAlign: "center", 
          border: "1px solid #e2e8f0", boxShadow: "0 4px 20px rgba(0,0,0,0.01)", maxWidth: 600, margin: "0 auto" 
        }}>
          <div style={{ 
            fontSize: 48, background: "#f0fdf4", width: 80, height: 80, borderRadius: "50%", 
            display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" 
          }}>
            💻
          </div>
          <h3 style={{ color: "#1e293b", margin: "0 0 8px", fontSize: 18, fontWeight: 700 }}>All clear!</h3>
          <p style={{ color: "#64748b", margin: 0, fontSize: 14, fontWeight: 500 }}>No hardware assets or peripherals are currently assigned to your account.</p>
        </div>
      ) : (
        /* Stylized Table Representation */
        <Table
          columns={[
            { key: "asset_code",  label: "Code", render: r => <span style={{ fontWeight: 700, color: "#1e293b" }}>{r.asset_code}</span> },
            { key: "asset_name",  label: "Asset Details", render: r => <span style={{ fontWeight: 600, color: "#0f172a" }}>{r.asset_name}</span> },
            { key: "asset_type",  label: "Type Category" },
            { key: "allocated_date", label: "Allocated On", render: r => formatDate(r.allocated_date) },
            { key: "return_date",    label: "Returned On", render: r => formatDate(r.return_date) },
            { key: "allocation_status", label: "Status State", render: r => <AllocationStatusBadge status={r.allocation_status} /> },
          ]}
          rows={allocations}
        />
      )}
    </Layout>
  );
}