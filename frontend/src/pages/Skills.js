import { useEffect, useState } from "react";
import api from "../api";

function Skills() {
  const [skills, setSkills] = useState([]);
  const [name, setName] = useState("");

  const fetchSkills = () =>
    api.get("/skills").then((r) => setSkills(r.data));

  useEffect(() => { fetchSkills(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post("/skills", { skill_name: name });
      setName("");
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this skill?")) return;
    try {
      await api.delete(`/skills/${id}`);
      fetchSkills();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div>
      <h2>Skills</h2>

      <form onSubmit={handleAdd}>
        <input
          placeholder="Skill Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {skills.map((s) => (
          <li key={s.id}>
            {s.skill_name}{" "}
            <button onClick={() => handleDelete(s.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Skills;