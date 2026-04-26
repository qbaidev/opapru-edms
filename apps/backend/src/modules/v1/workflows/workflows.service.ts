import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"

import { workflows, workflowInstances } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class WorkflowsService {
	async findAll() {
		return db.select().from(workflows).orderBy(desc(workflows.createdAt))
	}

	async findOne(id: string) {
		const [wf] = await db.select().from(workflows).where(eq(workflows.id, id))
		if (!wf) throw new NotFoundException(`Workflow ${id} not found`)
		return wf
	}

	async create(data: { name: string; description?: string; steps?: string; triggerConditions?: string; status?: string; createdBy?: string }) {
		const [wf] = await db.insert(workflows).values({
			id: randomUUID(),
			name: data.name,
			description: data.description ?? "",
			steps: data.steps ?? "[]",
			triggerConditions: data.triggerConditions ?? "{}",
			status: (data.status as "active" | "inactive" | "draft") ?? "active",
			createdBy: data.createdBy ?? null,
		}).returning()
		return wf
	}

	async update(id: string, data: Partial<{ name: string; description: string; status: string }>) {
		const [wf] = // eslint-disable-next-line @typescript-eslint/no-explicit-any
		await db.update(workflows).set(data as any).where(eq(workflows.id, id)).returning()
		if (!wf) throw new NotFoundException(`Workflow ${id} not found`)
		return wf
	}

	async remove(id: string) {
		await db.delete(workflows).where(eq(workflows.id, id))
		return { success: true }
	}

	async findInstances(workflowId?: string, documentId?: string) {
		if (workflowId) return db.select().from(workflowInstances).where(eq(workflowInstances.workflowId, workflowId)).orderBy(desc(workflowInstances.createdAt))
		if (documentId) return db.select().from(workflowInstances).where(eq(workflowInstances.documentId, documentId)).orderBy(desc(workflowInstances.createdAt))
		return db.select().from(workflowInstances).orderBy(desc(workflowInstances.createdAt))
	}

	async createInstance(data: { workflowId: string; documentId: string; assignedTo?: string }) {
		const [instance] = await db.insert(workflowInstances).values({
			id: randomUUID(),
			workflowId: data.workflowId,
			documentId: data.documentId,
			assignedTo: data.assignedTo ?? null,
			status: "pending",
			currentStep: 0,
		}).returning()
		return instance
	}

	async updateInstance(id: string, data: Partial<{ currentStep: number; status: string; comments: string }>) {
		const [instance] = // eslint-disable-next-line @typescript-eslint/no-explicit-any
		await db.update(workflowInstances).set(data as any).where(eq(workflowInstances.id, id)).returning()
		if (!instance) throw new NotFoundException(`Workflow instance ${id} not found`)
		return instance
	}
}
