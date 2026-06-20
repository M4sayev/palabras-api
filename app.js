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
require("dotenv").config();

const app = express();

const client = createClient({
  url: process.env.REDIS_URL,
});

setupSwagger(app);

const corsOptions = {
  origin: "http://127.0.0.1:5500", // Live Server's actual origin — check the exact port/host it uses
  credentials: true,
};

app.use(express.static(path.join(__dirname, "public")));

app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOptions));

app.use("/api/v1/dictionary", requireAuth, dictionaryRouter);
app.use("/api/v1/auth", authenticationRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  `Server is listening on port ${PORT}`;
});
