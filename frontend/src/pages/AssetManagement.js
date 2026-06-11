// frontend/src/pages/AssetManagement.js
import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const inp = {
  display: "block", padding: "10px 14px", margin: "8px 0 16px",
  width: "100%", border: "1px solid #e2e8f0", borderRadius: 8,
  fontSize: 14, boxSizing: "border-box", background: "#f8fafc",
};
const lbl = { fontSize: 13, fontWeight: 600, color: "#475569" };

const STATUS_COLORS = {
  available: { bg: "#dcfce7", color: "#166534" },
  allocated:  { bg: "#dbeafe", color: "#1e40af" },
  returned:   { bg: "#f1f5f9", color: "#475569" },
  damaged:    { bg: "#fef9c3", color: "#854d0e" },
  lost:       { bg: "#fee2e2", color: "#991b1b" },
};

const StatusBadge = ({ status }) => {
  const s = STATUS_COLORS[status] || { bg: "#f1f5f9", color: "#475569" };
  return (
    <span style={{ ...s, padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
};

const EMPTY_FORM = { asset_code: "", asset_name: "", asset_type: "", purchase_date: "", purchase_cost: "", status: "available" };

export default function AssetManagement() {
  const { isAdmin, isHR } = useAuth();
  const canManage = isAdmin || isHR;

  const [assets, setAssets]         = useState({ data: [], total: 0, totalPages: 1 });
  const [employees, setEmployees]   = useState([]);
  const [search, setSearch]         = useState("");
  const [statusFilter, setStatus]   = useState("");
  const [page, setPage]             = useState(1);

  const [formOpen, setFormOpen]     = useState(false);
  const [editAsset, setEditAsset]   = useState(null);
  const [form, setForm]             = useState(EMPTY_FORM);

  const [allocOpen, setAllocOpen]   = useState(false);
  const [allocAsset, setAllocAsset] = useState(null);
  const [allocEmp, setAllocEmp]     = useState("");
  const [allocNote, setAllocNote]   = useState("");

  const [detail, setDetail]         = useState(null);

  const fetchAssets = useCallback(async () => {
    try {
      const r = await api.get("/assets", { params: { page, limit: 10, search, status: statusFilter } });
      setAssets(r.data);
    } catch (e) { console.error(e); }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchAssets(); }, [fetchAssets]);
  useEffect(() => {
    if (canManage) api.get("/employees").then(r => setEmployees(r.data)).catch(() => {});
  }, [canManage]);

  const openCreate = () => { setEditAsset(null); setForm(EMPTY_FORM); setFormOpen(true); };
  const openEdit   = (a)  => { setEditAsset(a);  setForm({ ...a, purchase_date: a.purchase_date?.slice(0,10) || "" }); setFormOpen(true); };

  const saveAsset = async () => {
    try {
      if (editAsset) await api.put(`/assets/${editAsset.id}`, form);
      else           await api.post("/assets", form);
      setFormOpen(false); fetchAssets();
    } catch (err) { alert(err.response?.data?.message || "Error"); }
  };

  const deleteAsset = async (id) => {
    if (!window.confirm("Delete this asset?")) return;
    try { await api.delete(`/assets/${id}`); fetchAssets(); }
    catch (e) { alert(e.response?.data?.message || "Delete failed"); }
  };

  const openAlloc = (a) => { setAllocAsset(a); setAllocEmp(""); setAllocNote(""); setAllocOpen(true); };
  const doAllocate = async () => {
    if (!allocEmp) return alert("Select an employee");
    try {
      await api.post("/assets/allocate", { asset_id: allocAsset.id, employee_id: allocEmp, notes: allocNote });
      setAllocOpen(false); fetchAssets(); alert("Asset allocated!");
    } catch (e) { alert(e.response?.data?.message || "Error"); }
  };

  const viewDetail = async (id) => {
    try {
      const r = await api.get(`/assets/${id}`);
      setDetail(r.data);
    } catch (e) { alert("Error loading detail"); }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>💻 Asset Management</h2>
        {isAdmin && <Button variant="success" onClick={openCreate}>+ Add Asset</Button>}
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <input
          placeholder="🔍 Search assets..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
          style={{ ...inp, margin: 0, width: 240 }}
        />
        <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} style={{ ...inp, margin: 0, width: 160 }}>
          <option value="">All Statuses</option>
          {["available","allocated","returned","damaged","lost"].map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <Table
        columns={[
          { key: "asset_code",  label: "Code" },
          { key: "asset_name",  label: "Name" },
          { key: "asset_type",  label: "Type" },
          { key: "purchase_cost", label: "Cost", render: r => r.purchase_cost ? `₹${Number(r.purchase_cost).toLocaleString()}` : "-" },
          { key: "status",      label: "Status", render: r => <StatusBadge status={r.status} /> },
        ]}
        rows={assets.data}
        actions={r => (
          <div style={{ display: "flex", gap: 6 }}>
            <Button onClick={() => viewDetail(r.id)}>History</Button>
            {canManage && r.status === "available" && (
              <Button variant="success" onClick={() => openAlloc(r)}>Allocate</Button>
            )}
            {isAdmin && <Button variant="warning" onClick={() => openEdit(r)}>Edit</Button>}
            {isAdmin && <Button variant="danger"  onClick={() => deleteAsset(r.id)}>Delete</Button>}
          </div>
        )}
      />

      {/* Pagination */}
      {assets.totalPages > 1 && (
        <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
          <Button disabled={page === 1} onClick={() => setPage(p => p-1)} variant="secondary">← Prev</Button>
          <span style={{ color: "#64748b", fontSize: 14 }}>Page {page} of {assets.totalPages}</span>
          <Button disabled={page === assets.totalPages} onClick={() => setPage(p => p+1)} variant="secondary">Next →</Button>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal open={formOpen} title={editAsset ? "Edit Asset" : "Add Asset"}
        onClose={() => setFormOpen(false)}
        footer={<Button onClick={saveAsset} variant="success">Save</Button>}>
        <label style={lbl}>Asset Code</label>
        <input value={form.asset_code} onChange={e => setForm({...form, asset_code: e.target.value})} style={inp} placeholder="e.g. LPT-001" />
        <label style={lbl}>Asset Name</label>
        <input value={form.asset_name} onChange={e => setForm({...form, asset_name: e.target.value})} style={inp} placeholder="e.g. Dell Laptop XPS" />
        <label style={lbl}>Type</label>
        <input value={form.asset_type} onChange={e => setForm({...form, asset_type: e.target.value})} style={inp} placeholder="e.g. Laptop, Monitor, ID Card" />
        <label style={lbl}>Purchase Date</label>
        <input type="date" value={form.purchase_date} onChange={e => setForm({...form, purchase_date: e.target.value})} style={inp} />
        <label style={lbl}>Purchase Cost (₹)</label>
        <input type="number" value={form.purchase_cost} onChange={e => setForm({...form, purchase_cost: e.target.value})} style={inp} placeholder="e.g. 55000" />
        <label style={lbl}>Status</label>
        <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} style={inp}>
          {["available","returned","damaged","lost"].map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Modal>

      {/* Allocate Modal */}
      <Modal open={allocOpen} title={`Allocate: ${allocAsset?.asset_name}`}
        onClose={() => setAllocOpen(false)}
        footer={<Button onClick={doAllocate} variant="success">Allocate</Button>}>
        <label style={lbl}>Select Employee</label>
        <select value={allocEmp} onChange={e => setAllocEmp(e.target.value)} style={inp}>
          <option value="">-- Select Employee --</option>
          {employees.map(e => <option key={e.id} value={e.id}>{e.name} ({e.department_name || "N/A"})</option>)}
        </select>
        <label style={lbl}>Notes</label>
        <input value={allocNote} onChange={e => setAllocNote(e.target.value)} style={inp} placeholder="Optional notes..." />
      </Modal>

      {/* Detail / History Modal */}
      <Modal open={!!detail} title={`Asset History: ${detail?.asset?.asset_name}`}
        onClose={() => setDetail(null)}>
        {detail && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              {[["Code", detail.asset.asset_code], ["Type", detail.asset.asset_type],
                ["Cost", detail.asset.purchase_cost ? `₹${Number(detail.asset.purchase_cost).toLocaleString()}` : "-"],
                ["Status", detail.asset.status]].map(([k, v]) => (
                <div key={k} style={{ background: "#f8fafc", borderRadius: 6, padding: "8px 12px" }}>
                  <p style={{ margin: 0, fontSize: 11, color: "#64748b", fontWeight: 600 }}>{k}</p>
                  <p style={{ margin: "4px 0 0", color: "#1e293b", fontWeight: 500 }}>{v}</p>
                </div>
              ))}
            </div>
            <h4 style={{ color: "#475569", margin: "0 0 8px" }}>History</h4>
            {detail.history.length === 0 ? <p style={{ color: "#94a3b8" }}>No history yet</p> : (
              detail.history.map((h, i) => (
                <div key={i} style={{ borderLeft: "3px solid #2563eb", paddingLeft: 12, marginBottom: 10 }}>
                  <p style={{ margin: 0, fontWeight: 600, color: "#1e293b", textTransform: "capitalize" }}>{h.action}</p>
                  <p style={{ margin: "2px 0", fontSize: 13, color: "#64748b" }}>{h.remarks}</p>
                  <small style={{ color: "#94a3b8" }}>{h.performed_by_name} · {new Date(h.created_at).toLocaleString()}</small>
                </div>
              ))
            )}
          </>
        )}
      </Modal>
    </Layout>
  );
}
