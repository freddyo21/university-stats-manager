import type { User } from "firebase/auth";
import type { LoginRequestDTO } from "../auth.types";

// Định nghĩa kiểu dữ liệu cho Context
export interface IFirebaseAuthContext {
    currentUser: User | null;
    loading: boolean;
    role: string;
    loginEmail: (data: LoginRequestDTO) => Promise<User>;
    logout: () => Promise<void>;
    getToken: () => Promise<string | null>;
    handleRememberMe: (isRemember: boolean) => Promise<void>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}