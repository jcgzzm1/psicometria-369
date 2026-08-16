import { boolean, double, index, int, json, mysqlEnum, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

export const organizations = mysqlTable("organizations", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 180 }).notNull(),
  legalName: varchar("legalName", { length: 240 }),
  address: text("address"),
  privacyContactEmail: varchar("privacyContactEmail", { length: 320 }),
  privacyChannel: varchar("privacyChannel", { length: 320 }),
  privacyNoticeVersion: varchar("privacyNoticeVersion", { length: 50 }).default("lfpdppp-mvp-2026-01").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const people = mysqlTable("people", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  userId: int("userId"),
  fullName: varchar("fullName", { length: 120 }).notNull(),
  email: varchar("email", { length: 320 }).notNull(),
  personType: mysqlEnum("personType", ["candidate", "employee"]).notNull(),
  position: varchar("position", { length: 120 }).notNull(),
  area: varchar("area", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["active", "archived"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  organizationEmailUnique: uniqueIndex("people_org_email_unique").on(table.organizationId, table.email),
  userIndex: index("people_user_idx").on(table.userId),
}));

export const psychometricTests = mysqlTable("psychometric_tests", {
  id: int("id").autoincrement().primaryKey(),
  code: varchar("code", { length: 50 }).notNull().unique(),
  name: varchar("name", { length: 180 }).notNull(),
  category: mysqlEnum("category", ["reasoning", "personality", "competency"]).notNull(),
  audience: mysqlEnum("audience", ["operativo", "mandos_medios", "todos"]).notNull(),
  durationMinutes: int("durationMinutes").notNull(),
  instructions: text("instructions").notNull(),
  scoringConfig: json("scoringConfig").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const testDimensions = mysqlTable("test_dimensions", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  code: varchar("code", { length: 80 }).notNull(),
  name: varchar("name", { length: 120 }).notNull(),
  description: text("description").notNull(),
  sortOrder: int("sortOrder").notNull(),
}, table => ({
  testDimensionUnique: uniqueIndex("test_dimension_unique").on(table.testId, table.code),
  testIndex: index("dimensions_test_idx").on(table.testId),
}));

export const testItems = mysqlTable("test_items", {
  id: int("id").autoincrement().primaryKey(),
  testId: int("testId").notNull(),
  dimensionId: int("dimensionId").notNull(),
  code: varchar("code", { length: 80 }).notNull(),
  prompt: text("prompt").notNull(),
  itemType: mysqlEnum("itemType", ["single_choice", "likert"]).notNull(),
  options: json("options").notNull(),
  reverseScored: boolean("reverseScored").default(false).notNull(),
  sortOrder: int("sortOrder").notNull(),
  isActive: boolean("isActive").default(true).notNull(),
}, table => ({
  testItemUnique: uniqueIndex("test_item_unique").on(table.testId, table.code),
  testIndex: index("items_test_idx").on(table.testId),
}));

export const evaluationAssignments = mysqlTable("evaluation_assignments", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  personId: int("personId").notNull(),
  testId: int("testId").notNull(),
  process: varchar("process", { length: 120 }).notNull(),
  status: mysqlEnum("status", ["assigned", "in_progress", "completed", "expired"]).default("assigned").notNull(),
  consentAccepted: boolean("consentAccepted").default(false).notNull(),
  consentVersion: varchar("consentVersion", { length: 50 }),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  dueAt: timestamp("dueAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  personIndex: index("assignments_person_idx").on(table.personId),
  testIndex: index("assignments_test_idx").on(table.testId),
  statusIndex: index("assignments_status_idx").on(table.status),
}));

export const itemResponses = mysqlTable("item_responses", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull(),
  itemId: int("itemId").notNull(),
  numericScore: double("numericScore").notNull(),
  answeredAt: timestamp("answeredAt").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
}, table => ({
  assignmentItemUnique: uniqueIndex("assignment_item_unique").on(table.assignmentId, table.itemId),
  assignmentIndex: index("responses_assignment_idx").on(table.assignmentId),
}));

export const evaluationResults = mysqlTable("evaluation_results", {
  id: int("id").autoincrement().primaryKey(),
  assignmentId: int("assignmentId").notNull().unique(),
  rawScore: double("rawScore").notNull(),
  maxScore: double("maxScore").notNull(),
  scorePercent: double("scorePercent").notNull(),
  percentile: double("percentile"),
  level: mysqlEnum("level", ["bajo", "medio", "alto"]).notNull(),
  recommendation: mysqlEnum("recommendation", ["seleccion", "desarrollo", "alerta"]).notNull(),
  interpretation: text("interpretation").notNull(),
  dimensionScores: json("dimensionScores").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const privacyConsents = mysqlTable("privacy_consents", {
  id: int("id").autoincrement().primaryKey(),
  organizationId: int("organizationId").notNull(),
  personId: int("personId").notNull(),
  assignmentId: int("assignmentId").notNull(),
  documentVersion: varchar("documentVersion", { length: 50 }).notNull(),
  acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  method: varchar("method", { length: 80 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
}, table => ({
  assignmentIndex: index("consents_assignment_idx").on(table.assignmentId),
}));
