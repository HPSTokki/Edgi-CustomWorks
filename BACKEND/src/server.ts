import app from "./app.ts";
import 'dotenv/config';

const PORT = process.env.EXPRESS_PORT as string || 3000;

app.listen( PORT, () => {
    console.log(`Listening to port http://localhost:${PORT}`)
}).on("error", (err: Error) => {
    console.error("Failed to start server:", err);
})