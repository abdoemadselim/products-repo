import dotenv from 'dotenv'
dotenv.config();
import express from "express"
import { logger } from "#lib/logger/logger.js";
import routes from "#features/routes.js"
import bodyParser from "body-parser";

const app = express();
app.use(bodyParser.json())
app.use(routes)

const PORT = process.env.PROT || 3000;
app.listen(PORT, () =>
  logger.info(`Server started at port ${PORT} in ${process.env.NODE_ENV} mode`)
)
