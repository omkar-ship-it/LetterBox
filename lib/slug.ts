import { customAlphabet } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/I/l) so slugs are easy to read aloud or retype.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const generateToken = customAlphabet(alphabet, 24);
// Same ambiguity exclusions, lowercase-only so it doesn't clash visually with the slugified name text it's appended to.
const generateSuffix = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 6);

export function generateEditToken(): string {
  return generateToken();
}

function slugifyNamePart(value: string, maxLength: number): string {
  const cleaned = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip accents (Jose -> Jose)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/g, ""); // a slice() cut mid-word can leave a trailing hyphen
  return cleaned;
}

/** Human-readable link like "priya-to-arjun-heartfelt-x7k2q9" instead of a
 * fully opaque code — the name/tone portion is just for a nicer link to
 * read and share, not the actual security boundary: a letter with no
 * passcode still relies on the slug being hard to guess, so a random
 * suffix (same ambiguity-free alphabet as generateEditToken) is always
 * appended rather than dropping it for pure vanity. Falls back to
 * "someone"/"letter" if a name or tone slugifies to nothing (e.g. a name
 * written entirely in a non-Latin script). */
export function generateReadableSlug(senderName: string, recipientName: string, tone: string): string {
  const sender = slugifyNamePart(senderName, 16) || "someone";
  const recipient = slugifyNamePart(recipientName, 16) || "someone";
  const toneSlug = slugifyNamePart(tone, 12) || "letter";
  return `${sender}-to-${recipient}-${toneSlug}-${generateSuffix()}`;
}
