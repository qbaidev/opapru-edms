"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface AuditLog { id: string; userId: string; action: string; resourceType: string; resourceName: string; ipAddress: string; details: string; createdAt: string }

const ACTION_COLORS: Record<string, string> = {
  DOCUMENT_UPLOADED: "bg-green-100 text-green-700",
  DOCUMENT_APPROVED: "bg-blue-100 text-blue-700",
  DOCUMENT_REJECTED: "bg-red-100 text-red-700",
  DOCUMENT_VIEWED: "bg-gray-100 text-gray-700",
  DOCUMENT_DOWNLOADED: "bg-purple-100 text-purple-700",
  DOCUMENT_ARCHIVED: "bg-orange-100 text-orange-700",
  WORKFLOW_STARTED: "bg-yellow-100 text-yellow-700",
  WORKFLOW_COMPLETED: "bg-green-100 text-green-700",
  USER_LOGIN: "bg-blue-100 text-blue-700",
  USER_LOGOUT: "bg-gray-100 text-gray-700",
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState("")

  useEffect(() => {
    fetch(`${API}/${V}/audit-logs?limit=200`)
      .then(r => r.json())
      .then(d => { setLogs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.action.toLowerCase().includes(search.toLowerCase()) || l.resourceName?.toLowerCase().includes(search.toLowerCase())
    const matchType = !typeFilter || l.resourceType === typeFilter
    return matchSearch && matchType
  })

  const types = [...new Set(logs.map(l => l.resourceType))]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Trail</h1>
        <p className="text-muted-foreground mt-1">{logs.length} recorded activities</p>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search actions or resources..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded-lg px-3 py-2 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Types</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">{[...Array(8)].map((_, i) => <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />)}</div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Resource</th>
                <th className="text-left px-4 py-3 font-medium">Type</th>
                <th className="text-left px-4 py-3 font-medium">IP Address</th>
                <th className="text-left px-4 py-3 font-medium">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No audit logs found</td></tr>
              ) : filtered.map(log => (
                <tr key={log.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"}`}>
                      {log.action.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{log.resourceName || "—"}</div>
                    <div className="text-xs text-muted-foreground">{log.details?.slice(0, 50)}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{log.resourceType}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{log.ipAddress || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
