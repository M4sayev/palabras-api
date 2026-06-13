const express = require("express");
const cors = require("cors");
const dictionaryRouter = require("./routes/dictionary.js");
const errorHandler = require("./middleware/errorMiddleware.js");
require("dotenv").config();

const app = express();

const corsOptions = {
  origin: "https://localhost:3174",
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

app.use("/api/v1/dictionary", dictionaryRouter);

app.use(errorHandler);

const PORT = process.env.PORT ?? 5000;

app.listen(PORT, () => {
  `Server is listening on port ${PORT}`;
});
