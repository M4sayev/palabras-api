const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const swaggerOptions = {
  withCredentials: true,
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Dictionary API",
      version: "1.0.0",
      description: "API documentation for words, meanings, and categories",
    },
    servers: [
      {
        url: "http://localhost:3000/api/v1",
      },
    ],
  },
  apis: ["./routes/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

const setupSwagger = (app) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};

module.exports = setupSwagger;
