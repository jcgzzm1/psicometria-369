import { describe, expect, it } from "vitest";
import { hasAssignmentAccess, isAllowedResponse, isPrivacyConfigurationComplete } from "../shared/evaluationGuards";

describe("guardas de evaluación", () => {
  const owner = { personUserId: 14, personEmail: "evaluado@empresa.mx" };

  it("autoriza al administrador y a la persona titular, pero bloquea a terceros", () => {
    expect(hasAssignmentAccess(owner, { id: 1, role: "admin", email: "rrhh@empresa.mx" })).toBe(true);
    expect(hasAssignmentAccess(owner, { id: 14, role: "user", email: "otro@empresa.mx" })).toBe(true);
    expect(hasAssignmentAccess(owner, { id: 15, role: "user", email: "EVALUADO@EMPRESA.MX" })).toBe(true);
    expect(hasAssignmentAccess(owner, { id: 15, role: "user", email: "tercero@empresa.mx" })).toBe(false);
  });

  it("exige datos completos del responsable antes de permitir consentimiento", () => {
    expect(isPrivacyConfigurationComplete({ legalName: "Empresa, S.A. de C.V.", address: "CDMX", privacyContactEmail: "privacidad@empresa.mx", privacyChannel: "https://empresa.mx/arco" })).toBe(true);
    expect(isPrivacyConfigurationComplete({ legalName: "Empresa, S.A. de C.V.", address: null, privacyContactEmail: "privacidad@empresa.mx", privacyChannel: "https://empresa.mx/arco" })).toBe(false);
  });

  it("solo persiste respuestas incluidas en las opciones del reactivo", () => {
    const options = [{ label: "A", value: 1 }, { label: "B", value: 2 }];
    expect(isAllowedResponse(2, options)).toBe(true);
    expect(isAllowedResponse(4, options)).toBe(false);
  });
});
