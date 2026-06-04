import { useEffect, useState } from "react";
import api from "../api";

function MySkills() {
  const [skills, setSkills] = useState([]);

  const fetchSkills = async () => {
    try {
      const res = await api.get("/employees/me/skills");
      setSkills(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => { fetchSkills(); }, []);

  const handleAdd = async (skillId) => {
    try {
      await api.post("/employees/me/skills", { skill_id: skillId });
      fetchSkills();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding skill");
    }
  };

  const handleRemove = async (skillId) => {
    try {
      await api.delete(`/employees/me/skills/${skillId}`);
      fetchSkills();
    } catch (err) {
      alert("Error removing skill");
    }
  };

  const assigned = skills.filter((s) => s.assigned);
  const available = skills.filter((s) => !s.assigned);

  return (
    <div>
      <h2>My Skills</h2>

      <h3>Your Current Skills</h3>
      {assigned.length === 0 ? (
        <p>No skills added yet</p>
      ) : (
        assigned.map((s) => (
          <div key={s.id}>
            <span>{s.skill_name}</span>
            <button onClick={() => handleRemove(s.id)}>Remove</button>
          </div>
        ))
      )}

      <h3>Available Skills</h3>
      {available.length === 0 ? (
        <p>You have all available skills!</p>
      ) : (
        available.map((s) => (
          <div key={s.id}>
            <span>{s.skill_name}</span>
            <button onClick={() => handleAdd(s.id)}>Add</button>
          </div>
        ))
      )}
    </div>
  );
}

export default MySkills;