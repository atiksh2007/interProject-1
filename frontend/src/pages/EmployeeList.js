import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
function EmployeeList() {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/employees"
      );

      setEmployees(res.data);
    } catch (err) {
      console.log("Error fetching employees:", err);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee List</h2>

      <table
        border="1"
        cellPadding="10"
        style={{ width: "100%", marginTop: "20px" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Department</th>
            <th>Phone</th>
            <th>Salary</th>
            <th>Created At</th>
          </tr>
        </thead>

<tbody>
  {employees.map((emp) => (
    <tr key={emp.id}>
      <td>{emp.id}</td>
      <td>{emp.name}</td>
      <td>{emp.department_name}</td>
      <td>{emp.phone || "-"}</td>
      <td>{emp.salary || "-"}</td>
      <td>{emp.created_at}</td>

      <td>
        <Link to={`/employees/${emp.id}`}>
          <button>
            View Details
          </button>
        </Link>
      </td>
    </tr>
  ))}
</tbody>
      </table>
    </div>
  );
}

export default EmployeeList;