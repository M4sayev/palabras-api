const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const errorHandler = require("./middleware/errorMiddleware.js");
const setupSwagger = require("./config/swagger.js");
const path = require("path");
const dictionaryRouter = require("./routes/dictionary.js");
const authenticationRouter = require("./routes/auth.js");
const { createClient } = require("redis");
const requireAuth = require("./middleware/requireAuth.js");
const morgan = require("morgan");
const logger = require("./config/logger.js");
const { stripAnsi } = require("./utils/utils.js");
require("dotenv").config();

const app = express();

setupSwagger(app);

const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,
};

app.use(
  morgan("dev", {
    stream: { write: (message) => logger.info(stripAnsi(message.trim())) },
  }),
);

app.use(express.static(path.join(__dirname, "public", "html")));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static(path.join(__dirname, "public", "scripts")));

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/dictionary", requireAuth, dictionaryRouter);
app.use("/api/v1/auth", authenticationRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  console.log(`Server is listening on port on http://localhost:${PORT}`);
});
