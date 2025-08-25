import { apiClient } from "@/lib/api";
import { AuthResponse, LoginCredentials, CreateUserInput, User } from "@/types";
import Cookies from "js-cookie";

export class AuthService {
  async forgotPassword(email: string): Promise<void> {
    await apiClient.post("/auth/forgot-password", { email });
  }
  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post("/auth/reset-password", { token, newPassword });
  }
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>(
      "/auth/login",
      credentials
    );
    console.log("Login response:", response);
    if (response.access_token) {
      Cookies.set("token", response.access_token, { expires: 7 });
      Cookies.set("user", JSON.stringify(response.user), { expires: 7 });
      Cookies.set("roles", JSON.stringify(response.user.roles), { expires: 7 });
      Cookies.set("permission", JSON.stringify(response.user.permissions), {
        expires: 7,
      });

      if (response.user.warehouse) {
        Cookies.set("warehouseId", response.user.warehouse.id, { expires: 7 });
      }
    }
    return response;
  }

  async register(data: CreateUserInput): Promise<User> {
    return await apiClient.post<User>("/auth/register", data);
  }

  async getProfile(): Promise<User> {
    return await apiClient.get<User>("/auth/profile");
  }

  logout(): void {
    Cookies.remove("token");
    Cookies.remove("user");
    Cookies.remove("permission");
    Cookies.remove("warehouseId");
    Cookies.remove("roles");
    window.location.href = "/login";
  }

  getCurrentUser(): AuthResponse["user"] | null {
    const userStr = Cookies.get("user");
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!Cookies.get("token");
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.roles?.includes(role) || false;
  }

  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions?.includes(permission) || false;
  }

  getWarehouseId(): string | null {
    return Cookies.get("warehouseId") || null;
  }
}

export const authService = new AuthService();
