import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function Dashboard() {
  const [stats, setStats] = useState({ employees: 0, departments: 0, skills: 0, images: 0 });
  const navigate = useNavigate();

  const role = localStorage.getItem("role");
  const name = localStorage.getItem("name");

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div>
      <h2>Welcome, {name} ({role})</h2>

      {/* Stats cards */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <div>
          <h3>Employees</h3>
          <p>{stats.employees}</p>
        </div>
        <div>
          <h3>Departments</h3>
          <p>{stats.departments}</p>
        </div>
        <div>
          <h3>Skills</h3>
          <p>{stats.skills}</p>
        </div>
        <div>
          <h3>Images</h3>
          <p>{stats.images}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav style={{ marginTop: "20px" }}>
        <Link to="/employees">Employees</Link> |{" "}
        <Link to="/profile">My Profile</Link> |{" "}

        {role === "employee" && (
  <Link to="/my-skills">My Skills</Link>
    )}
        {/* Admin-only links */}
        {role === "admin" && (
          <>
            <Link to="/employees/create">Create Employee</Link> |{" "}
            <Link to="/departments">Departments</Link> |{" "}
            <Link to="/skills">Skills</Link> |{" "}
          </>
        )}

        <button onClick={handleLogout}>Logout</button>
      </nav>
    </div>
  );
}

export default Dashboard;