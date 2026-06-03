require("dotenv").config();
const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const employeeRoutes = require("./routes/employees");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/uploads", express.static("uploads"));
const dashboardRoutes = require("./routes/dashboard");

app.use("/api/dashboard", dashboardRoutes);
app.listen(5000, () => {
  console.log("Server running on 5000");
});