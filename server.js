"use strict";

require("dotenv").config({ path: "./config.env" });

const express = require("express");

const hpp = require('hpp');
const cors = require('cors')
const helmet = require('helmet');

const cluster = require('cluster');
const os = require('os');
const compression = require('compression'); 

const connectDB = require("./config/db");
const fileUpload = require('express-fileupload');


const app = express();
connectDB();

const numCpu = os.cpus().length;

app.use(express.json({ limit: "1kb" }));
app.use(hpp());
app.use(cors());
app.use(helmet());

app.use(compression());
app.use(fileUpload());

// Connecting Router
app.use("/api/auth", require("./routes/auth"));

const PORT = process.env.PORT || 5000;

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
  const server = app.listen(PORT, () =>
    console.log(`Sever ${process.pid} running on port ${PORT}`)
  );
  process.on("unhandledRejection", (err, promise) => {
    console.log(`Logged Error: ${err.message}`);
    server.close(() => process.exit(1));
  });
}
