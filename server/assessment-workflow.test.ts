import { describe, expect, it } from "vitest";
import { getResumeState, validateCompletion, validateConsentAcceptance, validateResponseSave } from "../shared/assessmentWorkflow";

describe("flujo de sesión de evaluación", () => {
  it("autoriza consentimiento únicamente con aviso completo y versión vigente", () => {
    expect(validateConsentAcceptance({ privacyComplete: true, requestedVersion: "v1", activeVersion: "v1" }).allowed).toBe(true);
    expect(validateConsentAcceptance({ privacyComplete: false, requestedVersion: "v1", activeVersion: "v1" }).allowed).toBe(false);
    expect(validateConsentAcceptance({ privacyComplete: true, requestedVersion: "v1", activeVersion: "v2" }).allowed).toBe(false);
  });

  it("permite guardar una respuesta solo en una sesión consentida, activa y válida", () => {
    expect(validateResponseSave({ consentAccepted: true, status: "in_progress", optionAllowed: true }).allowed).toBe(true);
    expect(validateResponseSave({ consentAccepted: false, status: "in_progress", optionAllowed: true }).allowed).toBe(false);
    expect(validateResponseSave({ consentAccepted: true, status: "completed", optionAllowed: true }).allowed).toBe(false);
    expect(validateResponseSave({ consentAccepted: true, status: "in_progress", optionAllowed: false }).allowed).toBe(false);
  });

  it("calcula el punto de reanudación a partir de las respuestas persistidas", () => {
    expect(getResumeState(["i1", "i2"], ["i1", "i2", "i3", "i4"]))
      .toEqual({ answeredCount: 2, totalItems: 4, progressPercent: 50, nextItemIndex: 2 });
  });

  it("bloquea la finalización si faltan reactivos", () => {
    expect(validateCompletion({ consentAccepted: true, responseCount: 4, itemCount: 4 }).allowed).toBe(true);
    expect(validateCompletion({ consentAccepted: true, responseCount: 3, itemCount: 4 }).allowed).toBe(false);
  });
});
