import { AllowAnonymous } from "@thallesp/nestjs-better-auth"
import { Controller, Get, Post, Put, Delete, Param, Body, Query } from "@nestjs/common"
import { WorkflowsService } from "./workflows.service"

@AllowAnonymous()
@Controller("workflows")
export class WorkflowsController {
	constructor(private readonly svc: WorkflowsService) {}

	@Get() findAll() { return this.svc.findAll() }
	@Get("instances") findInstances(@Query("workflowId") workflowId?: string, @Query("documentId") documentId?: string) { return this.svc.findInstances(workflowId, documentId) }
	@Get(":id") findOne(@Param("id") id: string) { return this.svc.findOne(id) }
	@Post() create(@Body() body: { name: string; description?: string; steps?: string; triggerConditions?: string; status?: string; createdBy?: string }) { return this.svc.create(body) }
	@Post("instances") createInstance(@Body() body: { workflowId: string; documentId: string; assignedTo?: string }) { return this.svc.createInstance(body) }
	@Put(":id") update(@Param("id") id: string, @Body() body: Partial<{ name: string; description: string; status: string }>) { return this.svc.update(id, body) }
	@Put("instances/:id") updateInstance(@Param("id") id: string, @Body() body: Partial<{ currentStep: number; status: string; comments: string }>) { return this.svc.updateInstance(id, body) }
	@Delete(":id") remove(@Param("id") id: string) { return this.svc.remove(id) }
}
