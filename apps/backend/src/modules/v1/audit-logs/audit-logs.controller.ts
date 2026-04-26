import { Controller, Get, Post, Body, Query } from "@nestjs/common"
import { AuditLogsService } from "./audit-logs.service"

@Controller("audit-logs")
export class AuditLogsController {
	constructor(private readonly svc: AuditLogsService) {}

	@Get() findAll(@Query("resourceType") resourceType?: string, @Query("userId") userId?: string, @Query("limit") limit?: string) {
		return this.svc.findAll(resourceType, userId, limit ? parseInt(limit) : 100)
	}

	@Post() log(@Body() body: { userId?: string; action: string; resourceType: string; resourceId?: string; resourceName?: string; ipAddress?: string; details?: string }) {
		return this.svc.log(body)
	}
}
