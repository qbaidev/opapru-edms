"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Stats { repositories: number; folders: number; documents: number; workflows: number; auditLogs: number }

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats>({ repositories: 0, folders: 0, documents: 0, workflows: 0, auditLogs: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [repos, fols, docs, wfs, logs] = await Promise.all([
          fetch(`${API}/${V}/repositories`).then(r => r.json()),
          fetch(`${API}/${V}/folders`).then(r => r.json()),
          fetch(`${API}/${V}/documents`).then(r => r.json()),
          fetch(`${API}/${V}/workflows`).then(r => r.json()),
          fetch(`${API}/${V}/audit-logs?limit=200`).then(r => r.json()),
        ])
        setStats({
          repositories: Array.isArray(repos) ? repos.length : 0,
          folders: Array.isArray(fols) ? fols.length : 0,
          documents: Array.isArray(docs) ? docs.length : 0,
          workflows: Array.isArray(wfs) ? wfs.length : 0,
          auditLogs: Array.isArray(logs) ? logs.length : 0,
        })
      } catch { /* non-fatal */ }
      setLoading(false)
    }
    void load()
  }, [])

  const cards = [
    { label: "Repositories", value: stats.repositories, color: "bg-blue-500", icon: "🗄️", href: "/repositories" },
    { label: "Folders", value: stats.folders, color: "bg-green-500", icon: "📁", href: "/folders" },
    { label: "Documents", value: stats.documents, color: "bg-purple-500", icon: "📄", href: "/documents" },
    { label: "Workflows", value: stats.workflows, color: "bg-orange-500", icon: "⚙️", href: "/workflows" },
    { label: "Audit Entries", value: stats.auditLogs, color: "bg-red-500", icon: "📋", href: "/audit-logs" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">OPAPRU EDMS Dashboard</h1>
        <p className="text-muted-foreground mt-1">Enterprise Document Management System</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-muted h-28 animate-pulse rounded-xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {cards.map(c => (
            <a key={c.label} href={c.href} className="bg-card border rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className={`${c.color} text-white rounded-lg w-10 h-10 flex items-center justify-center text-xl mb-3`}>{c.icon}</div>
              <div className="text-2xl font-bold">{c.value}</div>
              <div className="text-muted-foreground text-sm">{c.label}</div>
            </a>
          ))}
        </div>
      )}

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {[
            { label: "Upload Document", href: "/documents", icon: "📤" },
            { label: "Browse Folders", href: "/folders", icon: "📂" },
            { label: "View Workflows", href: "/workflows", icon: "🔄" },
            { label: "Audit Trail", href: "/audit-logs", icon: "🔍" },
          ].map(a => (
            <a key={a.label} href={a.href} className="flex items-center gap-3 rounded-lg border p-3 hover:bg-accent transition-colors">
              <span className="text-2xl">{a.icon}</span>
              <span className="text-sm font-medium">{a.label}</span>
            </a>
          ))}
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6">
        <h2 className="font-semibold text-lg mb-2">System Information</h2>
        <div className="text-sm text-muted-foreground space-y-1">
          <p>System: OPAPRU Enterprise Document Management System</p>
          <p>Version: 1.0.0 (Demo Build)</p>
          <p>Environment: Development</p>
          <p>All demo accounts use password: <code className="bg-muted px-1 rounded">DevAccess123!</code></p>
        </div>
      </div>
    </div>
  )
}
