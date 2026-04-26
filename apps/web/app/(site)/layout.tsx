import Link from "next/link"
import { redirect } from "next/navigation"

import { getSession } from "@/services/better-auth/auth-server"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/repositories", label: "Repositories", icon: "🗄️" },
  { href: "/folders", label: "Folders", icon: "📁" },
  { href: "/documents", label: "Documents", icon: "📄" },
  { href: "/workflows", label: "Workflows", icon: "⚙️" },
  { href: "/audit-logs", label: "Audit Trail", icon: "📋" },
  { href: "/submit-ticket", label: "Support Ticket", icon: "🎫" },
]

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">📦</span>
          <div>
            <div className="font-bold text-sm">OPAPRU EDMS</div>
            <div className="text-xs text-muted-foreground">Enterprise Document Management</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">{session.user?.email}</span>
          <Link href="/logout" className="text-sm text-muted-foreground hover:text-foreground">Sign out</Link>
        </div>
      </header>

      <div className="container py-6">
        <div className="grid min-h-[calc(100vh-8rem)] grid-cols-1 gap-6 md:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="bg-card text-card-foreground hidden rounded-xl border p-4 md:block h-fit">
            <nav className="space-y-0.5">
              {NAV_ITEMS.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="hover:bg-accent hover:text-accent-foreground flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium"
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  )
}
