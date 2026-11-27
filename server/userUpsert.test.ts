import { describe, expect, it } from "vitest";
import { buildUserUpsertPlan } from "./userUpsert";

const OWNER_OPEN_ID = "owner-open-id";

describe("plan de upsert de usuario", () => {
  it("preserva el rol almacenado cuando el login no especifica uno", () => {
    const plan = buildUserUpsertPlan({ openId: "admin-open-id" }, OWNER_OPEN_ID);

    expect(plan.values.role).toBe("user");
    expect(plan.updateSet).not.toHaveProperty("role");
  });

  it("permite actualizar el rol cuando la llamada lo especifica explícitamente", () => {
    const plan = buildUserUpsertPlan({ openId: "admin-open-id", role: "user" }, OWNER_OPEN_ID);

    expect(plan.values.role).toBe("user");
    expect(plan.updateSet.role).toBe("user");
  });

  it("asigna admin al propietario y lo conserva en logins posteriores", () => {
    const plan = buildUserUpsertPlan({ openId: OWNER_OPEN_ID }, OWNER_OPEN_ID);

    expect(plan.values.role).toBe("admin");
    expect(plan.updateSet.role).toBe("admin");
  });

  it("da rol user a una cuenta nueva que no es propietaria", () => {
    const plan = buildUserUpsertPlan({ openId: "candidate-open-id" }, OWNER_OPEN_ID);

    expect(plan.values.role).toBe("user");
    expect(plan.updateSet).not.toHaveProperty("role");
  });

  it("rechaza un openId vacío", () => {
    expect(() => buildUserUpsertPlan({ openId: "" }, OWNER_OPEN_ID)).toThrow("User openId is required for upsert");
  });
});
