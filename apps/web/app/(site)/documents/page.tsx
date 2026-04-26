"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Document { id: string; title: string; description: string; status: string; version: string; mimeType: string; fileSize: number; tags: string; createdAt: string }

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  review: "bg-yellow-100 text-yellow-700",
  approved: "bg-green-100 text-green-700",
  archived: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
}

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

export default function DocumentsPage() {
  const [docs, setDocs] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetch(`${API}/${V}/documents`)
      .then(r => r.json())
      .then(d => { setDocs(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const filtered = docs.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || d.status === statusFilter
    return matchSearch && matchStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Documents</h1>
          <p className="text-muted-foreground mt-1">{docs.length} documents in the system</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          📤 Upload Document
        </button>
      </div>

      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search documents..."
          className="flex-1 border rounded-lg px-3 py-2 text-sm"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select className="border rounded-lg px-3 py-2 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="review">In Review</option>
          <option value="approved">Approved</option>
          <option value="archived">Archived</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-muted h-16 animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Title</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Version</th>
                <th className="text-left px-4 py-3 font-medium">Size</th>
                <th className="text-left px-4 py-3 font-medium">Tags</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No documents found</td></tr>
              ) : filtered.map(doc => (
                <tr key={doc.id} className="hover:bg-muted/30 cursor-pointer">
                  <td className="px-4 py-3">
                    <div className="font-medium">📄 {doc.title}</div>
                    <div className="text-muted-foreground text-xs">{doc.description?.slice(0, 60)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[doc.status] ?? ""}`}>
                      {doc.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">v{doc.version}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatSize(doc.fileSize ?? 0)}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {doc.tags?.split(",").slice(0, 3).map(t => (
                        <span key={t} className="bg-muted px-1.5 py-0.5 rounded text-xs">{t.trim()}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(doc.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
