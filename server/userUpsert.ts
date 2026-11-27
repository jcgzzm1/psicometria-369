import type { InsertUser } from "../drizzle/schema";

export function buildUserUpsertPlan(user: InsertUser, ownerOpenId: string) {
  if (!user.openId) throw new Error("User openId is required for upsert");

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

  const isOwner = Boolean(ownerOpenId) && user.openId === ownerOpenId;
  values.role = user.role ?? (isOwner ? "admin" : "user");

  // Solo cambiar el rol almacenado si se recibió explícitamente o si coincide el propietario.
  // En upserts de autenticación normales, la ausencia de role preserva cualquier promoción manual.
  if (user.role !== undefined) {
    updateSet.role = user.role;
  } else if (isOwner) {
    updateSet.role = "admin";
  }

  return { values, updateSet };
}
