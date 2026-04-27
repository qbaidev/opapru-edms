import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common"
import { FoldersService } from "./folders.service"

@AllowAnonymous()
@Controller({ path: "folders", version: "1" })
export class FoldersController {
	constructor(private readonly svc: FoldersService) {}

	@Get() findAll(@Query("repositoryId") repositoryId?: string) { return this.svc.findAll(repositoryId) }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { name: string; repositoryId?: string; parentId?: string; createdBy?: string }) { return this.svc.create(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ name: string; parentId: string }>) { return this.svc.update(id, body) }
	@Delete(":id") remove(@Param("id") id: string) { return this.svc.remove(id) }
}
