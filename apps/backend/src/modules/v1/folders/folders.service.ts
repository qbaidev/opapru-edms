import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"

import { folders } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class FoldersService {
	async findAll(repositoryId?: string) {
		const query = db.select().from(folders).orderBy(desc(folders.createdAt))
		if (repositoryId) return db.select().from(folders).where(eq(folders.repositoryId, repositoryId)).orderBy(desc(folders.createdAt))
		return query
	}

	async findOne(id: string) {
		const [folder] = await db.select().from(folders).where(eq(folders.id, id))
		if (!folder) throw new NotFoundException(`Folder ${id} not found`)
		return folder
	}

	async create(data: { name: string; repositoryId?: string; parentId?: string; createdBy?: string }) {
		const [folder] = await db.insert(folders).values({
			id: randomUUID(),
			name: data.name,
			repositoryId: data.repositoryId ?? null,
			parentId: data.parentId ?? null,
			createdBy: data.createdBy ?? null,
		}).returning()
		return folder
	}

	async update(id: string, data: Partial<{ name: string; parentId: string }>) {
		const [folder] = await db.update(folders).set({ ...data, updatedAt: new Date() }).where(eq(folders.id, id)).returning()
		if (!folder) throw new NotFoundException(`Folder ${id} not found`)
		return folder
	}

	async remove(id: string) {
		await db.delete(folders).where(eq(folders.id, id))
		return { success: true }
	}
}
