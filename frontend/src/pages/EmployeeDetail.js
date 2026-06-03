import { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function EmployeeDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);

  const fetchEmployee = async () => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/employees/${id}`
      );

      setData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, []);

  if (!data) return <h3>Loading...</h3>;

  const { employee, skills, images } = data;

  return (
    <div style={{ padding: "20px" }}>
      <h2>Employee Detail</h2>
      <div style={{ marginBottom: "20px" }}>
        <h3>{employee.designation}</h3>

        <p><b>ID:</b> {employee.id}</p>
        <p><b>Department:</b> {employee.department_id}</p>
        <p><b>Phone:</b> {employee.phone}</p>
        <p><b>Address:</b> {employee.address}</p>
        <p><b>Salary:</b> {employee.salary}</p>
        <p><b>Created:</b> {employee.created_at}</p>
      </div>
      <div style={{ marginBottom: "20px" }}>
        <h3>Skills</h3>

        {skills.length === 0 ? (
          <p>No skills assigned</p>
        ) : (
          skills.map((s, i) => (
            <span
              key={i}
              style={{
                padding: "5px 10px",
                marginRight: "5px",
                background: "#ddd",
                borderRadius: "5px"
              }}
            >
              {s.skill_name}
            </span>
          ))
        )}
      </div>
      <div>
        <h3>Images</h3>

        {images.length === 0 ? (
          <p>No images uploaded</p>
        ) : (
          images.map((img) => (
            <img
              key={img.id}
              src={`http://localhost:5000${img.image_url}`}
              alt="employee"
              style={{
                width: "150px",
                marginRight: "10px",
                borderRadius: "10px"
              }}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default EmployeeDetail;