import winston from "winston";
import path from "path";
import "winston-daily-rotate-file";

// Custom log levels
const customLevels = {
  levels: {
    error: 0,
    warn: 1,
    success: 2,
    info: 3,
    debug: 4,
  },
  colors: {
    error: "red",
    warn: "yellow",
    success: "green",
    info: "blue",
    debug: "gray",
  },
};

winston.addColors(customLevels.colors);

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Log formatter
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return stack
    ? `${timestamp} [${level.toUpperCase()}]: ${message}\n${stack}`
    : `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

// Rotating file for info/success/debug
const appRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(process.cwd(), "logs", "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  zippedArchive: true,
  level: "info",
});

// Rotating file for errors
const errorRotateTransport = new winston.transports.DailyRotateFile({
  filename: path.join(process.cwd(), "logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  maxFiles: "14d",
  zippedArchive: true,
  level: "error",
});

// Console transport
const consoleTransport = new winston.transports.Console({
  format: combine(colorize({ all: true }), logFormat),
});

// Create logger
const logger = winston.createLogger({
  levels: customLevels.levels,
  level: "info",
  format: combine(
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }),
    logFormat
  ),
  transports: [appRotateTransport, errorRotateTransport, consoleTransport],
});

export { logger };
