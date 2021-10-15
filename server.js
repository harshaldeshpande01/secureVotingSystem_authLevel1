"use strict";

require("dotenv").config({ path: "./config.env" });

const express = require("express");
const connectDB = require("./config/db");

const cluster = require('cluster');
const os = require('os');

const hpp = require('hpp');

const cors = require('cors')
const helmet = require('helmet');
const compression = require('compression'); 


const app = express();
connectDB();


// Middleware
// Parse request
app.use(express.json({ limit: "1kb" }));
app.use(express.urlencoded({ extended: true }));
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
const numCpu = os.cpus().length;

if(cluster.isMaster) {
  for(let i=0; i<numCpu; i++) {
    cluster.fork()
  }
  cluster.on('exit', (worker, _code, _signal) => {
    console.log(`Worker ${worker.process.pid} dies`);
    cluster.fork();
  })
} 
else {
  const server = app.listen(PORT);
  // , () =>
  //   console.log(`Server ${process.pid} running on port ${PORT}`)
  // );
  process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}
