"use strict";

require("dotenv").config({ path: "./config.env" });

const express = require("express");
const connectDB = require("./config/db");

const hpp = require('hpp');

const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression'); 


const app = express();
connectDB();


// Middleware
// Parse request
app.use(express.urlencoded({ extended: true, limit: "1kb" }));
app.use(express.json({ limit: "1kb" }));
app.use(hpp());

// Set headers and gzip response
app.use(cors());
app.use(helmet());
app.use(compression());

// Connecting Router
app.use("/api/auth", require("./routes/auth"));


//404 handler and pass to error handler
app.use((req, res, next) => {
  const err = new Error('Not found');
  err.status = 404;
  next(err);
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send(err.message);
});


// Server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
});
