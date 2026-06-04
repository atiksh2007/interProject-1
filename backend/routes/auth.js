const express = require("express");
const router = express.Router();
const pool = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { verifyToken, adminOnly } = require("../middleware/auth");
const validate = require("../middleware/validate");
const schemas = require("../utils/validators");
const UserService = require("../services/userService");

router.post("/signup", validate(schemas.signup), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
    if (exists.rows.length > 0) return res.status(400).json({ message: "Email already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const finalRole = ["admin", "hr", "manager", "employee"].includes(role) ? role : "employee";

    const r = await pool.query(
      `INSERT INTO users(name,email,password,role) VALUES($1,$2,$3,$4) RETURNING id`,
      [name, email, hashed, finalRole]
    );

    if (finalRole === "employee") {
      const p = await pool.query(
        `INSERT INTO employee_profiles(user_id) VALUES($1) RETURNING id`, [r.rows[0].id]
      );
      const types = await pool.query(`SELECT id, total_days FROM leave_types`);
      for (const t of types.rows) {
        await pool.query(
          `INSERT INTO leave_balance(employee_id, leave_type_id, available_days)
           VALUES($1,$2,$3) ON CONFLICT DO NOTHING`,
          [p.rows[0].id, t.id, t.total_days]
        );
      }
    }

    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(
      `INSERT INTO email_verification(user_id, token, expires_at) VALUES($1,$2,$3)`,
      [r.rows[0].id, token, new Date(Date.now() + 3600 * 1000)]
    );

    res.status(201).json({
      message: "User created. Please verify your email.",
      verificationLink: `http://localhost:3000/verify/${token}`,
    });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const r = await pool.query(`SELECT * FROM users WHERE email=$1`, [email]);
    if (r.rows.length === 0) return res.status(400).json({ message: "User not found" });
    const user = r.rows[0];

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Wrong password" });

    await pool.query(`UPDATE users SET last_login=NOW() WHERE id=$1`, [user.id]);
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    res.json({ message: "Login success", token, role: user.role, userId: user.id, name: user.name });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.get("/verify-email/:token", async (req, res) => {
  try {
    const r = await pool.query(`SELECT * FROM email_verification WHERE token=$1`, [req.params.token]);
    if (r.rows.length === 0) return res.status(400).json({ message: "Invalid token" });
    if (new Date() > r.rows[0].expires_at) return res.status(400).json({ message: "Expired" });
    await pool.query(`UPDATE users SET verified=true WHERE id=$1`, [r.rows[0].user_id]);
    await pool.query(`DELETE FROM email_verification WHERE token=$1`, [req.params.token]);
    res.json({ message: "Email verified" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const r = await pool.query(`SELECT id FROM users WHERE email=$1`, [email]);
    if (r.rows.length === 0) return res.status(400).json({ message: "Email not found" });
    const token = crypto.randomBytes(32).toString("hex");
    await pool.query(`DELETE FROM password_reset WHERE user_id=$1`, [r.rows[0].id]);
    await pool.query(
      `INSERT INTO password_reset(user_id, token, expires_at) VALUES($1,$2,$3)`,
      [r.rows[0].id, token, new Date(Date.now() + 3600 * 1000)]
    );
    res.json({ message: "Reset link generated", resetLink: `http://localhost:3000/reset?token=${token}` });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const r = await pool.query(`SELECT * FROM password_reset WHERE token=$1`, [token]);
    if (r.rows.length === 0) return res.status(400).json({ message: "Invalid token" });
    if (new Date() > r.rows[0].expires_at) return res.status(400).json({ message: "Expired" });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(`UPDATE users SET password=$1 WHERE id=$2`, [hashed, r.rows[0].user_id]);
    await pool.query(`DELETE FROM password_reset WHERE token=$1`, [token]);
    res.json({ message: "Password reset successful" });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post("/create-user", verifyToken, adminOnly, async (req, res) => {
  try { res.status(201).json({ message: "User created", user: await UserService.createUser(req.body) }); }
  catch (e) { res.status(400).json({ message: e.message }); }
});

router.get("/users", verifyToken, adminOnly, async (req, res) => {
  try { res.json(await UserService.listUsers()); }
  catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;
