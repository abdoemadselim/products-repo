import winston, { transports, format } from "winston"
import path from "path"

export const LOG_TYPE = {
  ERROR: "error",
  WARN: "warn",
  INFO: "info",
  DEBUG: "debug"
}

export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: format.combine(
    format.timestamp(),
    format.json()
  ),
  exceptionHandlers: [
    new transports.Console({ level: "error" }),
    new transports.File({ filename: path.join("logs", "exceptions.log") })
  ],
  transports: [
    new transports.Console({ level: "error" }),
    new transports.File({ filename: path.join("logs", "combined.log") }),
    new transports.File({ filename: path.join("logs", "errors.log"), level: 'error' })
  ]
});

export function log<T extends { message: string }>(level: string, meta: T): void {
  logger.log({
    level,
    ...meta
  })
}