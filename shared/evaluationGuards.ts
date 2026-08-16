export type EvaluationActor = {
  id: number;
  role: "admin" | "user";
  email: string | null;
};

export type AssignmentOwner = {
  personUserId: number | null;
  personEmail: string;
};

function normalizeEmail(email: string | null | undefined) {
  return email?.trim().toLowerCase() ?? "";
}

export function hasAssignmentAccess(owner: AssignmentOwner, actor: EvaluationActor) {
  if (actor.role === "admin") return true;
  return owner.personUserId === actor.id || normalizeEmail(owner.personEmail) === normalizeEmail(actor.email);
}

export function isPrivacyConfigurationComplete(organization: {
  legalName: string | null;
  address: string | null;
  privacyContactEmail: string | null;
  privacyChannel: string | null;
}) {
  return Boolean(organization.legalName && organization.address && organization.privacyContactEmail && organization.privacyChannel);
}

export function isAllowedResponse(value: number, options: unknown) {
  if (!Array.isArray(options)) return false;
  return options.some(option => typeof option === "object" && option !== null && "value" in option && (option as { value: unknown }).value === value);
}
