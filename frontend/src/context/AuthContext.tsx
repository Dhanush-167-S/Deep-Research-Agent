"use client";

import React, { createContext, useContext } from "react";
import { authClient, useSession } from "@/lib/auth";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  role?: string;
  plan?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: sessionData, isPending } = useSession();

  const user: UserProfile | null = sessionData?.user
    ? {
        id: sessionData.user.id,
        name: sessionData.user.name || sessionData.user.email.split("@")[0],
        email: sessionData.user.email,
        avatar_url: sessionData.user.image || undefined,
        role: "Senior Research Scientist",
        plan: "Pro AI Operating System",
      }
    : null;

  const token = sessionData?.session?.token || null;

  const login = async (email: string, password: string) => {
    const res = await authClient.signIn.email({
      email,
      password,
    });
    if (res.error) {
      throw new Error(res.error.message || "Invalid email or password.");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await authClient.signUp.email({
      name,
      email,
      password,
    });
    if (res.error) {
      throw new Error(res.error.message || "Registration failed.");
    }
  };

  const loginWithGoogle = async () => {
    const res = await authClient.signIn.social({
      provider: "google",
      callbackURL: "/dashboard",
    });
    if (res.error) {
      throw new Error(res.error.message || "Google OAuth sign-in failed.");
    }
  };

  const logout = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading: isPending,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

