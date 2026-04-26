import { Injectable, NotFoundException } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"

import { repositories } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class RepositoriesService {
	async findAll() {
		return db.select().from(repositories).orderBy(desc(repositories.createdAt))
	}

	async findOne(id: string) {
		const [repo] = await db.select().from(repositories).where(eq(repositories.id, id))
		if (!repo) throw new NotFoundException(`Repository ${id} not found`)
		return repo
	}

	async create(data: { name: string; description?: string; department?: string; securityLevel?: string; createdBy?: string }) {
		const [repo] = await db.insert(repositories).values({
			id: randomUUID(),
			name: data.name,
			description: data.description ?? "",
			department: data.department ?? "",
			securityLevel: (data.securityLevel as "public" | "internal" | "confidential" | "restricted") ?? "internal",
			createdBy: data.createdBy ?? null,
		}).returning()
		return repo
	}

	async update(id: string, data: Partial<{ name: string; description: string; department: string; securityLevel: string }>) {
		const [repo] = // eslint-disable-next-line @typescript-eslint/no-explicit-any
		await db.update(repositories).set(data as any).where(eq(repositories.id, id)).returning()
		if (!repo) throw new NotFoundException(`Repository ${id} not found`)
		return repo
	}

	async remove(id: string) {
		await db.delete(repositories).where(eq(repositories.id, id))
		return { success: true }
	}
}
