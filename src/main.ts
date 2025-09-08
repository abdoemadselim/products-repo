import dotenv from 'dotenv'
dotenv.config();
import express from "express"
import { logger } from "#lib/logger/logger.js";
import routes from "#features/routes.js"
import bodyParser from "body-parser";
import cors from "cors"

const app = express();
const allowedOrigins = [
  "https://mukhtasar.pro", // For Frontend
  "https://www.mukhtasar.pro", // For Frontend
  "https://api.mukhtasar.pro", // For swagger
  "http://localhost:3002",
];

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(bodyParser.json())
app.use(routes)

const PORT = process.env.PROT || 3000;
app.listen(PORT, () =>
  logger.info(`Server started at port ${PORT} in ${process.env.NODE_ENV} mode`)
)
