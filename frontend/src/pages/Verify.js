import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

function Verify() {
  const { token } = useParams();
  const [message, setMessage] = useState("Verifying your email...");

  useEffect(() => {
    api.get(`/auth/verify-email/${token}`)
      .then((res) => setMessage(res.data.message))
      .catch((err) => setMessage(err.response?.data?.message || "Verification failed"));
  }, [token]);

  return (
    <div>
      <h2>{message}</h2>
      <Link to="/">Go to Login</Link>
    </div>
  );
}

export default Verify;