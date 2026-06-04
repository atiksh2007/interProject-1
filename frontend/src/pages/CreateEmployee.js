import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CreateEmployee() {
  const [form, setForm] = useState({
    user_id: "",
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
  });
  const [departments, setDepartments] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [files, setFiles] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data));
    api.get("/skills").then((r) => setAllSkills(r.data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const toggleSkill = (id) =>
    setSelectedSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
     
      const empRes = await api.post("/employees", form);
      const employeeId = empRes.data.id;

    
      for (const skillId of selectedSkills) {
        await api.post("/employees/skills", { employee_id: employeeId, skill_id: skillId });
      }

      // 3. Upload images if any
      if (files.length > 0) {
        const formData = new FormData();
        for (const f of files) formData.append("images", f);
        formData.append("employee_id", employeeId);
        await api.post("/upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      alert("Employee created successfully");
      navigate("/employees");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating employee");
    }
  };

  return (
    <div>
      <h2>Create Employee</h2>
      <form onSubmit={handleSubmit}>
        <input name="user_id" placeholder="User ID" onChange={handleChange} required />

        <select name="department_id" onChange={handleChange} required>
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>{d.department_name}</option>
          ))}
        </select>

        <input name="designation" placeholder="Designation" onChange={handleChange} />
        <input name="phone" placeholder="Phone" onChange={handleChange} />
        <input name="address" placeholder="Address" onChange={handleChange} />
        <input name="salary" placeholder="Salary" type="number" onChange={handleChange} />

        <div>
          <h4>Skills</h4>
          {allSkills.map((s) => (
            <label key={s.id} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                checked={selectedSkills.includes(s.id)}
                onChange={() => toggleSkill(s.id)}
              />
              {s.skill_name}
            </label>
          ))}
        </div>

        <div>
          <h4>Images</h4>
          <input type="file" multiple accept="image/jpeg,image/png"
            onChange={(e) => setFiles([...e.target.files])} />
        </div>

        <button type="submit">Create</button>
        <button type="button" onClick={() => navigate("/employees")}>Cancel</button>
      </form>
    </div>
  );
}

export default CreateEmployee;