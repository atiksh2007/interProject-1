import { useState, useEffect } from "react";
import axios from "axios";

function CreateEmployee() {
  const [name, setName] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [skills, setSkills] = useState([]);
  const [files, setFiles] = useState([]);

  const [departments, setDepartments] = useState([]);
  const [allSkills, setAllSkills] = useState([]);


  useEffect(() => {
    fetchDepartments();
    fetchSkills();
  }, []);

  const fetchDepartments = async () => {
    const res = await axios.get("http://localhost:5000/api/departments");
    setDepartments(res.data);
  };

  const fetchSkills = async () => {
    const res = await axios.get("http://localhost:5000/api/skills");
    setAllSkills(res.data);
  };


  const handleSkillChange = (e) => {
    const value = parseInt(e.target.value);

    if (skills.includes(value)) {
      setSkills(skills.filter((s) => s !== value));
    } else {
      setSkills([...skills, value]);
    }
  };


  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const empRes = await axios.post(
        "http://localhost:5000/api/employees",
        {
          name,
          department_id: departmentId
        }
      );

      const employeeId = empRes.data.id;

      // 2. ASSIGN SKILLS
      for (let skillId of skills) {
        await axios.post(
          "http://localhost:5000/api/employees/skills",
          {
            employee_id: employeeId,
            skill_id: skillId
          }
        );
      }

      const formData = new FormData();

      for (let i = 0; i < files.length; i++) {
        formData.append("images", files[i]);
      }

      formData.append("employee_id", employeeId);

      await axios.post(
        "http://localhost:5000/api/employees/upload",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        }
      );

      alert("Employee created successfully!");

      setName("");
      setDepartmentId("");
      setSkills([]);
      setFiles([]);

    } catch (err) {
      console.log(err);
      alert("Error creating employee");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Create Employee</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Employee Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <br /><br />
        <select
          value={departmentId}
          onChange={(e) => setDepartmentId(e.target.value)}
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d.id} value={d.id}>
              {d.department_name}
            </option>
          ))}
        </select>

        <br /><br />
        <div>
          <h4>Skills</h4>

          {allSkills.map((s) => (
            <label key={s.id} style={{ marginRight: "10px" }}>
              <input
                type="checkbox"
                value={s.id}
                checked={skills.includes(s.id)}
                onChange={handleSkillChange}
              />
              {s.skill_name}
            </label>
          ))}
        </div>
        <br />
        <input
          type="file"
          multiple
          onChange={handleFileChange}
        />

        <br /><br />

        <button type="submit">
          Create Employee
        </button>
      </form>
    </div>
  );
}

export default CreateEmployee;