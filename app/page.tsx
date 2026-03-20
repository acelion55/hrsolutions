"use client"

import { useState } from "react"
import { AuthProvider, useAuth } from "@/components/hr/auth-context"
import { LoginPage } from "@/components/hr/login-page"
import { HomeScreen } from "@/components/hr/home-screen"
import { CreateTaskForm } from "@/components/hr/create-task-form"
import { HRDashboard } from "@/components/hr/dashboard"
import { Analytics } from "@/components/hr/analytics"
import { getTickets } from "@/lib/data"
import { ArrowLeft, Ticket } from "lucide-react"
import { useAuth as useAuthInner } from "@/components/hr/auth-context"

type Screen = "home" | "create" | "advanced" | "report"

function AppContent() {
  const { isLoggedIn } = useAuth()
  const [screen, setScreen] = useState<Screen>("home")

  if (!isLoggedIn) return <LoginPage />

  if (screen === "create") {
    return (
      <CreateTaskForm
        onBack={() => setScreen("home")}
        onCreated={() => setScreen("home")}
      />
    )
  }

  if (screen === "advanced") {
    return <HRDashboard onBack={() => setScreen("home")} />
  }

  if (screen === "report") {
    return (
      <div className="min-h-screen bg-yellow-50 flex flex-col">
        <header className="bg-white border-b border-yellow-200 shadow-sm px-6 py-4 flex items-center gap-4 sticky top-0 z-10">
          <button onClick={() => setScreen("home")}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
              <Ticket className="h-4 w-4 text-white" />
            </div>
            <h1 className="text-sm font-bold text-gray-900">Usage Report</h1>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">
          <Analytics tickets={getTickets()} />
        </div>
      </div>
    )
  }

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
