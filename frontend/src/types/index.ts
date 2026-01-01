export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  value: number;
  operation: string | null;
  operand: number | null;
  created_at: string;
  username: string;
}

export interface CalculationTree extends Calculation {
  children: CalculationTree[];
}

export type OperationType = "add" | "subtract" | "multiply" | "divide";

export const operationSymbols: Record<OperationType, string> = {
  add: "+",
  subtract: "−",
  multiply: "×",
  divide: "÷",
};
