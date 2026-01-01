import { Router } from "express";
import { z } from "zod";
import db from "../db/database.js";
import { authMiddleware } from "../middleware/auth.js";
import { Calculation, CalculationTree } from "../types/index.js";

const router = Router();

const operationTypes = ["add", "subtract", "multiply", "divide"] as const;

const startingNumberSchema = z.object({
  value: z.number(),
});

const operationSchema = z.object({
  parentId: z.number(),
  operation: z.enum(operationTypes),
  operand: z.number(),
});

function calculateResult(
  parentValue: number,
  operation: string,
  operand: number
): number {
  switch (operation) {
    case "add":
      return parentValue + operand;
    case "subtract":
      return parentValue - operand;
    case "multiply":
      return parentValue * operand;
    case "divide":
      if (operand === 0) throw new Error("Division by zero");
      return parentValue / operand;
    default:
      throw new Error("Invalid operation");
  }
}

function buildTree(
  calculations: (Calculation & { username: string })[]
): CalculationTree[] {
  const map = new Map<number, CalculationTree>();
  const roots: CalculationTree[] = [];

  // Initialize all nodes
  for (const calc of calculations) {
    map.set(calc.id, { ...calc, children: [] });
  }

  // Build tree structure
  for (const calc of calculations) {
    const node = map.get(calc.id)!;
    if (calc.parent_id === null) {
      roots.push(node);
    } else {
      const parent = map.get(calc.parent_id);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  // Sort by created_at descending (newest first for roots)
  roots.sort(
    (a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return roots;
}

// Get all calculations as tree
router.get("/", (req, res) => {
  try {
    const calculations = db
      .prepare(
        `
        SELECT c.*, u.username 
        FROM calculations c 
        JOIN users u ON c.user_id = u.id 
        ORDER BY c.created_at ASC
      `
      )
      .all() as (Calculation & { username: string })[];

    const tree = buildTree(calculations);
    res.json(tree);
  } catch (error) {
    console.error("Get calculations error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create starting number (requires auth)
router.post("/start", authMiddleware, (req, res) => {
  try {
    const { value } = startingNumberSchema.parse(req.body);
    const userId = req.user!.userId;

    const result = db
      .prepare("INSERT INTO calculations (user_id, value) VALUES (?, ?)")
      .run(userId, value);

    const calculation = db
      .prepare(
        `
        SELECT c.*, u.username 
        FROM calculations c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
      `
      )
      .get(result.lastInsertRowid) as Calculation & { username: string };

    res.status(201).json(calculation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    console.error("Create starting number error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Add operation (requires auth)
router.post("/operate", authMiddleware, (req, res) => {
  try {
    const { parentId, operation, operand } = operationSchema.parse(req.body);
    const userId = req.user!.userId;

    // Get parent calculation
    const parent = db
      .prepare("SELECT * FROM calculations WHERE id = ?")
      .get(parentId) as Calculation | undefined;

    if (!parent) {
      res.status(404).json({ error: "Parent calculation not found" });
      return;
    }

    // Calculate result
    const value = calculateResult(parent.value, operation, operand);

    const result = db
      .prepare(
        "INSERT INTO calculations (user_id, parent_id, value, operation, operand) VALUES (?, ?, ?, ?, ?)"
      )
      .run(userId, parentId, value, operation, operand);

    const calculation = db
      .prepare(
        `
        SELECT c.*, u.username 
        FROM calculations c 
        JOIN users u ON c.user_id = u.id 
        WHERE c.id = ?
      `
      )
      .get(result.lastInsertRowid) as Calculation & { username: string };

    res.status(201).json(calculation);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors[0].message });
      return;
    }
    if (error instanceof Error && error.message === "Division by zero") {
      res.status(400).json({ error: "Division by zero is not allowed" });
      return;
    }
    console.error("Add operation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete calculation (requires auth and ownership)
router.delete("/:id", authMiddleware, (req, res) => {
  try {
    const calculationId = parseInt(req.params.id);
    const userId = req.user!.userId;

    // Get calculation to check ownership
    const calculation = db
      .prepare("SELECT * FROM calculations WHERE id = ?")
      .get(calculationId) as Calculation | undefined;

    if (!calculation) {
      res.status(404).json({ error: "Calculation not found" });
      return;
    }

    if (calculation.user_id !== userId) {
      res
        .status(403)
        .json({ error: "Not authorized to delete this calculation" });
      return;
    }

    // Delete the calculation and all its children (cascade)
    db.prepare("DELETE FROM calculations WHERE id = ?").run(calculationId);

    res.json({ message: "Calculation deleted successfully" });
  } catch (error) {
    console.error("Delete calculation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
