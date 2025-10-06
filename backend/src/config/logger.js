import { createLogger, transports, format } from "winston";
import LokiTransport from "winston-loki";
import DailyRotateFile from "winston-daily-rotate-file";

const isDev = process.env.NODE_ENV === "development";

const fileFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message }) => {
    return `[${timestamp}] ${level}: ${message}`;
  }),
);

const logger = createLogger({
  level: "info",
  transports: [
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ timestamp, level, message }) => {
          return `[${timestamp}] ${level}: ${message}`;
        }),
      ),
    }),

    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "14d",
      format: fileFormat,
    }),

    new DailyRotateFile({
      filename: "logs/error-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      level: "error",
      zippedArchive: true,
      maxSize: "20m",
      maxFiles: "30d",
      format: fileFormat,
    }),

    ...(!isDev
      ? [
          new LokiTransport({
          host: "http://localhost:3100",
            labels: {
              app: "backend",
              instance: process.env.HOST_NAME || "unknown",
              env: process.env.NODE_ENV || "test",
            },
            json: true,
            replaceTimestamp: true,
            format: format.json(),
            onConnectionError: (err) => console.error("Loki error:", err),
          }),
        ]
      : []),
  ],
});

export default logger;