const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const pool = require("../config/db");
const { verifyToken } = require("../middleware/auth");

const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Only JPEG/PNG images are allowed"), false);
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// POST /api/upload — employee uploads their own images (or admin uploads for any employee)
router.post("/upload", verifyToken, upload.array("images", 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const { employee_id } = req.body;
    if (!employee_id) {
      return res.status(400).json({ message: "employee_id is required" });
    }

    // Non-admin: verify the employee_id belongs to the requesting user
    if (req.user.role !== "admin") {
      const check = await pool.query(
        "SELECT id FROM employee_profiles WHERE id=$1 AND user_id=$2",
        [employee_id, req.user.id]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const saved = [];
    for (const file of req.files) {
      const imageUrl = `/uploads/${file.filename}`;
      const result = await pool.query(
        "INSERT INTO employee_images (employee_id, image_url) VALUES ($1,$2) RETURNING *",
        [employee_id, imageUrl]
      );
      saved.push(result.rows[0]);
    }

    res.json({ message: "Images uploaded successfully", images: saved });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/upload/:imageId — delete a specific image
router.delete("/upload/:imageId", verifyToken, async (req, res) => {
  try {
    const { imageId } = req.params;

    const img = await pool.query("SELECT * FROM employee_images WHERE id=$1", [imageId]);
    if (img.rows.length === 0) {
      return res.status(404).json({ message: "Image not found" });
    }

    // Non-admin: must own the employee profile
    if (req.user.role !== "admin") {
      const check = await pool.query(
        "SELECT ep.id FROM employee_profiles ep JOIN employee_images ei ON ep.id = ei.employee_id WHERE ei.id=$1 AND ep.user_id=$2",
        [imageId, req.user.id]
      );
      if (check.rows.length === 0) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    await pool.query("DELETE FROM employee_images WHERE id=$1", [imageId]);
    res.json({ message: "Image deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;