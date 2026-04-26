import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"

import { documents } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class DocumentsService {
	async findAll(repositoryId?: string, folderId?: string) {
		if (repositoryId) return db.select().from(documents).where(eq(documents.repositoryId, repositoryId)).orderBy(desc(documents.createdAt))
		if (folderId) return db.select().from(documents).where(eq(documents.folderId, folderId)).orderBy(desc(documents.createdAt))
		return db.select().from(documents).orderBy(desc(documents.createdAt))
	}

	async findOne(id: string) {
		const [doc] = await db.select().from(documents).where(eq(documents.id, id))
		if (!doc) throw new NotFoundException(`Document ${id} not found`)
		return doc
	}

	async create(data: {
		title: string; description?: string; folderId?: string; repositoryId?: string
		version?: string; status?: string; filePath?: string; fileSize?: number
		mimeType?: string; tags?: string; createdBy?: string
	}) {
		const [doc] = await db.insert(documents).values({
			id: randomUUID(),
			title: data.title,
			description: data.description ?? "",
			folderId: data.folderId ?? null,
			repositoryId: data.repositoryId ?? null,
			version: data.version ?? "1.0",
			status: (data.status as "draft" | "review" | "approved" | "archived" | "rejected") ?? "draft",
			filePath: data.filePath ?? "",
			fileSize: data.fileSize ?? 0,
			mimeType: data.mimeType ?? "application/pdf",
			tags: data.tags ?? "",
			createdBy: data.createdBy ?? null,
		}).returning()
		return doc
	}

	async update(id: string, data: Partial<{ title: string; description: string; status: string; version: string; tags: string }>) {
		const [doc] = await db.update(documents).set({ ...data, updatedAt: new Date() }).where(eq(documents.id, id)).returning()
		if (!doc) throw new NotFoundException(`Document ${id} not found`)
		return doc
	}

	async remove(id: string) {
		await db.delete(documents).where(eq(documents.id, id))
		return { success: true }
	}

	async updateStatus(id: string, status: "draft" | "review" | "approved" | "archived" | "rejected") {
		const [doc] = await db.update(documents).set({ status, updatedAt: new Date() }).where(eq(documents.id, id)).returning()
		if (!doc) throw new NotFoundException(`Document ${id} not found`)
		return doc
	}
}
