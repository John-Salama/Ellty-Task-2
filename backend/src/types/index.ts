export interface User {
  id: number;
  username: string;
  password: string;
  created_at: string;
}

export interface Calculation {
  id: number;
  user_id: number;
  parent_id: number | null;
  value: number;
  operation: string | null;
  operand: number | null;
  created_at: string;
}

export interface CalculationTree extends Calculation {
  username: string;
  children: CalculationTree[];
}

export interface JwtPayload {
  userId: number;
  username: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
