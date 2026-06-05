const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HRMS Leave Management API",
      version: "1.0.0",
      description: "Employee Leave Management & Approval Workflow System",
    },
    servers: [{ url: "http://localhost:5000/api" }],
    components: {
      securitySchemes: {
        bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ["./routes/*.js"],
};

module.exports = swaggerJsdoc(options);
