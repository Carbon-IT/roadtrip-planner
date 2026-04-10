import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { serve, setup } from "swagger-ui-express";
import { parse } from "yaml";
import authRouter from "./controllers/auth.controller.js";
import countriesRouter from "./controllers/countries.controller.js";
import roadtripRouter from "./controllers/roadtrip.controller.js";
import Roadtrip from "./model/roadtrip.model.js";

const { json } = bodyParser;

const PORT = 3000;
const dataFilePath = join(import.meta.dirname, "../data/roadtrip.json");

// ---------- Env validation ---------- //

const requiredEnv = ["ACCESS_TOKEN_SECRET", "LOGIN", "PASSWORD"] as const;

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`Missing ${key} in .env file`);
    process.exit(1);
  }
}

// ---------- Bootstrap ---------- //

if (!existsSync(dataFilePath)) {
  writeFileSync(dataFilePath, JSON.stringify(new Roadtrip([]), null, 2), "utf8");
  console.log("roadtrip.json created with initial empty roadtrip.");
}

const swaggerSpec = parse(readFileSync(join(import.meta.dirname, "../swagger.yml"), "utf8")) as object;

// ---------- App ---------- //

const app = express();

app.use(json());
app.use(cors());

app.use("/api", authRouter);
app.use("/api/countries", countriesRouter);
app.use("/api/roadtrip", roadtripRouter);
app.use("/api-docs", serve, setup(swaggerSpec, { explorer: true }));

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
