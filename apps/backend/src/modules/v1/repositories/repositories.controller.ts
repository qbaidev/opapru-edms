import { Controller, Get, Post, Put, Delete, Param, Body } from "@nestjs/common"
import { RepositoriesService } from "./repositories.service"

@Controller("repositories")
export class RepositoriesController {
	constructor(private readonly svc: RepositoriesService) {}

	@Get() findAll() { return this.svc.findAll() }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { name: string; description?: string; department?: string; securityLevel?: string; createdBy?: string }) { return this.svc.create(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ name: string; description: string; department: string; securityLevel: string }>) { return this.svc.update(id, body) }
	@Delete(":id") remove(@Param("id") id: string) { return this.svc.remove(id) }
}
