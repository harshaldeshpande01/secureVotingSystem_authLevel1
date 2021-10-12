require("dotenv").config({ path: "./config.env" });

const express = require("express");
const cors = require('cors')
const helmet = require('helmet');
const csurf = require('csurf')

const connectDB = require("./config/db");
const errorHandler = require("./middleware/error");
const fileUpload = require('express-fileupload');


const app = express();
connectDB();

app.use(express.json());
app.use(cors());
app.use(helmet());
csrfProtection = csrf({ cookie: false })
app.use(fileUpload());

app.get("/", (req, res, next) => {
  res.send("Api running");
});

// Connecting Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/private", require("./routes/private"));

// Error Handler Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () =>
  console.log(`Sever running on port ${PORT}`)
);

process.on("unhandledRejection", (err, promise) => {
  console.log(`Logged Error: ${err.message}`);
  server.close(() => process.exit(1));
});
