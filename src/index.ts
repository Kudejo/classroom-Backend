import('apminsight')
  .then(({ default: AgentAPI }) => AgentAPI.config())
  .catch(() => console.log('APM not available in this environment'));

import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subject.js";
import securityMiddleware from "./middleware/security.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";
import usersRouter from "./routes/users.js";
import classesRouter from "./routes/classes.js";

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

// Routes
app.use("/api/subjects", subjectsRouter);
app.use("/api/users", usersRouter);
app.use("/api/classes", classesRouter);
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Classroom API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
