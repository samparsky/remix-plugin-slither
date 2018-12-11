import http from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import chalk from "chalk"
import {port, corsHeaders, slitherVersion } from "./config.js";
import { analyzeRouter } from "./routes"
import { isValid, exec, checkSlitherVersion } from "./helper"

let app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));
app.use(cors({
	exposedHeaders: corsHeaders
}));

app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(express.json({limit: '50mb'}));
app.use(express.static("public"))

app.use(function(err, req, res, next) {
    console.log(err);
    res.status(err.status || 500).json({ error: err.message});  
});

app.post('/analyze', analyzeRouter);

module.exports = app;
