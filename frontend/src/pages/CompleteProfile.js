import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function CompleteProfile() {
  const [form, setForm] = useState({
    department_id: "",
    phone: "",
    address: "",
    designation: "",
    salary: "",
  });
  const [departments, setDepartments] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/departments").then((r) => setDepartments(r.data));
  }, []);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/employees/me", form);
      alert("Profile created successfully!");
      navigate("/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Error creating profile");
    }
  };

  return (
    <div>
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit}>
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

        <button type="submit">Save Profile</button>
      </form>
    </div>
  );
}

export default CompleteProfile;