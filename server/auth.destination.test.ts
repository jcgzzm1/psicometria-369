import { describe, expect, it } from "vitest";
import { getPostLoginDestination } from "./_core/oauth";

describe("destino posterior al inicio de sesión", () => {
  it("lleva a la cuenta administradora al espacio Nexo Persona", () => {
    expect(getPostLoginDestination("admin")).toBe("/admin");
  });

  it("lleva a una cuenta evaluada a sus evaluaciones", () => {
    expect(getPostLoginDestination("user")).toBe("/mis-evaluaciones");
  });

  it("aplica el destino seguro de evaluado si aún no se resuelve el rol", () => {
    expect(getPostLoginDestination(null)).toBe("/mis-evaluaciones");
  });
});
