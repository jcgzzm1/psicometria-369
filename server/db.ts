import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  evaluationAssignments,
  evaluationResults,
  itemResponses,
  organizations,
  people,
  privacyConsents,
  psychometricTests,
  testDimensions,
  testItems,
  users,
  type InsertUser,
} from "../drizzle/schema";
import { getCatalogTest, TEST_CATALOG, type TestDefinition } from "../shared/psychometrics";
import { hasAssignmentAccess, isAllowedResponse, isPrivacyConfigurationComplete } from "../shared/evaluationGuards";
import { getResumeState, validateCompletion, validateConsentAcceptance, validateResponseSave } from "../shared/assessmentWorkflow";
import { scoreTest } from "../shared/scoring";
import type { User } from "../drizzle/schema";
import { ENV } from "./_core/env";

type ScoringConfig = TestDefinition["scoringConfig"];

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

async function requireDb() {
  const db = await getDb();
  if (!db) throw new Error("La base de datos no está disponible.");
  return db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  for (const field of ["name", "email", "loginMethod"] as const) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
  values.lastSignedIn = user.lastSignedIn ?? new Date();
  updateSet.lastSignedIn = values.lastSignedIn;
  values.role = user.role ?? (user.openId === ENV.ownerOpenId ? "admin" : "user");
  updateSet.role = values.role;
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

function asScoringConfig(value: unknown): ScoringConfig {
  const fallback: ScoringConfig = { lowMax: 39, mediumMax: 69, referenceLabel: "Índice de referencia preliminar", version: "mvp-0.1" };
  if (!value || typeof value !== "object") return fallback;
  const candidate = value as Partial<ScoringConfig>;
  if (typeof candidate.lowMax !== "number" || typeof candidate.mediumMax !== "number") return fallback;
  return {
    lowMax: candidate.lowMax,
    mediumMax: candidate.mediumMax,
    referenceLabel: typeof candidate.referenceLabel === "string" ? candidate.referenceLabel : fallback.referenceLabel,
    version: typeof candidate.version === "string" ? candidate.version : fallback.version,
    percentileReference: candidate.percentileReference && typeof candidate.percentileReference === "object"
      ? candidate.percentileReference
      : undefined,
  };
}

async function getOrCreateOrganization() {
  const db = await requireDb();
  const existing = await db.select().from(organizations).limit(1);
  if (existing[0]) return existing[0];
  const created = await db.insert(organizations).values({
    name: "Organización principal",
    legalName: null,
    address: null,
    privacyContactEmail: null,
    privacyChannel: null,
  });
  const id = Number(created[0].insertId);
  const result = await db.select().from(organizations).where(eq(organizations.id, id)).limit(1);
  if (!result[0]) throw new Error("No se pudo crear la organización base.");
  return result[0];
}

export async function getOrganization() {
  return getOrCreateOrganization();
}

export async function updateOrganizationPrivacy(input: {
  name: string;
  legalName: string;
  address: string;
  privacyContactEmail: string;
  privacyChannel: string;
  privacyNoticeVersion: string;
}) {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  await db.update(organizations).set(input).where(eq(organizations.id, organization.id));
  return { success: true } as const;
}

export async function bootstrapCatalog() {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  for (const definition of TEST_CATALOG) {
    const existing = await db.select().from(psychometricTests).where(eq(psychometricTests.code, definition.code)).limit(1);
    let testId = existing[0]?.id;
    if (!testId) {
      const created = await db.insert(psychometricTests).values({
        code: definition.code,
        name: definition.name,
        category: definition.category,
        audience: definition.audience,
        durationMinutes: definition.durationMinutes,
        instructions: definition.instructions,
        scoringConfig: definition.scoringConfig,
      });
      testId = Number(created[0].insertId);
    }

    const existingDimensions = await db.select().from(testDimensions).where(eq(testDimensions.testId, testId));
    const dimensionIds = new Map(existingDimensions.map(dimension => [dimension.code, dimension.id]));
    for (let index = 0; index < definition.dimensions.length; index += 1) {
      const dimension = definition.dimensions[index];
      let dimensionId = dimensionIds.get(dimension.id);
      if (!dimensionId) {
        const created = await db.insert(testDimensions).values({
          testId,
          code: dimension.id,
          name: dimension.name,
          description: dimension.description,
          sortOrder: index + 1,
        });
        dimensionId = Number(created[0].insertId);
        dimensionIds.set(dimension.id, dimensionId);
      }
    }

    const existingItems = await db.select().from(testItems).where(eq(testItems.testId, testId));
    const itemCodes = new Set(existingItems.map(item => item.code));
    for (let index = 0; index < definition.items.length; index += 1) {
      const item = definition.items[index];
      if (itemCodes.has(item.id)) continue;
      const dimensionId = dimensionIds.get(item.dimensionId);
      if (!dimensionId) throw new Error(`No se encontró la dimensión ${item.dimensionId}.`);
      await db.insert(testItems).values({
        testId,
        dimensionId,
        code: item.id,
        prompt: item.prompt,
        itemType: item.type,
        options: item.options,
        reverseScored: item.reverseScored ?? false,
        sortOrder: index + 1,
      });
    }
  }
  return { organizationId: organization.id, importedTests: TEST_CATALOG.length };
}

export async function listTests() {
  const db = await requireDb();
  const records = await db.select().from(psychometricTests).where(eq(psychometricTests.isActive, true));
  return records.map(test => ({ ...test, scoringConfig: asScoringConfig(test.scoringConfig) }));
}

export async function updateTestScoringConfig(testId: number, scoringConfig: ScoringConfig) {
  const db = await requireDb();
  await db.update(psychometricTests).set({ scoringConfig }).where(eq(psychometricTests.id, testId));
  return { success: true } as const;
}

export async function listPeople() {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  const records = await db.select().from(people).where(eq(people.organizationId, organization.id)).orderBy(desc(people.createdAt));
  return records;
}

export async function createPerson(input: {
  fullName: string;
  email: string;
  personType: "candidate" | "employee";
  position: string;
  area: string;
}) {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  const created = await db.insert(people).values({
    organizationId: organization.id,
    fullName: input.fullName,
    email: normalizeEmail(input.email),
    personType: input.personType,
    position: input.position,
    area: input.area,
  });
  const id = Number(created[0].insertId);
  const person = await db.select().from(people).where(eq(people.id, id)).limit(1);
  return person[0];
}

export async function getPersonHistory(personId: number) {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  const person = await db.select().from(people)
    .where(and(eq(people.id, personId), eq(people.organizationId, organization.id)))
    .limit(1);
  if (!person[0]) throw new Error("La persona no existe o no pertenece a la organización.");
  const assignments = await db.select({
    assignmentId: evaluationAssignments.id,
    status: evaluationAssignments.status,
    process: evaluationAssignments.process,
    createdAt: evaluationAssignments.createdAt,
    startedAt: evaluationAssignments.startedAt,
    completedAt: evaluationAssignments.completedAt,
    consentAccepted: evaluationAssignments.consentAccepted,
    testName: psychometricTests.name,
    scorePercent: evaluationResults.scorePercent,
    percentile: evaluationResults.percentile,
    level: evaluationResults.level,
    recommendation: evaluationResults.recommendation,
  }).from(evaluationAssignments)
    .innerJoin(psychometricTests, eq(evaluationAssignments.testId, psychometricTests.id))
    .leftJoin(evaluationResults, eq(evaluationResults.assignmentId, evaluationAssignments.id))
    .where(eq(evaluationAssignments.personId, personId))
    .orderBy(desc(evaluationAssignments.createdAt));
  return { person: person[0], assignments };
}

export async function createAssignment(input: { personId: number; testId: number; process: string }) {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  const person = await db.select().from(people).where(and(eq(people.id, input.personId), eq(people.organizationId, organization.id))).limit(1);
  const test = await db.select().from(psychometricTests).where(eq(psychometricTests.id, input.testId)).limit(1);
  if (!person[0] || !test[0]) throw new Error("La persona o la prueba seleccionada no existen.");
  const created = await db.insert(evaluationAssignments).values({
    organizationId: organization.id,
    personId: input.personId,
    testId: input.testId,
    process: input.process,
  });
  return { id: Number(created[0].insertId), success: true } as const;
}

export async function listAdminAssignments() {
  const db = await requireDb();
  const organization = await getOrCreateOrganization();
  return db.select({
    assignmentId: evaluationAssignments.id,
    status: evaluationAssignments.status,
    process: evaluationAssignments.process,
    createdAt: evaluationAssignments.createdAt,
    completedAt: evaluationAssignments.completedAt,
    consentAccepted: evaluationAssignments.consentAccepted,
    personId: people.id,
    fullName: people.fullName,
    email: people.email,
    position: people.position,
    area: people.area,
    personType: people.personType,
    testId: psychometricTests.id,
    testName: psychometricTests.name,
    scorePercent: evaluationResults.scorePercent,
    level: evaluationResults.level,
    recommendation: evaluationResults.recommendation,
  }).from(evaluationAssignments)
    .innerJoin(people, eq(evaluationAssignments.personId, people.id))
    .innerJoin(psychometricTests, eq(evaluationAssignments.testId, psychometricTests.id))
    .leftJoin(evaluationResults, eq(evaluationResults.assignmentId, evaluationAssignments.id))
    .where(eq(evaluationAssignments.organizationId, organization.id))
    .orderBy(desc(evaluationAssignments.createdAt));
}

async function findPersonForUser(user: User) {
  const db = await requireDb();
  const email = normalizeEmail(user.email);
  if (!email) return undefined;
  const person = await db.select().from(people).where(eq(people.email, email)).limit(1);
  if (person[0] && person[0].userId !== user.id) {
    await db.update(people).set({ userId: user.id }).where(eq(people.id, person[0].id));
    return { ...person[0], userId: user.id };
  }
  return person[0];
}

function checkAssignmentAccess(record: { personUserId: number | null; personEmail: string }, user: User) {
  if (!hasAssignmentAccess(record, user)) throw new Error("No tienes acceso a esta evaluación.");
}

export async function listUserAssignments(user: User) {
  if (user.role === "admin") return listAdminAssignments();
  const person = await findPersonForUser(user);
  if (!person) return [];
  const db = await requireDb();
  return db.select({
    assignmentId: evaluationAssignments.id,
    status: evaluationAssignments.status,
    process: evaluationAssignments.process,
    createdAt: evaluationAssignments.createdAt,
    completedAt: evaluationAssignments.completedAt,
    consentAccepted: evaluationAssignments.consentAccepted,
    testName: psychometricTests.name,
    durationMinutes: psychometricTests.durationMinutes,
    scorePercent: evaluationResults.scorePercent,
    level: evaluationResults.level,
  }).from(evaluationAssignments)
    .innerJoin(psychometricTests, eq(evaluationAssignments.testId, psychometricTests.id))
    .leftJoin(evaluationResults, eq(evaluationResults.assignmentId, evaluationAssignments.id))
    .where(eq(evaluationAssignments.personId, person.id))
    .orderBy(desc(evaluationAssignments.createdAt));
}

async function getAssignmentRecord(assignmentId: number) {
  const db = await requireDb();
  const rows = await db.select({
    assignment: evaluationAssignments,
    test: psychometricTests,
    person: people,
  }).from(evaluationAssignments)
    .innerJoin(psychometricTests, eq(evaluationAssignments.testId, psychometricTests.id))
    .innerJoin(people, eq(evaluationAssignments.personId, people.id))
    .where(eq(evaluationAssignments.id, assignmentId))
    .limit(1);
  const row = rows[0];
  if (!row) throw new Error("La evaluación no existe.");
  return row;
}

export async function getAssignmentSession(assignmentId: number, user: User) {
  const db = await requireDb();
  const row = await getAssignmentRecord(assignmentId);
  checkAssignmentAccess({ personUserId: row.person.userId, personEmail: row.person.email }, user);
  const definition = getCatalogTest(row.test.code);
  if (!definition) throw new Error("La definición de la evaluación no está disponible.");
  const databaseItems = await db.select({ id: testItems.id, code: testItems.code })
    .from(testItems)
    .where(eq(testItems.testId, row.test.id));
  const itemIdByCode = new Map(databaseItems.map(item => [item.code, item.id]));
  const responses = await db.select({ itemId: testItems.code, value: itemResponses.numericScore })
    .from(itemResponses)
    .innerJoin(testItems, eq(itemResponses.itemId, testItems.id))
    .where(eq(itemResponses.assignmentId, assignmentId));
  const responseMap = Object.fromEntries(responses.map(response => [response.itemId, Number(response.value)]));
  return {
    assignment: row.assignment,
    person: { id: row.person.id, fullName: row.person.fullName, position: row.person.position, area: row.person.area },
    organization: await getOrCreateOrganization(),
    test: {
      ...definition,
      id: row.test.id,
      scoringConfig: asScoringConfig(row.test.scoringConfig),
      items: definition.items.map(item => ({ ...item, databaseId: itemIdByCode.get(item.id) })),
    },
    responses: responseMap,
    resume: getResumeState(Object.keys(responseMap), definition.items.map(item => item.id)),
  };
}

export async function acceptConsent(assignmentId: number, documentVersion: string, user: User) {
  const db = await requireDb();
  const row = await getAssignmentRecord(assignmentId);
  checkAssignmentAccess({ personUserId: row.person.userId, personEmail: row.person.email }, user);
  const organization = await getOrCreateOrganization();
  const consentValidation = validateConsentAcceptance({ privacyComplete: isPrivacyConfigurationComplete(organization), requestedVersion: documentVersion, activeVersion: organization.privacyNoticeVersion });
  if (!consentValidation.allowed) throw new Error(consentValidation.message);
  await db.insert(privacyConsents).values({
    organizationId: row.assignment.organizationId,
    personId: row.person.id,
    assignmentId,
    documentVersion,
    method: "electronic_checkbox_authenticated_session",
  });
  await db.update(evaluationAssignments).set({
    consentAccepted: true,
    consentVersion: documentVersion,
    status: row.assignment.status === "assigned" ? "in_progress" : row.assignment.status,
    startedAt: row.assignment.startedAt ?? new Date(),
  }).where(eq(evaluationAssignments.id, assignmentId));
  return { success: true } as const;
}

export async function saveItemResponse(assignmentId: number, itemId: number, value: number, user: User) {
  const db = await requireDb();
  const row = await getAssignmentRecord(assignmentId);
  checkAssignmentAccess({ personUserId: row.person.userId, personEmail: row.person.email }, user);
  const item = await db.select().from(testItems).where(and(eq(testItems.id, itemId), eq(testItems.testId, row.test.id))).limit(1);
  if (!item[0]) throw new Error("El reactivo no pertenece a esta evaluación.");
  const responseValidation = validateResponseSave({ consentAccepted: row.assignment.consentAccepted, status: row.assignment.status, optionAllowed: isAllowedResponse(value, item[0].options) });
  if (!responseValidation.allowed) throw new Error(responseValidation.message);
  await db.insert(itemResponses).values({ assignmentId, itemId, numericScore: value }).onDuplicateKeyUpdate({
    set: { numericScore: value, answeredAt: new Date() },
  });
  return { success: true, savedAt: new Date() } as const;
}

export async function completeAssignment(assignmentId: number, user: User) {
  const db = await requireDb();
  const row = await getAssignmentRecord(assignmentId);
  checkAssignmentAccess({ personUserId: row.person.userId, personEmail: row.person.email }, user);
  const catalogDefinition = getCatalogTest(row.test.code);
  if (!catalogDefinition) throw new Error("La definición de la evaluación no está disponible.");
  const definition: TestDefinition = { ...catalogDefinition, scoringConfig: asScoringConfig(row.test.scoringConfig) };
  const responses = await db.select({ code: testItems.code, score: itemResponses.numericScore })
    .from(itemResponses)
    .innerJoin(testItems, eq(itemResponses.itemId, testItems.id))
    .where(eq(itemResponses.assignmentId, assignmentId));
  const completionValidation = validateCompletion({ consentAccepted: row.assignment.consentAccepted, responseCount: responses.length, itemCount: catalogDefinition.items.length });
  if (!completionValidation.allowed) throw new Error(completionValidation.message);
  const answerMap = Object.fromEntries(responses.map(response => [response.code, Number(response.score)]));
  const result = scoreTest(definition, answerMap);
  await db.insert(evaluationResults).values({
    assignmentId,
    rawScore: result.rawScore,
    maxScore: result.maxScore,
    scorePercent: result.scorePercent,
    percentile: result.percentile,
    level: result.level,
    recommendation: result.recommendation,
    interpretation: result.note,
    dimensionScores: result.dimensions,
  }).onDuplicateKeyUpdate({
    set: {
      rawScore: result.rawScore,
      maxScore: result.maxScore,
      scorePercent: result.scorePercent,
      percentile: result.percentile,
      level: result.level,
      recommendation: result.recommendation,
      interpretation: result.note,
      dimensionScores: result.dimensions,
      updatedAt: new Date(),
    },
  });
  await db.update(evaluationAssignments).set({ status: "completed", completedAt: new Date() }).where(eq(evaluationAssignments.id, assignmentId));
  return result;
}

export async function getEvaluationResult(assignmentId: number, user: User) {
  const db = await requireDb();
  const row = await getAssignmentRecord(assignmentId);
  checkAssignmentAccess({ personUserId: row.person.userId, personEmail: row.person.email }, user);
  const result = await db.select().from(evaluationResults).where(eq(evaluationResults.assignmentId, assignmentId)).limit(1);
  if (!result[0]) return null;
  return {
    person: { fullName: row.person.fullName, position: row.person.position, area: row.person.area },
    test: { name: row.test.name, category: row.test.category },
    assignment: row.assignment,
    result: { ...result[0], dimensionScores: result[0].dimensionScores as unknown[] },
  };
}

export async function getAdminDashboard() {
  const records = await listAdminAssignments();
  const completed = records.filter(record => record.status === "completed");
  const summarize = (field: "area" | "position" | "process") => {
    const groups = new Map<string, { total: number; completed: number; totalScore: number; scoreCount: number }>();
    for (const record of records) {
      const value = record[field] || "Sin definir";
      const current = groups.get(value) ?? { total: 0, completed: 0, totalScore: 0, scoreCount: 0 };
      current.total += 1;
      if (record.status === "completed") current.completed += 1;
      if (record.scorePercent !== null) {
        current.totalScore += Number(record.scorePercent);
        current.scoreCount += 1;
      }
      groups.set(value, current);
    }
    return Array.from(groups.entries()).map(([label, value]) => ({
      label,
      total: value.total,
      completed: value.completed,
      averageScore: value.scoreCount ? Math.round(value.totalScore / value.scoreCount) : null,
    }));
  };
  const averageScore = completed.length
    ? Math.round(completed.reduce((total, record) => total + Number(record.scorePercent ?? 0), 0) / completed.length)
    : null;
  return {
    totals: {
      assigned: records.length,
      completed: completed.length,
      pending: records.filter(record => record.status !== "completed").length,
      high: completed.filter(record => record.level === "alto").length,
      averageScore,
    },
    byArea: summarize("area"),
    byPosition: summarize("position"),
    byProcess: summarize("process"),
    recent: records.slice(0, 8),
  };
}
