import express from "express";

import cors from "cors";
import dotenvFlow from "dotenv-flow"; 
import logger from "./config/logger.js";
import router from "./routes/index.js";
import swaggerDocs from "./swagger.js";
import { createServer } from "http";
import cookieParser from "cookie-parser"

dotenvFlow.config();
const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;


app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  }),
);

app.use("/api", router);

app.get("/", async (req, res) => {
  res.send("Hello World! this is backend server c1se45");
});

//test other account


swaggerDocs(app, PORT);

server.listen(PORT,()=>{
     logger.info(`Express server running on port http://localhost:${PORT}/`);
}
)