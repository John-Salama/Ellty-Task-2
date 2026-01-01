import type {
  AuthResponse,
  CalculationTree,
  Calculation,
  OperationType,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

class ApiService {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem("token");
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers["Authorization"] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }

    return data;
  }

  // Auth
  async register(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  async login(username: string, password: string): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
    this.setToken(response.token);
    return response;
  }

  logout() {
    this.setToken(null);
  }

  // Calculations
  async getCalculations(): Promise<CalculationTree[]> {
    return this.request<CalculationTree[]>("/calculations");
  }

  async createStartingNumber(value: number): Promise<Calculation> {
    return this.request<Calculation>("/calculations/start", {
      method: "POST",
      body: JSON.stringify({ value }),
    });
  }

  async addOperation(
    parentId: number,
    operation: OperationType,
    operand: number
  ): Promise<Calculation> {
    return this.request<Calculation>("/calculations/operate", {
      method: "POST",
      body: JSON.stringify({ parentId, operation, operand }),
    });
  }

  async deleteCalculation(id: number): Promise<void> {
    await this.request<{ message: string }>(`/calculations/${id}`, {
      method: "DELETE",
    });
  }
}

export const api = new ApiService();
