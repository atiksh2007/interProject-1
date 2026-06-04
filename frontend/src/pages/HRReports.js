import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import Card from "../components/Card";
import Table from "../components/Table";
import api from "../api";

const HRReports = () => {
  const [summary,setSummary]    = useState({});
  const [empReport, setEmpReport]  = useState([]);
  const [deptReport, setDeptReport] = useState([]);
  const [trend, setTrend]      = useState([]);
  const [absent, setAbsent]     = useState([]);
  const [salary, setSalary]     = useState([]);

  useEffect(() => {
    api.get("/reports/summary").then((r)       => setSummary(r.data)).catch(() => {});
    api.get("/reports/employee-wise").then((r) => setEmpReport(r.data)).catch(() => {});
    api.get("/reports/department-wise").then((r)=> setDeptReport(r.data)).catch(() => {});
    api.get("/reports/monthly-trend").then((r) => setTrend(r.data)).catch(() => {});
    api.get("/reports/most-absent").then((r)   => setAbsent(r.data)).catch(() => {});
    api.get("/reports/salary-ranking").then((r)=> setSalary(r.data)).catch(() => {});
  }, []);

  const section = (title) => (
    <h3 style={{ color: "#475569", fontSize: 15, margin: "32px 0 12px", borderBottom: "2px solid #e2e8f0", paddingBottom: 8 }}>{title}</h3>
  );

  return (
    <Layout>
      <h2 style={{ color: "#1e293b", marginBottom: 24 }}>📈 HR Analytics & Reports</h2>

      {/* Summary Cards */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 8 }}>
        <Card title="Total Requests" value={summary.total}color="#64748b" />
        <Card title="Pending Manager" value={summary.pending_manager}color="#d97706" />
        <Card title="Pending HR" value={summary.pending_hr} color="#0891b2" />
        <Card title="Approved" value={summary.approved} color="#16a34a" />
        <Card title="Rejected" value={summary.rejected} color="#dc2626" />
      </div>

      {section("👤 Employee-wise Leave Report")}
      <Table
        columns={[
          { key: "employee_name",label: "Employee" },
          { key: "department_name",label: "Department" },
          { key: "total_requests", label: "Total Requests" },
          { key: "approved",label: "Approved" },
          { key: "rejected", label: "Rejected" },
          { key: "total_days",label: "Days Taken" },
        ]}
        rows={empReport}
      />

      {section("🏢 Department-wise Report")}
      <Table
        columns={[
          { key: "department_name",label: "Department" },
          { key: "total_employees",label: "Employees" },
          { key: "total_requests", label: "Requests" },
          { key: "approved",label: "Approved" },
          { key: "days_taken",label: "Days Taken" },
        ]}
        rows={deptReport}
      />

      {section("📅 Monthly Leave Trend")}
      <Table
        columns={[
          { key: "month",label: "Month" },
          { key: "total_requests",label: "Total" },
          { key: "approved",label: "Approved" },
          { key: "rejected", label: "Rejected" },
        ]}
        rows={trend}
      />

      {section("🏆 Most Absent Employees")}
      <Table
        columns={[
          { key: "name",label: "Employee" },
          { key: "department_name",label: "Department" },
          { key: "total_approved",label: "Approved Leaves" },
          { key: "days_taken",label: "Days Absent" },
        ]}
        rows={absent}
      />

      {section("💰 Salary Ranking (Window Functions)")}
      <Table
        columns={[
          { key: "name",label: "Employee" },
          { key: "department_name",label: "Department" },
          { key: "salary",label: "Salary (₹)" },
          { key: "dept_rank",label: "Dept Rank" },
          { key: "overall_rank",label: "Overall Rank" },
        ]}
        rows={salary}
      />
    </Layout>
  );
};

export default HRReports;