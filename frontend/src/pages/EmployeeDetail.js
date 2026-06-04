import { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import api from "../api";

function EmployeeDetail() {
  const { id } = useParams();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [editMode, setEditMode] = useState(location.state?.edit || false);
  const [editForm, setEditForm] = useState({});
  const [departments, setDepartments] = useState([]);
  const [files, setFiles] = useState([]);

  const role = localStorage.getItem("role");

  const fetchEmployee = async () => {
    try {
      const res = await api.get(`/employees/${id}`);
      setData(res.data);
      setEditForm({
        department_id: res.data.employee.department_id,
        phone: res.data.employee.phone || "",
        address: res.data.employee.address || "",
        designation: res.data.employee.designation || "",
        salary: res.data.employee.salary || "",
      });
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployee();
    if (role === "admin") {
      api.get("/departments").then((r) => setDepartments(r.data));
    }
  }, [id]);

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/employees/${id}`, editForm);
      alert("Employee updated");
      setEditMode(false);
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.message || "Update failed");
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!files.length) return alert("Please select images");

    const formData = new FormData();
    for (const f of files) formData.append("images", f);
    formData.append("employee_id", id);

    try {
      await api.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Images uploaded");
      setFiles([]);
      fetchEmployee();
    } catch (err) {
      alert(err.response?.data?.message || "Upload failed");
    }
  };

  const handleDeleteImage = async (imageId) => {
    if (!window.confirm("Delete this image?")) return;
    try {
      await api.delete(`/upload/${imageId}`);
      fetchEmployee();
    } catch (err) {
      alert("Delete failed");
    }
  };

  if (!data) return <p>Loading...</p>;

  const { employee, skills, images } = data;

  return (
    <div>
      <h2>Employee Detail</h2>

      {!editMode ? (
        <div>
          <p><b>Name:</b> {employee.name}</p>
          <p><b>Email:</b> {employee.email}</p>
          <p><b>Designation:</b> {employee.designation || "-"}</p>
          <p><b>Department:</b> {employee.department_name}</p>
          <p><b>Phone:</b> {employee.phone || "-"}</p>
          <p><b>Address:</b> {employee.address || "-"}</p>
          <p><b>Salary:</b> {employee.salary || "-"}</p>
          {role === "admin" && (
            <button onClick={() => setEditMode(true)}>Edit</button>
          )}
        </div>
      ) : (
        <form onSubmit={handleEditSubmit}>
          <select
            value={editForm.department_id}
            onChange={(e) => setEditForm({ ...editForm, department_id: e.target.value })}
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.department_name}</option>
            ))}
          </select>
          <input placeholder="Designation" value={editForm.designation}
            onChange={(e) => setEditForm({ ...editForm, designation: e.target.value })} />
          <input placeholder="Phone" value={editForm.phone}
            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} />
          <input placeholder="Address" value={editForm.address}
            onChange={(e) => setEditForm({ ...editForm, address: e.target.value })} />
          <input placeholder="Salary" value={editForm.salary}
            onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
          <button type="submit">Save</button>
          <button type="button" onClick={() => setEditMode(false)}>Cancel</button>
        </form>
      )}

      {/* Skills */}
      <h3>Skills</h3>
      {skills.length === 0 ? (
        <p>No skills assigned</p>
      ) : (
        skills.map((s) => <span key={s.id} style={{ marginRight: "8px" }}>{s.skill_name}</span>)
      )}


      <h3>Images</h3>
      {images.length === 0 ? (
        <p>No images uploaded</p>
      ) : (
        images.map((img) => (
          <div key={img.id} style={{ display: "inline-block", marginRight: "10px" }}>
            <img
              src={`http://localhost:5000${img.image_url}`}
              alt="employee"
              style={{ width: "120px", display: "block" }}
            />
            <button onClick={() => handleDeleteImage(img.id)}>Delete</button>
          </div>
        ))
      )}

      <h3>Upload Images</h3>
      <form onSubmit={handleUpload}>
        <input
          type="file"
          multiple
          accept="image/jpeg,image/png"
          onChange={(e) => setFiles([...e.target.files])}
        />
        <button type="submit">Upload</button>
      </form>
    </div>
  );
}

export default EmployeeDetail;