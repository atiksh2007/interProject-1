require("dotenv").config();
const path = require("path");
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const swaggerUi = require("swagger-ui-express");

const swaggerSpec = require("./config/swagger");

const authRoutes         = require("./routes/auth");
const employeeRoutes     = require("./routes/employees");
const departmentRoutes   = require("./routes/department");
const skillRoutes        = require("./routes/skills");
const dashboardRoutes    = require("./routes/dashboard");
const uploadRoutes       = require("./routes/upload");
const leaveRoutes        = require("./routes/leaves");
const leaveTypeRoutes    = require("./routes/leaveTypes");
const notificationRoutes = require("./routes/notifications");
const reportRoutes       = require("./routes/reports");


const assetRoutes         = require("./routes/assets");
const auditRoutes         = require("./routes/audit");
const advancedReportRoutes = require("./routes/reports.advanced");


const { apiLimiter, authLimiter } = require("./middleware/rateLimiter");

const app = express();

// Security & parsers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Rate limiting
app.use("/api/", apiLimiter);
app.use("/api/auth", authLimiter);

// Mount routes
app.use("/api/auth",          authRoutes);
app.use("/api/employees",     employeeRoutes);
app.use("/api/departments",   departmentRoutes);
app.use("/api/skills",        skillRoutes);
app.use("/api/dashboard",     dashboardRoutes);
app.use("/api",               uploadRoutes);
app.use("/api/leaves",        leaveRoutes);
app.use("/api/leave-types",   leaveTypeRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports",       reportRoutes);
app.use("/api/assets",  assetRoutes);
app.use("/api/audit",   auditRoutes);
app.use("/api/reports", advancedReportRoutes);



// Swagger docs
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get("/health", (req, res) => res.json({ status: "ok", time: new Date() }));

// Global error handler
app.use((err, req, res, next) => {
  console.error("ERR:", err.message);
  res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📘 Swagger docs:  http://localhost:${PORT}/api/docs`);
});
