"use client"

import { useEffect, useState } from "react"

const API = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001/api"
const V = process.env.NEXT_PUBLIC_API_VERSION ?? "v1"

interface Workflow { id: string; name: string; description: string; status: string; steps: string; createdAt: string }
interface WorkflowInstance { id: string; workflowId: string; documentId: string; status: string; currentStep: number; comments: string; createdAt: string }

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-700",
  draft: "bg-yellow-100 text-yellow-700",
  pending: "bg-yellow-100 text-yellow-700",
  in_progress: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
  completed: "bg-purple-100 text-purple-700",
}

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<Workflow[]>([])
  const [instances, setInstances] = useState<WorkflowInstance[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<"templates" | "instances">("templates")

  useEffect(() => {
    Promise.all([
      fetch(`${API}/${V}/workflows`).then(r => r.json()),
      fetch(`${API}/${V}/workflows/instances`).then(r => r.json()),
    ]).then(([wfs, inst]) => {
      setWorkflows(Array.isArray(wfs) ? wfs : [])
      setInstances(Array.isArray(inst) ? inst : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const parseSteps = (stepsJson: string) => { try { return JSON.parse(stepsJson) as Array<{ step: number; name: string; assignRole: string }> } catch { return [] } }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Workflows</h1>
          <p className="text-muted-foreground mt-1">{workflows.length} workflow templates, {instances.length} active instances</p>
        </div>
        <button className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90">
          ⚙️ New Workflow
        </button>
      </div>

      <div className="flex gap-2 border-b">
        {(["templates", "instances"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t === "templates" ? `Templates (${workflows.length})` : `Active (${instances.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="bg-muted h-24 animate-pulse rounded-xl" />)}</div>
      ) : tab === "templates" ? (
        <div className="grid gap-4">
          {workflows.map(wf => {
            const steps = parseSteps(wf.steps)
            return (
              <div key={wf.id} className="bg-card border rounded-xl p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold">{wf.name}</h3>
                    <p className="text-muted-foreground text-sm mt-0.5">{wf.description}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[wf.status] ?? ""}`}>{wf.status}</span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {steps.map((step, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <div className="bg-muted rounded-full px-3 py-1 text-xs">{step.name}</div>
                      {i < steps.length - 1 && <span className="text-muted-foreground">→</span>}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Instance ID</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-left px-4 py-3 font-medium">Current Step</th>
                <th className="text-left px-4 py-3 font-medium">Comments</th>
                <th className="text-left px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {instances.map(inst => (
                <tr key={inst.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-mono text-xs">{inst.id.slice(0, 12)}…</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[inst.status] ?? ""}`}>{inst.status}</span></td>
                  <td className="px-4 py-3">Step {(inst.currentStep ?? 0) + 1}</td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.comments || "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{new Date(inst.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {instances.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">No active workflow instances</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
