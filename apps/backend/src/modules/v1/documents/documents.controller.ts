import { Controller, Get, Post, Put, Delete, Patch, Param, Body, Query } from "@nestjs/common"
import { DocumentsService } from "./documents.service"

@Controller("documents")
export class DocumentsController {
	constructor(private readonly svc: DocumentsService) {}

	@Get() findAll(@Query("repositoryId") repositoryId?: string, @Query("folderId") folderId?: string) { return this.svc.findAll(repositoryId, folderId) }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { title: string; description?: string; folderId?: string; repositoryId?: string; version?: string; status?: string; filePath?: string; fileSize?: number; mimeType?: string; tags?: string; createdBy?: string }) { return this.svc.create(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ title: string; description: string; status: string; version: string; tags: string }>) { return this.svc.update(id, body) }
	@Patch(":id/status") updateStatus(@Param("id") id: string, @Body() body: { status: "draft" | "review" | "approved" | "archived" | "rejected" }) { return this.svc.updateStatus(id, body.status) }
	@Delete(":id") remove(@Param("id") id: string) { return this.svc.remove(id) }
}
