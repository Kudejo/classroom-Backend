import express from "express";
import cors from "cors";
import subjectsRouter from "./routes/subject";

const app = express();
const PORT = 8000;

app.use(cors({
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

// Middleware
app.use(express.json());

app.use("/api/subjects", subjectsRouter);
// Routes
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Classroom API" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
