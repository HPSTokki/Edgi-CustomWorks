import express from "express";
import 'dotenv/config';
import morgan from "morgan";
import routes from "./routes/index.ts";
import { authenticateToken as authMiddleware } from "./middleware/authMiddleware.ts";

const app = express();


app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

app.use("/api", routes);
app.get('/hello', (req, res) => {
    res.send('Hello, World!');
});

export default app;