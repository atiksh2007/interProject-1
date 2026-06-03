const express = require("express");
const router = express.Router();
const pool = require("../config/db");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");


// ================= SIGNUP =================
const crypto = require("crypto");

router.post("/signup", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExist = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (userExist.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 1. create user
    const newUser = await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1,$2,$3) RETURNING *",
      [name, email, hashedPassword]
    );

    // 2. generate verification token
    const token = crypto.randomBytes(32).toString("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // 3. store token
    await pool.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [newUser.rows[0].id, token, expiresAt]
    );

    // 4. send verification link (for now return it)
    const link = `http://localhost:3000/verify/${token}`;

    res.status(201).json({
      message: "User created. Verify email.",
      verificationLink: link
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await pool.query(
      "SELECT * FROM users WHERE email=$1",
      [email]
    );

    if (user.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );

    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    // update last login
    await pool.query(
      "UPDATE users SET last_login = NOW() WHERE id=$1",
      [user.rows[0].id]
    );

    const token = jwt.sign(
      { id: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
router.post("/forgot-password", async (req, res) => {
  res.json({ message: "working" });
});


router.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  const record = await pool.query(
    "SELECT * FROM password_reset WHERE token=$1",
    [token]
  );

  if (record.rows.length === 0) {
    return res.status(400).json({ message: "Invalid token" });
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pool.query(
    "UPDATE users SET password=$1 WHERE id=$2",
    [hashedPassword, record.rows[0].user_id]
  );

  res.json({ message: "Password reset successful" });
});

router.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const record = await pool.query(
      "SELECT * FROM email_verification WHERE token=$1",
      [token]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    const data = record.rows[0];

    if (new Date() > data.expires_at) {
      return res.status(400).json({ message: "Token expired" });
    }

    // activate user
    await pool.query(
      "UPDATE users SET verified=true WHERE id=$1",
      [data.user_id]
    );

    // delete token
    await pool.query(
      "DELETE FROM email_verification WHERE token=$1",
      [token]
    );

    res.json({ message: "Email verified successfully" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



module.exports = router;