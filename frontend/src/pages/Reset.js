import { useState } from "react";
import axios from "axios";

function Reset() {
  const [form, setForm] = useState({
    token: "",
    newPassword: ""
  });

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        form
      );

      alert(res.data.message);

    } catch (err) {
      console.log(err.response?.data || err.message);
      alert("Reset failed");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="token"
          placeholder="Enter reset token"
          onChange={handleChange}
        />

        <input
          type="password"
          name="newPassword"
          placeholder="New Password"
          onChange={handleChange}
        />

        <button type="submit">
          Reset Password
        </button>
      </form>
    </div>
  );
}

export default Reset;