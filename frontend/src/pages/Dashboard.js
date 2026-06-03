import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    departments: 0,
    skills: 0,
    images: 0
  });

  const fetchStats = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/dashboard/stats"
      );

      setStats(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const cardStyle = {
    padding: "20px",
    margin: "10px",
    background: "#f5f5f5",
    borderRadius: "10px",
    width: "200px",
    textAlign: "center"
  };

  return (
   <div style={{ display: "flex", flexWrap: "wrap" }}>

  <Link
    to="/employees"
    style={{ textDecoration: "none", color: "inherit" }}
  >
    <div style={cardStyle}>
      <h3>Employees</h3>
      <h2>{stats.employees}</h2>
    </div>
  </Link>

  <div style={cardStyle}>
    <h3>Departments</h3>
    <h2>{stats.departments}</h2>
  </div>

  <div style={cardStyle}>
    <h3>Skills</h3>
    <h2>{stats.skills}</h2>
  </div>

  <div style={cardStyle}>
    <h3>Images</h3>
    <h2>{stats.images}</h2>
  </div>

</div>
  );
}

export default Dashboard;