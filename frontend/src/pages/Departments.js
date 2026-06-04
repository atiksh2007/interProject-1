import { useEffect, useState } from "react";
import api from "../api";

function Departments() {
  const [departments, setDepartments] = useState([]);
  const [name, setName] = useState("");

  const fetchDepartments = () =>
    api.get("/departments").then((r) => setDepartments(r.data));

  useEffect(() => { fetchDepartments(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/departments", { department_name: name });
      setName("");
      fetchDepartments();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this department?")) return;
    try {
      await api.delete(`/departments/${id}`);
      fetchDepartments();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h2>Departments</h2>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Department Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {departments.map((d) => (
          <li key={d.id}>
            {d.department_name}{" "}
            <button onClick={() => handleDelete(d.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Departments;