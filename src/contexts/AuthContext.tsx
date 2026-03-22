"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getPocketBase, clearPocketBase } from "@/lib/pocketbase";
import type { RecordModel } from "pocketbase";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = () => {
      try {
        const pb = getPocketBase();
        if (pb.authStore.isValid && pb.authStore.model) {
          const model = pb.authStore.model as RecordModel;
          setUser({
            id: model.id,
            email: model.email,
            name: model.name,
          });
        }
      } catch (err) {
        console.error("Auth initialization error:", err);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const pb = getPocketBase();
      const authData = await pb
        .collection("users")
        .authWithPassword(email, password);

      setUser({
        id: authData.record.id,
        email: authData.record.email,
        name: authData.record.name,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setError(null);
    setIsLoading(true);

    try {
      const pb = getPocketBase();

      // Create user
      await pb.collection("users").create({
        email,
        password,
        passwordConfirm: password,
        name: name || email.split("@")[0],
      });

      // Login after registration
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    clearPocketBase();
    setUser(null);
    setError(null);
  };

  const clearError = () => setError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        error,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
