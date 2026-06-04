import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import api from "../api";

function Reset() {
  const [searchParams] = useSearchParams();
  const [newPassword, setNewPassword] = useState("");
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/reset-password", { token, newPassword });
      alert(res.data.message);
      navigate("/");
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed");
    }
  };

  return (
    <div>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New Password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
    </div>
  );
}

export default Reset;