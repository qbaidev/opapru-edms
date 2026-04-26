import { Injectable } from "@nestjs/common"
import { desc, eq } from "drizzle-orm"
import { randomUUID } from "crypto"

import { auditLogs } from "@repo/db/schema"
import { db } from "@/common/database/database.client"

@Injectable()
export class AuditLogsService {
	async findAll(resourceType?: string, userId?: string, limit = 100) {
		let query = db.select().from(auditLogs).orderBy(desc(auditLogs.createdAt)).limit(limit)
		if (resourceType) return db.select().from(auditLogs).where(eq(auditLogs.resourceType, resourceType)).orderBy(desc(auditLogs.createdAt)).limit(limit)
		if (userId) return db.select().from(auditLogs).where(eq(auditLogs.userId, userId)).orderBy(desc(auditLogs.createdAt)).limit(limit)
		return query
	}

	async log(data: { userId?: string; action: string; resourceType: string; resourceId?: string; resourceName?: string; ipAddress?: string; userAgent?: string; details?: string }) {
		const [entry] = await db.insert(auditLogs).values({
			id: randomUUID(),
			userId: data.userId ?? null,
			action: data.action,
			resourceType: data.resourceType,
			resourceId: data.resourceId ?? "",
			resourceName: data.resourceName ?? "",
			ipAddress: data.ipAddress ?? "",
			userAgent: data.userAgent ?? "",
			details: data.details ?? "",
		}).returning()
		return entry
	}
}
