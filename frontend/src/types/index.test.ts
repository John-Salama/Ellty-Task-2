import { describe, it, expect } from "vitest";
import { operationSymbols, type OperationType } from "./index";

describe("Types", () => {
  it("should have correct operation symbols", () => {
    expect(operationSymbols.add).toBe("+");
    expect(operationSymbols.subtract).toBe("−");
    expect(operationSymbols.multiply).toBe("×");
    expect(operationSymbols.divide).toBe("÷");
  });

  it("should have all four operations", () => {
    const operations: OperationType[] = [
      "add",
      "subtract",
      "multiply",
      "divide",
    ];
    operations.forEach((op) => {
      expect(operationSymbols[op]).toBeDefined();
    });
  });
});
