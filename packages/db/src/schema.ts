import { defineRelations } from "drizzle-orm"
import { index, primaryKey } from "drizzle-orm/pg-core"

import { createTable } from "./utils/table.js"

// ============================================================================
// BETTER AUTH TABLES
// ============================================================================

export const users = createTable("users", t => ({
	id: t.text("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.text("email").notNull().unique(),
	emailVerified: t.boolean("email_verified").default(false).notNull(),
	image: t.text("image"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const sessions = createTable("sessions", t => ({
	id: t.text("id").primaryKey(),
	token: t.text("token").notNull().unique(),
	userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	expiresAt: t.timestamp("expires_at").notNull(),
	ipAddress: t.text("ip_address"),
	userAgent: t.text("user_agent"),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const accounts = createTable(
	"accounts",
	t => ({
		id: t.text("id"),
		accountId: t.text("account_id").notNull(),
		providerId: t.text("provider_id").notNull(),
		userId: t.text("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
		accessToken: t.text("access_token"),
		refreshToken: t.text("refresh_token"),
		idToken: t.text("id_token"),
		accessTokenExpiresAt: t.timestamp("access_token_expires_at"),
		refreshTokenExpiresAt: t.timestamp("refresh_token_expires_at"),
		scope: t.text("scope"),
		password: t.text("password"),
		createdAt: t.timestamp("created_at").notNull().defaultNow(),
		updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
	}),
	t => [
		primaryKey({ columns: [t.providerId, t.accountId] }),
		index("account_user_id_idx").on(t.userId),
	]
)

export const verifications = createTable(
	"verifications",
	t => ({
		id: t.text("id"),
		identifier: t.text("identifier").notNull(),
		value: t.text("value").notNull(),
		expiresAt: t.timestamp("expires_at").notNull(),
		createdAt: t.timestamp("created_at").defaultNow(),
		updatedAt: t.timestamp("updated_at").defaultNow(),
	}),
	t => [primaryKey({ columns: [t.identifier, t.value] })]
)

// ============================================================================
// TODOS
// ============================================================================

export const todos = createTable("todos", t => ({
	id: t.serial("id").primaryKey(),
	title: t.text("title").notNull(),
	completed: t.boolean("completed").notNull().default(false),
	authorId: t.text("author_id").notNull().references(() => users.id, { onDelete: "cascade" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// TICKETS
// ============================================================================

export const tickets = createTable("tickets", t => ({
	id: t.serial("id").primaryKey(),
	name: t.text("name").notNull(),
	email: t.text("email").notNull(),
	subject: t.text("subject").notNull(),
	priority: t.text("priority").notNull().default("medium").$type<"low" | "medium" | "high" | "urgent">(),
	concern: t.text("concern").notNull(),
	status: t.text("status").notNull().default("received").$type<"received" | "in_progress" | "resolved" | "closed">(),
	authorId: t.text("author_id").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — REPOSITORIES
// ============================================================================

export const repositories = createTable("repositories", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	name: t.text("name").notNull(),
	description: t.text("description").default(""),
	department: t.text("department").default(""),
	securityLevel: t.text("security_level").default("internal").$type<"public" | "internal" | "confidential" | "restricted">(),
	createdBy: t.text("created_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — FOLDERS
// ============================================================================

export const folders = createTable("folders", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	name: t.text("name").notNull(),
	parentId: t.text("parent_id"),
	repositoryId: t.text("repository_id").references(() => repositories.id, { onDelete: "cascade" }),
	path: t.text("path").default(""),
	createdBy: t.text("created_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — DOCUMENTS
// ============================================================================

export const documents = createTable("documents", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	title: t.text("title").notNull(),
	description: t.text("description").default(""),
	folderId: t.text("folder_id").references(() => folders.id, { onDelete: "set null" }),
	repositoryId: t.text("repository_id").references(() => repositories.id, { onDelete: "cascade" }),
	version: t.text("version").default("1.0"),
	status: t.text("status").default("draft").$type<"draft" | "review" | "approved" | "archived" | "rejected">(),
	filePath: t.text("file_path").default(""),
	fileSize: t.integer("file_size").default(0),
	mimeType: t.text("mime_type").default("application/pdf"),
	tags: t.text("tags").default(""),
	createdBy: t.text("created_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — WORKFLOWS
// ============================================================================

export const workflows = createTable("workflows", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	name: t.text("name").notNull(),
	description: t.text("description").default(""),
	steps: t.text("steps").default("[]"),
	triggerConditions: t.text("trigger_conditions").default("{}"),
	status: t.text("status").default("active").$type<"active" | "inactive" | "draft">(),
	createdBy: t.text("created_by").references(() => users.id, { onDelete: "set null" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

export const workflowInstances = createTable("workflow_instances", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	workflowId: t.text("workflow_id").references(() => workflows.id, { onDelete: "cascade" }),
	documentId: t.text("document_id").references(() => documents.id, { onDelete: "cascade" }),
	currentStep: t.integer("current_step").default(0),
	status: t.text("status").default("pending").$type<"pending" | "in_progress" | "approved" | "rejected" | "completed">(),
	assignedTo: t.text("assigned_to").references(() => users.id, { onDelete: "set null" }),
	comments: t.text("comments").default(""),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
	updatedAt: t.timestamp("updated_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — AUDIT LOGS
// ============================================================================

export const auditLogs = createTable("audit_logs", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	userId: t.text("user_id").references(() => users.id, { onDelete: "set null" }),
	action: t.text("action").notNull(),
	resourceType: t.text("resource_type").notNull(),
	resourceId: t.text("resource_id").default(""),
	resourceName: t.text("resource_name").default(""),
	ipAddress: t.text("ip_address").default(""),
	userAgent: t.text("user_agent").default(""),
	details: t.text("details").default(""),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — DIGITAL SIGNATURES
// ============================================================================

export const digitalSignatures = createTable("digital_signatures", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	documentId: t.text("document_id").references(() => documents.id, { onDelete: "cascade" }),
	userId: t.text("user_id").references(() => users.id, { onDelete: "set null" }),
	signatureData: t.text("signature_data").default(""),
	certificateSerial: t.text("certificate_serial").default(""),
	certificateIssuer: t.text("certificate_issuer").default(""),
	signedAt: t.timestamp("signed_at").notNull().defaultNow(),
	status: t.text("status").default("valid").$type<"valid" | "revoked" | "expired">(),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// EDMS — METADATA FIELDS
// ============================================================================

export const metadataFields = createTable("metadata_fields", t => ({
	id: t.text("id").primaryKey().default("gen_random_uuid()"),
	name: t.text("name").notNull(),
	label: t.text("label").notNull(),
	fieldType: t.text("field_type").default("text").$type<"text" | "number" | "date" | "boolean" | "select" | "multiselect">(),
	isRequired: t.boolean("is_required").default(false),
	defaultValue: t.text("default_value").default(""),
	options: t.text("options").default("[]"),
	repositoryId: t.text("repository_id").references(() => repositories.id, { onDelete: "cascade" }),
	createdAt: t.timestamp("created_at").notNull().defaultNow(),
}))

// ============================================================================
// RELATIONS
// ============================================================================

export const relations = defineRelations(
	{ users, sessions, accounts, todos, tickets, repositories, folders, documents, workflows, workflowInstances, auditLogs, digitalSignatures, metadataFields },
	r => ({
		users: {
			sessions: r.many.sessions(),
			accounts: r.many.accounts(),
		},
		sessions: {
			user: r.one.users({ from: r.sessions.userId, to: r.users.id }),
		},
		accounts: {
			user: r.one.users({ from: r.accounts.userId, to: r.users.id }),
		},
		todos: {
			author: r.one.users({ from: r.todos.authorId, to: r.users.id }),
		},
		tickets: {
			author: r.one.users({ from: r.tickets.authorId, to: r.users.id }),
		},
		repositories: {
			folders: r.many.folders({ from: r.repositories.id, to: r.folders.repositoryId }),
			documents: r.many.documents({ from: r.repositories.id, to: r.documents.repositoryId }),
		},
		folders: {
			repository: r.one.repositories({ from: r.folders.repositoryId, to: r.repositories.id }),
			documents: r.many.documents({ from: r.folders.id, to: r.documents.folderId }),
		},
		documents: {
			repository: r.one.repositories({ from: r.documents.repositoryId, to: r.repositories.id }),
			folder: r.one.folders({ from: r.documents.folderId, to: r.folders.id }),
			workflowInstances: r.many.workflowInstances({ from: r.documents.id, to: r.workflowInstances.documentId }),
			signatures: r.many.digitalSignatures({ from: r.documents.id, to: r.digitalSignatures.documentId }),
		},
		workflows: {
			instances: r.many.workflowInstances({ from: r.workflows.id, to: r.workflowInstances.workflowId }),
		},
		workflowInstances: {
			workflow: r.one.workflows({ from: r.workflowInstances.workflowId, to: r.workflows.id }),
			document: r.one.documents({ from: r.workflowInstances.documentId, to: r.documents.id }),
		},
		digitalSignatures: {
			document: r.one.documents({ from: r.digitalSignatures.documentId, to: r.documents.id }),
		},
	})
)

// ============================================================================
// SCHEMA
// ============================================================================

export const schema = Object.assign(
	{
		users, sessions, accounts, verifications,
		todos, tickets,
		repositories, folders, documents,
		workflows, workflowInstances,
		auditLogs, digitalSignatures, metadataFields,
	},
	relations
)
