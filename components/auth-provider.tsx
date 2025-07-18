"use client"

import type React from "react"

import { SessionProvider } from "next-auth/react"

interface AuthProviderProps {
  children: React.ReactNode
  session?: any
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <SessionProvider>{children}</SessionProvider>
}
