import { Module } from "@nestjs/common"

import { ExamplesModule } from "./examples/examples.module"
import { HealthModule } from "./health/health.module"
import { TicketsModule } from "./tickets/tickets.module"
import { RepositoriesModule } from "./repositories/repositories.module"
import { FoldersModule } from "./folders/folders.module"
import { DocumentsModule } from "./documents/documents.module"
import { WorkflowsModule } from "./workflows/workflows.module"
import { AuditLogsModule } from "./audit-logs/audit-logs.module"

@Module({
	imports: [
		ExamplesModule,
		HealthModule,
		TicketsModule,
		RepositoriesModule,
		FoldersModule,
		DocumentsModule,
		WorkflowsModule,
		AuditLogsModule,
	],
})
export class V1Module {}
