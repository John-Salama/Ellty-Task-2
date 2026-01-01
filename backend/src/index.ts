import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.js";
import calculationsRoutes from "./routes/calculations.js";

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/calculations", calculationsRoutes);

// Health check
app.get("/api/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
