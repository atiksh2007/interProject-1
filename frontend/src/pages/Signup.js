import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function Signup() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    await axios.post(
      "http://localhost:5000/api/auth/signup",
      form
    );

    alert("Signup successful");
    navigate("/");

  } catch (error) {
    console.log("🔥 ERROR:", error.response?.data || error.message);
    alert("Signup failed");
  }
};

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <h2>Signup</h2>

        <input name="name" placeholder="Name" onChange={handleChange} />
        <input name="email" placeholder="Email" onChange={handleChange} />
        <input type="password" name="password" placeholder="Password" onChange={handleChange} />

        <button type="submit">Register</button>
      </form>

      {/* Navigation button */}
      <p>
        Already have an account?{" "}
        <Link to="/">Login</Link>
      </p>
    </div>
  );
}

export default Signup;