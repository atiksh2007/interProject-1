import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const role = localStorage.getItem("role");

  const fetchEmployees = async () => {
    try {
      const res = await api.get("/employees");
      setEmployees(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchEmployees(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this employee?")) return;
    try {
      await api.delete(`/employees/${id}`);
      setEmployees(employees.filter((e) => e.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || "Delete failed");
    }
  };

  return (
    <div>
      <h2>Employees</h2>
      {role === "admin" && <Link to="/employees/create">+ Create Employee</Link>}

      <table border="1" cellPadding="8" style={{ width: "100%", marginTop: "10px" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Designation</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((emp) => (
            <tr key={emp.id}>
              <td>{emp.id}</td>
              <td>{emp.name}</td>
              <td>{emp.department_name}</td>
              <td>{emp.designation || "-"}</td>
              <td>{emp.phone || "-"}</td>
              <td>{emp.salary || "-"}</td>
              <td>
                <Link to={`/employees/${emp.id}`}>View</Link>
                {role === "admin" && (
                  <>
                    {" | "}
                    <Link to={`/employees/${emp.id}`} state={{ edit: true }}>Edit</Link>
                    {" | "}
                    <button onClick={() => handleDelete(emp.id)}>Delete</button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EmployeeList;