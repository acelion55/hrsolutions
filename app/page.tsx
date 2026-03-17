"use client"

import { AuthProvider } from "@/components/hr/auth-context"
import { HRDashboard } from "@/components/hr/dashboard"

export default function Home() {
  return (
    <AuthProvider>
      <HRDashboard />
    </AuthProvider>
  )
}
