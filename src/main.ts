import dotenv from 'dotenv'
dotenv.config();
import express from "express"
import bodyParser from "body-parser";
import cors from "cors"
import compression from "compression"

import { logger } from "#lib/logger/logger.js";
import routes from "#routes/routes.js"
import errorHandlerMiddleware from "#middlewares/error-handler.js";
import cookieParser from 'cookie-parser';

const app = express();
const allowedOrigins = [
  "https://adaa-eight.vercel.app", // For Frontend
  "https://eyego-task-production.up.railway.app",
  "http://localhost:3000",
  "https://products-repo.onrender.com",
  "https://eyego-task-docker-production.up.railway.app"
];

app.use(cookieParser())
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

// ----- Error Handler Middleware ----------
app.use(errorHandlerMiddleware)

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  logger.info(`Server started at port ${PORT} in ${process.env.NODE_ENV} mode`)
)
