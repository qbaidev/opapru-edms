/**
 * EDMS Seed Script — run after DB push to populate demo data
 * Usage: npx ts-node -r tsconfig-paths/register src/seed/edms-seed.ts
 */

import { db } from "../common/database/database.client"
import { repositories, folders, documents, workflows, workflowInstances, auditLogs, users } from "@repo/db/schema"
import { eq } from "drizzle-orm"
import { randomUUID } from "crypto"

const USER_EMAILS = [
  "dev@openclaw.local",
  "admin@demo.local",
  "dev@demo.local",
  "manager@demo.local",
  "tester@demo.local",
  "viewer@demo.local",
]

async function getUserIds(): Promise<Record<string, string>> {
  const result: Record<string, string> = {}
  for (const email of USER_EMAILS) {
    const [u] = await db.select().from(users).where(eq(users.email, email))
    if (u) result[email] = u.id
  }
  return result
}

async function seed() {
  console.log("🌱 Seeding EDMS demo data...")
  const userIds = await getUserIds()
  const adminId = userIds["admin@demo.local"] ?? userIds["dev@openclaw.local"] ?? null
  const managerId = userIds["manager@demo.local"] ?? adminId
  const devId = userIds["dev@demo.local"] ?? adminId

  // Repositories
  const repoIds = { hr: randomUUID(), finance: randomUUID(), legal: randomUUID() }
  await db.insert(repositories).values([
    { id: repoIds.hr, name: "Human Resources", description: "HR policies, employment records, and personnel documents", department: "HR", securityLevel: "confidential", createdBy: adminId },
    { id: repoIds.finance, name: "Finance & Accounting", description: "Financial reports, invoices, and budget documents", department: "Finance", securityLevel: "restricted", createdBy: adminId },
    { id: repoIds.legal, name: "Legal & Compliance", description: "Contracts, legal opinions, and compliance documents", department: "Legal", securityLevel: "restricted", createdBy: managerId },
  ]).onConflictDoNothing()

  // Folders
  const folderIds = {
    policies: randomUUID(), recruitment: randomUUID(), payroll: randomUUID(),
    reports: randomUUID(), invoices: randomUUID(),
    contracts: randomUUID(), compliance: randomUUID(),
  }
  await db.insert(folders).values([
    { id: folderIds.policies, name: "Policies & Procedures", repositoryId: repoIds.hr, createdBy: adminId },
    { id: folderIds.recruitment, name: "Recruitment Files", repositoryId: repoIds.hr, createdBy: adminId },
    { id: folderIds.payroll, name: "Payroll Records", repositoryId: repoIds.hr, createdBy: adminId },
    { id: folderIds.reports, name: "Financial Reports", repositoryId: repoIds.finance, createdBy: managerId },
    { id: folderIds.invoices, name: "Invoices", repositoryId: repoIds.finance, createdBy: managerId },
    { id: folderIds.contracts, name: "Contracts", repositoryId: repoIds.legal, createdBy: adminId },
    { id: folderIds.compliance, name: "Compliance Documents", repositoryId: repoIds.legal, createdBy: adminId },
  ]).onConflictDoNothing()

  // Documents
  const docData = [
    { title: "Employee Handbook 2025", desc: "Complete employee handbook with policies and procedures", folderId: folderIds.policies, repoId: repoIds.hr, status: "approved", version: "3.2", size: 2456789, tags: "policy,handbook,hr", creator: adminId },
    { title: "Leave Policy v4.1", desc: "Updated leave entitlements and application procedures", folderId: folderIds.policies, repoId: repoIds.hr, status: "approved", version: "4.1", size: 345678, tags: "policy,leave", creator: adminId },
    { title: "Job Description - Senior Analyst", desc: "Job description for Senior Business Analyst position", folderId: folderIds.recruitment, repoId: repoIds.hr, status: "approved", version: "1.0", size: 123456, tags: "recruitment,jd", creator: managerId },
    { title: "Interview Assessment Form", desc: "Standard interview assessment template", folderId: folderIds.recruitment, repoId: repoIds.hr, status: "approved", version: "2.0", size: 98765, tags: "recruitment,form", creator: managerId },
    { title: "Q1 2025 Payroll Summary", desc: "Payroll summary for Q1 2025", folderId: folderIds.payroll, repoId: repoIds.hr, status: "approved", version: "1.0", size: 567890, tags: "payroll,q1", creator: adminId },
    { title: "Annual Report 2024", desc: "Comprehensive annual financial report for FY2024", folderId: folderIds.reports, repoId: repoIds.finance, status: "approved", version: "1.0", size: 4567890, tags: "annual,report,finance", creator: managerId },
    { title: "Q4 2024 Budget Review", desc: "Q4 2024 budget variance analysis", folderId: folderIds.reports, repoId: repoIds.finance, status: "review", version: "1.1", size: 890123, tags: "budget,q4", creator: managerId },
    { title: "Invoice #INV-2025-0342", desc: "Vendor invoice from Tech Solutions Inc.", folderId: folderIds.invoices, repoId: repoIds.finance, status: "approved", version: "1.0", size: 45678, tags: "invoice,vendor", creator: devId },
    { title: "Invoice #INV-2025-0341", desc: "Vendor invoice from Office Supplies Co.", folderId: folderIds.invoices, repoId: repoIds.finance, status: "approved", version: "1.0", size: 34567, tags: "invoice,vendor", creator: devId },
    { title: "Service Agreement - CloudHost Corp", desc: "3-year cloud hosting service agreement", folderId: folderIds.contracts, repoId: repoIds.legal, status: "approved", version: "2.0", size: 1234567, tags: "contract,cloud,service", creator: adminId },
    { title: "NDA Template 2025", desc: "Standard non-disclosure agreement template", folderId: folderIds.contracts, repoId: repoIds.legal, status: "approved", version: "5.0", size: 234567, tags: "nda,template,legal", creator: adminId },
    { title: "DICT Compliance Checklist 2025", desc: "Annual DICT cybersecurity compliance checklist", folderId: folderIds.compliance, repoId: repoIds.legal, status: "approved", version: "1.0", size: 456789, tags: "compliance,dict,cybersecurity", creator: managerId },
    { title: "Privacy Notice - Public", desc: "Public-facing privacy notice per NPC regulations", folderId: folderIds.compliance, repoId: repoIds.legal, status: "approved", version: "2.1", size: 345678, tags: "privacy,npc,compliance", creator: adminId },
    { title: "Data Retention Policy", desc: "Document and data retention schedule", folderId: folderIds.compliance, repoId: repoIds.legal, status: "draft", version: "1.0", size: 123456, tags: "policy,retention,data", creator: devId },
    { title: "Memo - Remote Work Guidelines", desc: "Updated remote work guidelines for 2025", folderId: folderIds.policies, repoId: repoIds.hr, status: "review", version: "1.0", size: 89012, tags: "memo,remote,work", creator: managerId },
  ]

  const docIds: string[] = []
  for (const d of docData) {
    const id = randomUUID()
    docIds.push(id)
    await db.insert(documents).values({
      id,
      title: d.title,
      description: d.desc,
      folderId: d.folderId,
      repositoryId: d.repoId,
      status: d.status as "draft" | "review" | "approved" | "archived" | "rejected",
      version: d.version,
      filePath: `/uploads/${id}.pdf`,
      fileSize: d.size,
      mimeType: "application/pdf",
      tags: d.tags,
      createdBy: d.creator,
    }).onConflictDoNothing()
  }

  // Workflows
  const wfIds = { approval: randomUUID(), review: randomUUID(), archive: randomUUID() }
  await db.insert(workflows).values([
    {
      id: wfIds.approval,
      name: "Document Approval Workflow",
      description: "Standard multi-level document approval process",
      steps: JSON.stringify([
        { step: 1, name: "Department Review", assignRole: "manager", action: "review" },
        { step: 2, name: "Compliance Check", assignRole: "compliance", action: "verify" },
        { step: 3, name: "Final Approval", assignRole: "admin", action: "approve" },
      ]),
      status: "active",
      createdBy: adminId,
    },
    {
      id: wfIds.review,
      name: "Periodic Review Workflow",
      description: "Annual document review and update process",
      steps: JSON.stringify([
        { step: 1, name: "Content Review", assignRole: "manager", action: "review" },
        { step: 2, name: "Update if Needed", assignRole: "author", action: "update" },
        { step: 3, name: "Re-approval", assignRole: "admin", action: "approve" },
      ]),
      status: "active",
      createdBy: managerId,
    },
    {
      id: wfIds.archive,
      name: "Document Archival Workflow",
      description: "Process for archiving obsolete documents",
      steps: JSON.stringify([
        { step: 1, name: "Archive Request", assignRole: "author", action: "request" },
        { step: 2, name: "Legal Clearance", assignRole: "legal", action: "clear" },
        { step: 3, name: "Archive", assignRole: "admin", action: "archive" },
      ]),
      status: "active",
      createdBy: adminId,
    },
  ]).onConflictDoNothing()

  // Workflow Instances
  await db.insert(workflowInstances).values([
    { id: randomUUID(), workflowId: wfIds.approval, documentId: docIds[6], currentStep: 1, status: "in_progress", assignedTo: managerId, comments: "Under budget review" },
    { id: randomUUID(), workflowId: wfIds.approval, documentId: docIds[13], currentStep: 0, status: "pending", assignedTo: managerId, comments: "" },
    { id: randomUUID(), workflowId: wfIds.review, documentId: docIds[0], currentStep: 2, status: "in_progress", assignedTo: adminId, comments: "Annual review in progress" },
    { id: randomUUID(), workflowId: wfIds.review, documentId: docIds[14], currentStep: 0, status: "pending", assignedTo: managerId, comments: "Awaiting department review" },
  ]).onConflictDoNothing()

  // Audit Logs
  const actions = [
    { action: "DOCUMENT_UPLOADED", rType: "document", rName: "Employee Handbook 2025", userId: adminId },
    { action: "DOCUMENT_APPROVED", rType: "document", rName: "Leave Policy v4.1", userId: managerId },
    { action: "DOCUMENT_VIEWED", rType: "document", rName: "Annual Report 2024", userId: devId },
    { action: "FOLDER_CREATED", rType: "folder", rName: "Payroll Records", userId: adminId },
    { action: "DOCUMENT_UPLOADED", rType: "document", rName: "Q4 2024 Budget Review", userId: managerId },
    { action: "WORKFLOW_STARTED", rType: "workflow", rName: "Document Approval Workflow", userId: adminId },
    { action: "DOCUMENT_DOWNLOADED", rType: "document", rName: "NDA Template 2025", userId: devId },
    { action: "DOCUMENT_STATUS_CHANGED", rType: "document", rName: "Memo - Remote Work Guidelines", userId: managerId },
    { action: "REPOSITORY_CREATED", rType: "repository", rName: "Legal & Compliance", userId: adminId },
    { action: "USER_LOGIN", rType: "user", rName: "admin@demo.local", userId: adminId },
    { action: "DOCUMENT_SHARED", rType: "document", rName: "DICT Compliance Checklist 2025", userId: managerId },
    { action: "WORKFLOW_COMPLETED", rType: "workflow", rName: "Document Approval Workflow", userId: adminId },
    { action: "DOCUMENT_VERSION_CREATED", rType: "document", rName: "Service Agreement - CloudHost Corp", userId: adminId },
    { action: "USER_LOGIN", rType: "user", rName: "dev@demo.local", userId: devId },
    { action: "DOCUMENT_ARCHIVED", rType: "document", rName: "Q4 2024 Budget Review", userId: managerId },
    { action: "FOLDER_RENAMED", rType: "folder", rName: "Invoices", userId: adminId },
    { action: "DOCUMENT_UPLOADED", rType: "document", rName: "Data Retention Policy", userId: devId },
    { action: "WORKFLOW_STEP_COMPLETED", rType: "workflow", rName: "Periodic Review Workflow", userId: managerId },
    { action: "DOCUMENT_VIEWED", rType: "document", rName: "Privacy Notice - Public", userId: devId },
    { action: "USER_LOGOUT", rType: "user", rName: "viewer@demo.local", userId: userIds["viewer@demo.local"] ?? adminId },
  ]

  const ips = ["192.168.1.10", "192.168.1.11", "192.168.1.12", "10.0.0.5", "10.0.0.6"]
  for (let i = 0; i < actions.length; i++) {
    const a = actions[i]
    await db.insert(auditLogs).values({
      id: randomUUID(),
      userId: a.userId,
      action: a.action,
      resourceType: a.rType,
      resourceId: randomUUID(),
      resourceName: a.rName,
      ipAddress: ips[i % ips.length],
      details: `${a.action} performed on ${a.rName}`,
    }).onConflictDoNothing()
  }

  console.log("✅ EDMS demo data seeded successfully!")
  process.exit(0)
}

seed().catch(e => { console.error("Seed failed:", e); process.exit(1) })
