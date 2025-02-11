"use client"

import { QueryClient, QueryClientProvider as TanstackQueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import type React from "react" // Added import for React

export function QueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return <TanstackQueryClientProvider client={queryClient}>{children}</TanstackQueryClientProvider>
}

