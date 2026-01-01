import { describe, it, expect, beforeEach, afterEach } from "vitest";
import request from "supertest";
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Test database setup
const testDbPath = path.join(__dirname, "test.db");

function createTestApp() {
  // Clean up previous test db
  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const db = new Database(testDbPath);
  db.pragma("foreign_keys = ON");

  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS calculations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      parent_id INTEGER DEFAULT NULL,
      value REAL NOT NULL,
      operation TEXT DEFAULT NULL,
      operand REAL DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (parent_id) REFERENCES calculations(id)
    );
  `);

  const app = express();
  app.use(cors());
  app.use(express.json());

  // Health check
  app.get("/api/health", (_, res) => {
    res.json({ status: "ok" });
  });

  return { app, db };
}

describe("API Health Check", () => {
  let app: express.Express;
  let db: Database.Database;

  beforeEach(() => {
    const setup = createTestApp();
    app = setup.app;
    db = setup.db;
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("should return ok status", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});

describe("Database Operations", () => {
  let db: Database.Database;

  beforeEach(() => {
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }

    db = new Database(testDbPath);
    db.pragma("foreign_keys = ON");

    db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS calculations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        parent_id INTEGER DEFAULT NULL,
        value REAL NOT NULL,
        operation TEXT DEFAULT NULL,
        operand REAL DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (parent_id) REFERENCES calculations(id)
      );
    `);
  });

  afterEach(() => {
    db.close();
    if (fs.existsSync(testDbPath)) {
      fs.unlinkSync(testDbPath);
    }
  });

  it("should create a user", () => {
    const result = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run("testuser", "hashedpassword");

    expect(result.lastInsertRowid).toBe(1);
  });

  it("should not allow duplicate usernames", () => {
    db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
      "testuser",
      "hashedpassword"
    );

    expect(() => {
      db.prepare("INSERT INTO users (username, password) VALUES (?, ?)").run(
        "testuser",
        "anotherpassword"
      );
    }).toThrow();
  });

  it("should create a starting calculation", () => {
    const userResult = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run("testuser", "hashedpassword");

    const calcResult = db
      .prepare("INSERT INTO calculations (user_id, value) VALUES (?, ?)")
      .run(userResult.lastInsertRowid, 42);

    expect(calcResult.lastInsertRowid).toBe(1);

    const calc = db
      .prepare("SELECT * FROM calculations WHERE id = ?")
      .get(calcResult.lastInsertRowid) as { value: number };

    expect(calc.value).toBe(42);
  });

  it("should create a child calculation with operation", () => {
    const userResult = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run("testuser", "hashedpassword");

    const parentResult = db
      .prepare("INSERT INTO calculations (user_id, value) VALUES (?, ?)")
      .run(userResult.lastInsertRowid, 10);

    const childResult = db
      .prepare(
        "INSERT INTO calculations (user_id, parent_id, value, operation, operand) VALUES (?, ?, ?, ?, ?)"
      )
      .run(
        userResult.lastInsertRowid,
        parentResult.lastInsertRowid,
        15,
        "add",
        5
      );

    expect(childResult.lastInsertRowid).toBe(2);

    const child = db
      .prepare("SELECT * FROM calculations WHERE id = ?")
      .get(childResult.lastInsertRowid) as {
      value: number;
      operation: string;
      operand: number;
    };

    expect(child.value).toBe(15);
    expect(child.operation).toBe("add");
    expect(child.operand).toBe(5);
  });
});

describe("Calculation Logic", () => {
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

  it("should add correctly", () => {
    expect(calculateResult(10, "add", 5)).toBe(15);
  });

  it("should subtract correctly", () => {
    expect(calculateResult(10, "subtract", 3)).toBe(7);
  });

  it("should multiply correctly", () => {
    expect(calculateResult(10, "multiply", 4)).toBe(40);
  });

  it("should divide correctly", () => {
    expect(calculateResult(10, "divide", 2)).toBe(5);
  });

  it("should throw on division by zero", () => {
    expect(() => calculateResult(10, "divide", 0)).toThrow("Division by zero");
  });

  it("should throw on invalid operation", () => {
    expect(() => calculateResult(10, "invalid", 5)).toThrow(
      "Invalid operation"
    );
  });

  it("should handle negative numbers", () => {
    expect(calculateResult(-10, "add", 5)).toBe(-5);
    expect(calculateResult(10, "subtract", 15)).toBe(-5);
    expect(calculateResult(-5, "multiply", -3)).toBe(15);
  });

  it("should handle decimal numbers", () => {
    expect(calculateResult(10, "divide", 4)).toBe(2.5);
    expect(calculateResult(0.1, "add", 0.2)).toBeCloseTo(0.3);
  });
});
