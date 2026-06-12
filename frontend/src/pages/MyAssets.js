// frontend/src/pages/MyAssets.js
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import api from "../api";

const STATUS_COLORS = {
  active:   { bg: "#dbeafe", color: "#1e40af" },
  returned: { bg: "#f1f5f9", color: "#475569" },
};

export default function MyAssets() {
  const [allocations, setAllocations] = useState([]);

  useEffect(() => {
    api.get("/assets/my").then(r => setAllocations(r.data)).catch(() => {});
  }, []);

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>💼 My Assets</h2>
      {allocations.length === 0 ? (
        <div style={{ background: "#fff", borderRadius: 10, padding: 40, textAlign: "center", color: "#94a3b8" }}>
          <p style={{ fontSize: 40, margin: 0 }}>💻</p>
          <p>No assets allocated to you yet.</p>
        </div>
      ) : (
        <Table
          columns={[
            { key: "asset_code",         label: "Code" },
            { key: "asset_name",         label: "Asset" },
            { key: "asset_type",         label: "Type" },
            { key: "allocated_date",     label: "Allocated" },
            { key: "return_date",        label: "Returned", render: r => r.return_date || "-" },
            { key: "allocation_status",  label: "Status",
              render: r => {
                const s = STATUS_COLORS[r.allocation_status] || { bg: "#f1f5f9", color: "#475569" };
                return <span style={{ ...s, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{r.allocation_status}</span>;
              }
            },
          ]}
          rows={allocations}
        />
      )}
    </Layout>
  );
}
