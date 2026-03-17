import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'HR Ticket Management',
  description: 'Production-grade HR ticket management system with role-based access control',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className={`${geist.className} antialiased bg-gray-950 overflow-hidden`}>
        {children}
      </body>
    </html>
  )
}
