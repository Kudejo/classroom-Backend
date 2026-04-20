import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subject";
import securityMiddleware from "./middleware/security";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth";

const app = express();
const PORT = 8000;

if (!process.env.FRONTEND_URL) { throw new Error('FRONTEND_URL is not defined'); }

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.all('/api/auth/*splat', toNodeHandler(auth));

// Middleware
app.use(express.json());
app.use(securityMiddleware);

app.use("/api/subjects", subjectsRouter);
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Classroom API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
