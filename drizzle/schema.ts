import {
  boolean,
  doublePrecision,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);
export const personTypeEnum = pgEnum("person_type", ["candidate", "employee"]);
export const personStatusEnum = pgEnum("person_status", ["active", "archived"]);
export const testCategoryEnum = pgEnum("test_category", ["reasoning", "personality", "competency"]);
export const testAudienceEnum = pgEnum("test_audience", ["operativo", "mandos_medios", "todos"]);
export const itemTypeEnum = pgEnum("item_type", ["single_choice", "likert"]);
export const assignmentStatusEnum = pgEnum("assignment_status", ["assigned", "in_progress", "completed", "expired"]);
export const resultLevelEnum = pgEnum("result_level", ["bajo", "medio", "alto"]);
export const recommendationEnum = pgEnum("recommendation", ["seleccion", "desarrollo", "alerta"]);

const auditTimestamp = (name: string) => timestamp(name, { withTimezone: true }).defaultNow().notNull();
const updatedTimestamp = (name: string) => auditTimestamp(name).$onUpdate(() => new Date());

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: userRoleEnum("role").default("user").notNull(),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
  lastSignedIn: auditTimestamp("lastSignedIn"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const organizations = pgTable("organizations", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  legalName: varchar("legalName", { length: 240 }),
  address: text("address"),
  privacyContactEmail: varchar("privacyContactEmail", { length: 320 }),
  privacyChannel: varchar("privacyChannel", { length: 320 }),
  privacyNoticeVersion: varchar("privacyNoticeVersion", { length: 50 }).default("lfpdppp-mvp-2026-01").notNull(),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
});

export const people = pgTable("people", {
  id: serial("id").primaryKey(),
  organizationId: integer("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  userId: integer("userId").references(() => users.id, { onDelete: "set null" }),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  personType: personTypeEnum("personType").notNull(),
  position: varchar("position", { length: 120 }).notNull(),
  area: varchar("area", { length: 120 }).notNull(),
  status: personStatusEnum("status").default("active").notNull(),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
}, table => ({
  organizationEmailUnique: uniqueIndex("people_org_email_unique").on(table.organizationId, table.email),
  userIndex: index("people_user_idx").on(table.userId),
}));

export const psychometricTests = pgTable("psychometric_tests", {
  id: serial("id").primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  category: testCategoryEnum("category").notNull(),
  audience: testAudienceEnum("audience").notNull(),
  durationMinutes: integer("durationMinutes").notNull(),
  instructions: text("instructions").notNull(),
  scoringConfig: jsonb("scoringConfig").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
});

export const testDimensions = pgTable("test_dimensions", {
  id: serial("id").primaryKey(),
  testId: integer("testId").notNull().references(() => psychometricTests.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  sortOrder: integer("sortOrder").notNull(),
}, table => ({
  testDimensionUnique: uniqueIndex("test_dimension_unique").on(table.testId, table.code),
  testIndex: index("dimensions_test_idx").on(table.testId),
}));

export const testItems = pgTable("test_items", {
  id: serial("id").primaryKey(),
  testId: integer("testId").notNull().references(() => psychometricTests.id, { onDelete: "cascade" }),
  dimensionId: integer("dimensionId").notNull().references(() => testDimensions.id, { onDelete: "cascade" }),
  code: varchar("code", { length: 80 }).notNull(),
  prompt: text("prompt").notNull(),
  itemType: itemTypeEnum("itemType").notNull(),
  options: jsonb("options").notNull(),
  reverseScored: boolean("reverseScored").default(false).notNull(),
  sortOrder: integer("sortOrder").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
}, table => ({
  testItemUnique: uniqueIndex("test_item_unique").on(table.testId, table.code),
  testIndex: index("items_test_idx").on(table.testId),
}));

export const evaluationAssignments = pgTable("evaluation_assignments", {
  id: serial("id").primaryKey(),
  organizationId: integer("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  personId: integer("personId").notNull().references(() => people.id, { onDelete: "cascade" }),
  testId: integer("testId").notNull().references(() => psychometricTests.id, { onDelete: "restrict" }),
  process: varchar("process", { length: 120 }).notNull(),
  status: assignmentStatusEnum("status").default("assigned").notNull(),
  consentAccepted: boolean("consentAccepted").default(false).notNull(),
  consentVersion: varchar("consentVersion", { length: 50 }),
  startedAt: timestamp("startedAt", { withTimezone: true }),
  completedAt: timestamp("completedAt", { withTimezone: true }),
  dueAt: timestamp("dueAt", { withTimezone: true }),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
}, table => ({
  personIndex: index("assignments_person_idx").on(table.personId),
  testIndex: index("assignments_test_idx").on(table.testId),
  statusIndex: index("assignments_status_idx").on(table.status),
}));

export const itemResponses = pgTable("item_responses", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignmentId").notNull().references(() => evaluationAssignments.id, { onDelete: "cascade" }),
  itemId: integer("itemId").notNull().references(() => testItems.id, { onDelete: "restrict" }),
  numericScore: doublePrecision("numericScore").notNull(),
  answeredAt: auditTimestamp("answeredAt"),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
}, table => ({
  assignmentItemUnique: uniqueIndex("assignment_item_unique").on(table.assignmentId, table.itemId),
  assignmentIndex: index("responses_assignment_idx").on(table.assignmentId),
}));

export const evaluationResults = pgTable("evaluation_results", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignmentId").notNull().unique().references(() => evaluationAssignments.id, { onDelete: "cascade" }),
  rawScore: doublePrecision("rawScore").notNull(),
  maxScore: doublePrecision("maxScore").notNull(),
  scorePercent: doublePrecision("scorePercent").notNull(),
  percentile: doublePrecision("percentile"),
  level: resultLevelEnum("level").notNull(),
  recommendation: recommendationEnum("recommendation").notNull(),
  interpretation: text("interpretation").notNull(),
  dimensionScores: jsonb("dimensionScores").notNull(),
  createdAt: auditTimestamp("createdAt"),
  updatedAt: updatedTimestamp("updatedAt"),
});

export const privacyConsents = pgTable("privacy_consents", {
  id: serial("id").primaryKey(),
  organizationId: integer("organizationId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  personId: integer("personId").notNull().references(() => people.id, { onDelete: "cascade" }),
  assignmentId: integer("assignmentId").notNull().references(() => evaluationAssignments.id, { onDelete: "cascade" }),
  documentVersion: varchar("documentVersion", { length: 50 }).notNull(),
  acceptedAt: auditTimestamp("acceptedAt"),
  method: varchar("method", { length: 80 }).notNull(),
  createdAt: auditTimestamp("createdAt"),
}, table => ({
  assignmentIndex: index("consents_assignment_idx").on(table.assignmentId),
}));

