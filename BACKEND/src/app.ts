import express from "express";
import type { Request, Response } from "express";
import { db } from "./db.ts";
import 'dotenv/config';
import morgan from "morgan";

const app = express();
const PORT: string = process.env.EXPRESS_PORT as string

app.use(express.json());
app.use(morgan("dev"));


app.listen( PORT, () => {
    console.log(`Listening to port http://localhost:${PORT}`)
}).on("error", (err: Error) => {
    console.error("Failed to start server:", err);
});

app.get("/Hello", (req: Request, res: Response) => {
    res.send("Hello, World!");
})