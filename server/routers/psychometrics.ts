import { TRPCError } from "@trpc/server";
import { z } from "zod";
import {
  acceptConsent,
  bootstrapCatalog,
  completeAssignment,
  createAssignment,
  createPerson,
  getOrganization,
  getPersonHistory,
  getAdminDashboard,
  getAssignmentSession,
  getEvaluationResult,
  listAdminAssignments,
  listPeople,
  listTests,
  listUserAssignments,
  saveItemResponse,
  updateTestScoringConfig,
  updateOrganizationPrivacy,
} from "../db";
import { adminProcedure, protectedProcedure, router } from "../_core/trpc";

const scoringConfigSchema = z.object({
  lowMax: z.number().min(0).max(100),
  mediumMax: z.number().min(0).max(100),
  referenceLabel: z.string().min(3).max(120),
  version: z.string().min(1).max(50),
  percentileReference: z.object({
    p25Score: z.number().min(1).max(98),
    p50Score: z.number().min(2).max(99),
    p75Score: z.number().min(3).max(100),
  }).optional(),
}).refine(value => value.lowMax < value.mediumMax, {
  message: "El máximo bajo debe ser menor que el máximo medio.",
}).refine(value => !value.percentileReference || (value.percentileReference.p25Score < value.percentileReference.p50Score && value.percentileReference.p50Score < value.percentileReference.p75Score), {
  message: "La referencia debe respetar P25 < P50 < P75.",
});

export const psychometricsRouter = router({
  catalog: router({
    bootstrap: adminProcedure.mutation(async () => bootstrapCatalog()),
    list: protectedProcedure.query(async () => listTests()),
    updateScoring: adminProcedure
      .input(z.object({ testId: z.number().int().positive(), scoringConfig: scoringConfigSchema }))
      .mutation(async ({ input }) => updateTestScoringConfig(input.testId, input.scoringConfig)),
  }),
  people: router({
    list: adminProcedure.query(async () => listPeople()),
    history: adminProcedure.input(z.object({ personId: z.number().int().positive() })).query(async ({ input }) => getPersonHistory(input.personId)),
    create: adminProcedure
      .input(z.object({
        fullName: z.string().min(3).max(120),
        email: z.string().email(),
        personType: z.enum(["candidate", "employee"]),
        position: z.string().min(2).max(120),
        area: z.string().min(2).max(120),
      }))
      .mutation(async ({ input }) => createPerson(input)),
  }),
  organization: router({
    get: adminProcedure.query(async () => getOrganization()),
    updatePrivacy: adminProcedure.input(z.object({
      name: z.string().min(3).max(180),
      legalName: z.string().min(3).max(240),
      address: z.string().min(8).max(1000),
      privacyContactEmail: z.string().email(),
      privacyChannel: z.string().min(8).max(320),
      privacyNoticeVersion: z.string().min(3).max(50),
    })).mutation(async ({ input }) => updateOrganizationPrivacy(input)),
  }),
  assignments: router({
    listAdmin: adminProcedure.query(async () => listAdminAssignments()),
    create: adminProcedure
      .input(z.object({
        personId: z.number().int().positive(),
        testId: z.number().int().positive(),
        process: z.string().min(2).max(120),
      }))
      .mutation(async ({ input }) => createAssignment(input)),
    mine: protectedProcedure.query(async ({ ctx }) => listUserAssignments(ctx.user)),
    session: protectedProcedure
      .input(z.object({ assignmentId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => getAssignmentSession(input.assignmentId, ctx.user)),
    acceptConsent: protectedProcedure
      .input(z.object({ assignmentId: z.number().int().positive(), documentVersion: z.string().min(1).max(50) }))
      .mutation(async ({ ctx, input }) => acceptConsent(input.assignmentId, input.documentVersion, ctx.user)),
    saveResponse: protectedProcedure
      .input(z.object({ assignmentId: z.number().int().positive(), itemId: z.number().int().positive(), value: z.number().min(0).max(5) }))
      .mutation(async ({ ctx, input }) => saveItemResponse(input.assignmentId, input.itemId, input.value, ctx.user)),
    complete: protectedProcedure
      .input(z.object({ assignmentId: z.number().int().positive() }))
      .mutation(async ({ ctx, input }) => completeAssignment(input.assignmentId, ctx.user)),
    result: protectedProcedure
      .input(z.object({ assignmentId: z.number().int().positive() }))
      .query(async ({ ctx, input }) => {
        const result = await getEvaluationResult(input.assignmentId, ctx.user);
        if (!result) throw new TRPCError({ code: "NOT_FOUND", message: "El resultado aún no está disponible." });
        return result;
      }),
  }),
  dashboard: router({
    overview: adminProcedure.query(async () => getAdminDashboard()),
  }),
});
