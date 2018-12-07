import http from "http";
import express from "express";
import morgan from "morgan";
import cors from "cors";
import config from "./config.js";
import bodyParser from "body-parser"

let app = express();
app.server = http.createServer(app);

app.use(morgan("dev"));
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser.text());
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());
app.use(express.static("public"))

app.server.listen(process.env.PORT || config.port, () => {
    console.log(`Started on port ${app.server.address().port}`);
});

export default app;
