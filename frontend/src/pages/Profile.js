import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
   
    api.get("/employees")
      .then((res) => {
        if (res.data.length > 0) {
          setProfile(res.data[0]);
        }
      })
      .catch((err) => console.log(err));
  }, []);

  if (!profile) return <p>No employee profile found for your account.</p>;

  return (
    <div>
      <h2>My Profile</h2>
      <p><b>Name:</b> {profile.name}</p>
      <p><b>Email:</b> {profile.email}</p>
      <p><b>Department:</b> {profile.department_name}</p>
      <p><b>Designation:</b> {profile.designation || "-"}</p>
      <p><b>Phone:</b> {profile.phone || "-"}</p>
      <p><b>Address:</b> {profile.address || "-"}</p>
      <p><b>Salary:</b> {profile.salary || "-"}</p>

      <button onClick={() => navigate(`/employees/${profile.id}`)}>
        View Full Details / Upload Images
      </button>
    </div>
  );
}

export default Profile;