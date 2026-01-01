import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import db from "../db/database.js";
import { generateToken } from "../middleware/auth.js";
import { User } from "../types/index.js";

const router = Router();

const authSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(6).max(100),
});

// Register
router.post("/register", async (req, res) => {
  try {
    const { username, password } = authSchema.parse(req.body);

    // Check if user exists
    const existingUser = db
      .prepare("SELECT id FROM users WHERE username = ?")
      .get(username);

    if (existingUser) {
      res.status(400).json({ error: "Username already exists" });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run(username, hashedPassword);

    const token = generateToken({
      userId: result.lastInsertRowid as number,
      username,
    });

    res.status(201).json({
      token,
      user: {
        id: result.lastInsertRowid,
        username,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = authSchema.parse(req.body);

    // Find user
    const user = db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as User | undefined;

    if (!user) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }

    const token = generateToken({
      userId: user.id,
      username: user.username,
    });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
