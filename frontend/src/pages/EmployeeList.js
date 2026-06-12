import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import Table from "../components/Table";
import Button from "../components/Button";
import { useAuth } from "../hooks/useAuth";
import api from "../api";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const { isAdmin } = useAuth();

  const fetch = async () => {
    try { setEmployees((await api.get("/employees")).data); }
    catch (err) { console.log(err); }
  };

  useEffect(() => { fetch(); }, []);

  const del = async (id) => {
    if (!window.confirm("Delete this employee? This cannot be undone.")) return;
    try { await api.delete(`/employees/${id}`); fetch(); }
    catch (err) { alert(err.response?.data?.message || "Delete failed"); }
  };

  return (
    <Layout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#1e293b", margin: 0 }}>👥 Employees</h2>
        {isAdmin && <Link to="/employees/create"><Button variant="success">+ Create Employee</Button></Link>}
      </div>
      <Table
        columns={[
          { key: "serial_no", label: "#" },
          { key: "name", label: "Name" },
          { key: "department_name",label: "Department" },
          { key: "designation",label: "Designation" },
          { key: "phone",label: "Phone" },
          { key: "salary",label: "Salary", render: (r) => r.salary ? `₹${Number(r.salary).toLocaleString()}` : "-" },
        ]}
        rows={employees.map((employee, index) => ({ ...employee, serial_no: index + 1 }))}
        actions={(r) => (
          <div style={{ display: "flex", gap: 6 }}>
            <Link to={`/employees/${r.id}`}><Button>View</Button></Link>
            {isAdmin && (
              <>
                <Link to={`/employees/${r.id}`} state={{ edit: true }}><Button variant="warning">Edit</Button></Link>
                <Button variant="danger" onClick={() => del(r.id)}>Delete</Button>
              </>
            )}
          </div>
        )}
      />
    </Layout>
  );
};

export default EmployeeList;
