"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/components/hr/auth-context"
import { HRDashboard } from "@/components/hr/dashboard"
import { LoginPage } from "@/components/hr/login-page"
import { HomeScreen } from "@/components/hr/home-screen"
import { CreateTaskForm } from "@/components/hr/create-task-form"
import { Analytics } from "@/components/hr/analytics"
import { getTickets } from "@/lib/data"

type Screen = "home" | "create" | "advanced" | "report"

function AppContent() {
  const { isLoggedIn } = useAuth()
  const [screen, setScreen] = useState<Screen>("home")

  // Reset to home whenever user logs in fresh
  if (!isLoggedIn) return <LoginPage />

  if (screen === "create") return (
    <CreateTaskForm onBack={() => setScreen("home")} onCreated={() => setScreen("home")} />
  )

  if (screen === "advanced") return (
    <HRDashboard onBack={() => setScreen("home")} onCreateTicket={() => setScreen("create")} />
  )

  if (screen === "report") return (
    <div className="min-h-screen bg-gray-950 flex flex-col">
      <header className="flex items-center gap-3 px-6 py-4 border-b border-gray-800 bg-gray-900/80">
        <button onClick={() => setScreen("home")} className="text-sm text-gray-400 hover:text-white transition-colors">← Back</button>
        <span className="text-sm font-semibold text-white">Usage Report</span>
      </header>
      <div className="flex-1 overflow-y-auto">
        <Analytics tickets={getTickets()} />
      </div>
    </div>
  )

  return (
    <HomeScreen
      onCreateTask={() => setScreen("create")}
      onAdvanced={() => setScreen("advanced")}
      onUsageReport={() => setScreen("report")}
    />
  )
}

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
