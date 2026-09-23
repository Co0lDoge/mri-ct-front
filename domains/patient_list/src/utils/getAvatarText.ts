export function getAvatarText(fullName: string, fallback = ' '): string {
  const trimmed = fullName?.trim?.() ?? '';
  if (!trimmed) return fallback;
  const firstChar = trimmed[0];
  return firstChar ?? fallback;
}

