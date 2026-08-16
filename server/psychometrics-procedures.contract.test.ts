import { describe, expect, it, vi } from "vitest";
import type { TrpcContext } from "./_core/context";

const mocks = vi.hoisted(() => ({
  acceptConsent: vi.fn(),
  bootstrapCatalog: vi.fn(),
  completeAssignment: vi.fn(),
  createAssignment: vi.fn(),
  createPerson: vi.fn(),
  getAdminDashboard: vi.fn(),
  getAssignmentSession: vi.fn(),
  getEvaluationResult: vi.fn(),
  getOrganization: vi.fn(),
  getPersonHistory: vi.fn(),
  listAdminAssignments: vi.fn(),
  listPeople: vi.fn(),
  listTests: vi.fn(),
  listUserAssignments: vi.fn(),
  saveItemResponse: vi.fn(),
  updateOrganizationPrivacy: vi.fn(),
  updateTestScoringConfig: vi.fn(),
}));

vi.mock("./db", () => mocks);

import { appRouter } from "./routers";

function createUserContext(): TrpcContext {
  return {
    user: {
      id: 24,
      openId: "evaluado-24",
      name: "Evaluado de prueba",
      email: "evaluado@empresa.mx",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: { clearCookie: vi.fn() } as unknown as TrpcContext["res"],
  };
}

describe("contratos de procedimientos psicométricos", () => {
  it("envía el consentimiento trazable a la capa de persistencia", async () => {
    mocks.acceptConsent.mockResolvedValue({ success: true });
    const caller = appRouter.createCaller(createUserContext());

    await expect(caller.psychometrics.assignments.acceptConsent({ assignmentId: 7, documentVersion: "v-2026" })).resolves.toEqual({ success: true });
    expect(mocks.acceptConsent).toHaveBeenCalledWith(7, "v-2026", expect.objectContaining({ id: 24, role: "user" }));
  });

  it("persiste una respuesta válida y devuelve la marca de guardado", async () => {
    mocks.saveItemResponse.mockResolvedValue({ success: true, savedAt: new Date("2026-08-16T00:00:00Z") });
    const caller = appRouter.createCaller(createUserContext());

    const result = await caller.psychometrics.assignments.saveResponse({ assignmentId: 7, itemId: 14, value: 4 });

    expect(result.success).toBe(true);
    expect(mocks.saveItemResponse).toHaveBeenCalledWith(7, 14, 4, expect.objectContaining({ id: 24 }));
  });

  it("expone respuestas persistidas y punto de reanudación de una sesión", async () => {
    mocks.getAssignmentSession.mockResolvedValue({
      assignment: { id: 7, status: "in_progress" },
      person: { id: 2, fullName: "Persona", position: "Operación", area: "Planta" },
      organization: { privacyNoticeVersion: "v-2026" },
      test: { id: 3, items: [] },
      responses: { item_1: 4, item_2: 3 },
      resume: { answeredCount: 2, totalItems: 5, progressPercent: 40, nextItemIndex: 2 },
    });
    const caller = appRouter.createCaller(createUserContext());

    const session = await caller.psychometrics.assignments.session({ assignmentId: 7 });

    expect(session.responses).toEqual({ item_1: 4, item_2: 3 });
    expect(session.resume).toMatchObject({ progressPercent: 40, nextItemIndex: 2 });
    expect(mocks.getAssignmentSession).toHaveBeenCalledWith(7, expect.objectContaining({ id: 24 }));
  });

  it("finaliza la sesión mediante el procedimiento protegido", async () => {
    mocks.completeAssignment.mockResolvedValue({ scorePercent: 80, level: "alto", recommendation: "seleccion" });
    const caller = appRouter.createCaller(createUserContext());

    await expect(caller.psychometrics.assignments.complete({ assignmentId: 7 })).resolves.toMatchObject({ level: "alto" });
    expect(mocks.completeAssignment).toHaveBeenCalledWith(7, expect.objectContaining({ id: 24 }));
  });
});
