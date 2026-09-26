export function normalizeBrazilianWhatsApp(
  value: string | null,
): string | null {
  if (!value) {
    return null;
  }

  const normalized = value.replace(/\D/g, "");

  if (!normalized) {
    return null;
  }

  if (normalized.startsWith("55")) {
    if (normalized.length === 12 || normalized.length === 13) {
      return normalized;
    }

    return null;
  }

  if (normalized.length === 10 || normalized.length === 11) {
    return `55${normalized}`;
  }

  return null;
}