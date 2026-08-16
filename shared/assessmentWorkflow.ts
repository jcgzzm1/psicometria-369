export function validateConsentAcceptance(input: { privacyComplete: boolean; requestedVersion: string; activeVersion: string }) {
  if (!input.privacyComplete) return { allowed: false, message: "La organización debe completar el aviso de privacidad antes de solicitar consentimiento." } as const;
  if (input.requestedVersion !== input.activeVersion) return { allowed: false, message: "La versión del aviso de privacidad ya no es vigente." } as const;
  return { allowed: true } as const;
}

export function validateResponseSave(input: { consentAccepted: boolean; status: "assigned" | "in_progress" | "completed" | "expired"; optionAllowed: boolean }) {
  if (!input.consentAccepted) return { allowed: false, message: "Debes aceptar el aviso de privacidad antes de responder." } as const;
  if (input.status === "completed") return { allowed: false, message: "La evaluación ya fue finalizada." } as const;
  if (input.status === "expired") return { allowed: false, message: "La evaluación ya no está disponible." } as const;
  if (!input.optionAllowed) return { allowed: false, message: "La respuesta no corresponde a una opción válida del reactivo." } as const;
  return { allowed: true } as const;
}

export function getResumeState(savedItemCodes: string[], itemCodes: string[]) {
  const answered = new Set(savedItemCodes);
  const nextItemIndex = itemCodes.findIndex(code => !answered.has(code));
  return {
    answeredCount: answered.size,
    totalItems: itemCodes.length,
    progressPercent: itemCodes.length ? Math.round((answered.size / itemCodes.length) * 100) : 0,
    nextItemIndex: nextItemIndex === -1 ? Math.max(0, itemCodes.length - 1) : nextItemIndex,
  };
}

export function validateCompletion(input: { consentAccepted: boolean; responseCount: number; itemCount: number }) {
  if (!input.consentAccepted) return { allowed: false, message: "Debes aceptar el aviso de privacidad antes de finalizar." } as const;
  if (input.responseCount !== input.itemCount) return { allowed: false, message: "Responde todos los reactivos antes de finalizar la evaluación." } as const;
  return { allowed: true } as const;
}
