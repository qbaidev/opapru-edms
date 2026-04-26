"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Repository { id: string; name: string; description: string; department: string; securityLevel: string; createdAt: string }

const LEVEL_COLORS: Record<string, string> = {
  public: "bg-green-100 text-green-700",
  internal: "bg-blue-100 text-blue-700",
  confidential: "bg-orange-100 text-orange-700",
  restricted: "bg-red-100 text-red-700",
}

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<Repository[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/${V}/repositories`)
      .then(r => r.json())
      .then(d => { setRepos(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Repositories</h1>
          <p className="text-muted-foreground mt-1">Document repositories organized by department</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          ➕ New Repository
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-muted h-40 animate-pulse rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {repos.map(repo => (
            <a key={repo.id} href={`/folders?repositoryId=${repo.id}`} className="bg-card border rounded-xl p-5 hover:shadow-md transition-shadow block">
              <div className="flex items-start justify-between mb-3">
                <div className="text-3xl">🗄️</div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${LEVEL_COLORS[repo.securityLevel] ?? ""}`}>
                  {repo.securityLevel}
                </span>
              </div>
              <h3 className="font-semibold text-lg">{repo.name}</h3>
              <p className="text-muted-foreground text-sm mt-1">{repo.description}</p>
              <div className="mt-3 text-xs text-muted-foreground">
                <span className="bg-muted px-2 py-1 rounded">{repo.department}</span>
              </div>
            </a>
          ))}
          {repos.length === 0 && (
            <div className="col-span-3 text-center py-12 text-muted-foreground">
              No repositories found. Create one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
