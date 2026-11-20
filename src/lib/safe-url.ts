const ALLOWED_EXTERNAL_PROTOCOLS = new Set(["https:", "mailto:"]);
const CONTROL_CHAR_OR_BACKSLASH = /[\u0000-\u001f\u007f\\]/;
const SENTINEL_ORIGIN = "https://local.invalid";

/**
 * Validates that a URL is safe to bind to an anchor `href`.
 * Rejects control characters/backslashes (WHATWG URL normalization bypasses),
 * and permits only safe internal `/` paths, `#` anchors, and `https:` / `mailto:` URLs.
 */
export function isSafeHref(rawHref: string): boolean {
  const trimmed = rawHref.trim();
  if (trimmed.length === 0 || CONTROL_CHAR_OR_BACKSLASH.test(trimmed)) {
    return false;
  }

  if (trimmed.startsWith("#")) {
    return trimmed.length > 1 && !/\s/.test(trimmed);
  }

  if (trimmed.startsWith("/")) {
    if (trimmed.startsWith("//")) {
      return false;
    }
    try {
      return new URL(trimmed, SENTINEL_ORIGIN).origin === SENTINEL_ORIGIN;
    } catch {
      return false;
    }
  }

  try {
    const parsed = new URL(trimmed);
    return ALLOWED_EXTERNAL_PROTOCOLS.has(parsed.protocol);
  } catch {
    return false;
  }
}

export function isExternalHttpUrl(rawHref: string): boolean {
  const trimmed = rawHref.trim();
  if (trimmed.length === 0 || CONTROL_CHAR_OR_BACKSLASH.test(trimmed)) {
    return false;
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export function assertSafeHref(rawHref: string): string {
  if (!isSafeHref(rawHref)) {
    throw new Error(`Unsafe href rejected: "${rawHref}"`);
  }
  return rawHref.trim();
}
