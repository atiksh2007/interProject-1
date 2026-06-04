const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    // role can be "admin" or "employee" — defaults to "employee"

    const existing = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const userRole = role === "admin" ? "admin" : "employee";

    const newUser = await pool.query(
      "INSERT INTO users (name, email, password, role) VALUES ($1,$2,$3,$4) RETURNING *",
      [name, email, hashedPassword, userRole]
    );

    // Create email verification token
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await pool.query(
      "INSERT INTO email_verification (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [newUser.rows[0].id, token, expiresAt]
    );

    res.status(201).json({
      message: "User created. Please verify your email.",
      verificationLink: `http://localhost:3000/verify/${token}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await pool.query("SELECT * FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    // if (!user.verified) {
    //   return res.status(400).json({ message: "Please verify your email first" });
    // }

    await pool.query("UPDATE users SET last_login=NOW() WHERE id=$1", [user.id]);

    // Include role in token so frontend and middleware can use it
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
      userId: user.id,
      name: user.name,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /api/auth/verify-email/:token
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

    await pool.query("UPDATE users SET verified=true WHERE id=$1", [data.user_id]);
    await pool.query("DELETE FROM email_verification WHERE token=$1", [token]);

    res.json({ message: "Email verified successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const result = await pool.query("SELECT id FROM users WHERE email=$1", [email]);
    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Email not found" });
    }

    const userId = result.rows[0].id;
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); 

    await pool.query("DELETE FROM password_reset WHERE user_id=$1", [userId]);

    await pool.query(
      "INSERT INTO password_reset (user_id, token, expires_at) VALUES ($1,$2,$3)",
      [userId, token, expiresAt]
    );

    res.json({
      message: "Password reset link generated",
      resetLink: `http://localhost:3000/reset?token=${token}`,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    const record = await pool.query(
      "SELECT * FROM password_reset WHERE token=$1",
      [token]
    );

    if (record.rows.length === 0) {
      return res.status(400).json({ message: "Invalid token" });
    }

    if (new Date() > record.rows[0].expires_at) {
      return res.status(400).json({ message: "Token expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await pool.query("UPDATE users SET password=$1 WHERE id=$2", [
      hashedPassword,
      record.rows[0].user_id,
    ]);

    await pool.query("DELETE FROM password_reset WHERE token=$1", [token]);

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;