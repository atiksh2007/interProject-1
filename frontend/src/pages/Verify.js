import { useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

function Verify() {
  const { token } = useParams();

  useEffect(() => {
    axios
      .get(`http://localhost:5000/api/auth/verify-email/${token}`)
      .then((res) => alert(res.data.message))
      .catch((err) => alert("Verification failed"));
  }, [token]);

  return <h2>Verifying your email...</h2>;
}

export default Verify;