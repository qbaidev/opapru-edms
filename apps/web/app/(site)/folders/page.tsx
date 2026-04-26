"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Folder { id: string; name: string; repositoryId: string; parentId: string | null; createdAt: string }

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`${API}/${V}/folders`)
      .then(r => r.json())
      .then(d => { setFolders(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const roots = folders.filter(f => !f.parentId)
  const children = (parentId: string) => folders.filter(f => f.parentId === parentId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Folders</h1>
          <p className="text-muted-foreground mt-1">{folders.length} folders across all repositories</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          📁 New Folder
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <div key={i} className="bg-muted h-12 animate-pulse rounded-lg" />)}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <div className="divide-y">
            {roots.length === 0 && (
              <div className="px-4 py-8 text-center text-muted-foreground">No folders yet</div>
            )}
            {roots.map(folder => (
              <div key={folder.id}>
                <a href={`/documents?folderId=${folder.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
                  <span className="text-xl">📁</span>
                  <div className="flex-1">
                    <div className="font-medium">{folder.name}</div>
                    <div className="text-xs text-muted-foreground">Created {new Date(folder.createdAt).toLocaleDateString()}</div>
                  </div>
                  <span className="text-muted-foreground text-sm">{children(folder.id).length} subfolders →</span>
                </a>
                {children(folder.id).map(child => (
                  <a key={child.id} href={`/documents?folderId=${child.id}`} className="flex items-center gap-3 px-4 py-3 pl-12 hover:bg-muted/30 transition-colors bg-muted/10">
                    <span className="text-lg">📂</span>
                    <div className="font-medium text-sm">{child.name}</div>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
