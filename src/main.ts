import dotenv from 'dotenv'
dotenv.config();
import express from "express"
import { logger } from "#lib/logger/logger.js";
import routes from "#features/routes.js"
import bodyParser from "body-parser";
import cors from "cors"
import compression from "compression"

const app = express();
const allowedOrigins = [
  "https://adaa-eight.vercel.app/", // For Frontend
  "http://localhost:3002",
];

app.use(compression())
app.use(
  cors({
    origin: (origin, callback) => {
      // allow requests with no origin (like mobile apps, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
