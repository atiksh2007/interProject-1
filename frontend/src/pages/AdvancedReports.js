// frontend/src/pages/AdvancedReports.js
import { useEffect, useState, useCallback } from "react";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import Card from "../components/Card";
import api from "../api";

const inp = { padding: "9px 12px", border: "1px solid #e2e8f0", borderRadius: 8, fontSize: 14, background: "#f8fafc" };

export default function AdvancedReports() {
  const [activeTab, setActiveTab]     = useState("employees");
  const [employees, setEmployees]     = useState({ data: [], total: 0, totalPages: 1 });
  const [assets,    setAssets]        = useState([]);
  const [deptStats, setDeptStats]     = useState([]);
  const [search,    setSearch]        = useState("");
  const [deptFilter,setDeptFilter]    = useState("");
  const [departments, setDepartments] = useState([]);
  const [page,      setPage]          = useState(1);
  const [sortBy,    setSortBy]        = useState("ep.id");
  const [sortDir,   setSortDir]       = useState("ASC");

  const [searchQ,      setSearchQ]      = useState("");
  const [searchResults,setSearchResults]= useState(null);
  const [searching,    setSearching]    = useState(false);

  useEffect(() => {
    api.get("/departments").then(r => setDepartments(r.data)).catch(() => {});
    api.get("/reports/assets").then(r => setAssets(r.data)).catch(() => {});
    api.get("/reports/department-stats").then(r => setDeptStats(r.data)).catch(() => {});
  }, []);

  const fetchEmployees = useCallback(async () => {
    try {
      const r = await api.get("/reports/employees", {
        params: { search, department_id: deptFilter, page, limit: 10, sortBy, sortDir }
      });
      setEmployees(r.data);
    } catch (e) { console.error(e); }
  }, [search, deptFilter, page, sortBy, sortDir]);

  useEffect(() => { if (activeTab === "employees") fetchEmployees(); }, [activeTab, fetchEmployees]);

  const exportCSV = async (type) => {
    try {
      const response = await api.get(`/reports/export/${type}`, {
        params: { format: "csv" },
        responseType: "blob",
      });
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href     = url;
      link.setAttribute("download", `${type}_report.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) { alert("Export failed"); }
  };

  const doSearch = async () => {
    if (!searchQ.trim()) return;
    setSearching(true);
    try {
      const r = await api.get("/reports/search", { params: { q: searchQ } });
      setSearchResults(r.data);
    } catch (e) { alert("Search failed"); }
    finally { setSearching(false); }
  };

  const SortHeader = ({ label, field }) => (
    <span style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => { if (sortBy === field) setSortDir(d => d === "ASC" ? "DESC" : "ASC"); else { setSortBy(field); setSortDir("ASC"); } setPage(1); }}>
      {label} {sortBy === field ? (sortDir === "ASC" ? "↑" : "↓") : ""}
    </span>
  );

  const Tab = ({ id, label }) => (
    <button onClick={() => setActiveTab(id)} style={{
      padding: "8px 18px", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 14, fontWeight: activeTab === id ? 600 : 400,
      background: activeTab === id ? "#2563eb" : "#f1f5f9",
      color: activeTab === id ? "#fff" : "#475569",
    }}>{label}</button>
  );

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>📋 Advanced Reports</h2>



      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <Tab id="employees"   label="👤 Employees" />
        <Tab id="assets"      label="💻 Assets" />
        <Tab id="departments" label="🏢 Departments" />
      </div>

      {/* Employee Report */}
      {activeTab === "employees" && (
        <>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 16, alignItems: "center" }}>
            <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Filter employees..." style={inp} />
            <select value={deptFilter} onChange={e => { setDeptFilter(e.target.value); setPage(1); }} style={inp}>
              <option value="">All Departments</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.department_name}</option>)}
            </select>
            <Button onClick={() => exportCSV("employees")} variant="secondary">⬇ Export CSV</Button>
            <span style={{ color: "#64748b", fontSize: 13, marginLeft: "auto" }}>{employees.total} employees</span>
          </div>
          <Table
            columns={[
              { key: "name",            label: <SortHeader label="Name"       field="u.name" /> },
              { key: "email",           label: "Email" },
              { key: "department_name", label: <SortHeader label="Department" field="d.department_name" /> },
              { key: "designation",     label: "Designation" },
              { key: "salary",          label: <SortHeader label="Salary"     field="ep.salary" />,
                render: r => r.salary ? `₹${Number(r.salary).toLocaleString()}` : "-" },
              { key: "approved_leaves", label: "Leaves" },
              { key: "active_assets",   label: "Assets" },
            ]}
            rows={employees.data}
          />
          {employees.totalPages > 1 && (
            <div style={{ display: "flex", gap: 8, marginTop: 16, alignItems: "center" }}>
              <Button disabled={page===1} onClick={() => setPage(p=>p-1)} variant="secondary">← Prev</Button>
              <span style={{ color: "#64748b", fontSize: 14 }}>Page {page} of {employees.totalPages}</span>
              <Button disabled={page===employees.totalPages} onClick={() => setPage(p=>p+1)} variant="secondary">Next →</Button>
            </div>
          )}
        </>
      )}

      {/* Asset Report */}
      {activeTab === "assets" && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
            <Button onClick={() => exportCSV("assets")} variant="secondary">⬇ Export CSV</Button>
          </div>
          <Table
            columns={[
              { key: "asset_code",          label: "Code" },
              { key: "asset_name",          label: "Name" },
              { key: "asset_type",          label: "Type" },
              { key: "status",              label: "Status" },
              { key: "purchase_cost",       label: "Cost", render: r => r.purchase_cost ? `₹${Number(r.purchase_cost).toLocaleString()}` : "-" },
              { key: "current_allocations", label: "Active Alloc." },
              { key: "history_count",       label: "History Events" },
            ]}
            rows={assets}
          />
        </>
      )}

      {/* Department Stats */}
      {activeTab === "departments" && (
        <>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 20 }}>
            {deptStats.slice(0,4).map(d => (
              <Card key={d.department_name} title={d.department_name}
                value={d.total_employees} color="#2563eb" />
            ))}
          </div>
          <Table
            columns={[
              { key: "department_name",  label: "Department" },
              { key: "total_employees",  label: "Employees" },
              { key: "avg_salary",       label: "Avg Salary", render: r => r.avg_salary ? `₹${Number(r.avg_salary).toLocaleString()}` : "-" },
              { key: "total_leaves",     label: "Approved Leaves" },
            ]}
            rows={deptStats}
          />
        </>
      )}
    </Layout>
  );
}
