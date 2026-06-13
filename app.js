const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorMiddleware.js");
const setupSwagger = require("./config/swagger.js");
const path = require("path");
const dictionaryRouter = require("./routes/dictionary.js");
const authenticationRouter = require("./routes/auth.js");
require("dotenv").config();

const app = express();

setupSwagger(app);

const corsOptions = {
  origin: "https://localhost:3174",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/dictionary", dictionaryRouter);
app.use("/api/v1/auth", authenticationRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  `Server is listening on port ${PORT}`;
});
