import { customAlphabet } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/I/l) so slugs are easy to read aloud or retype.
const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
const generate = customAlphabet(alphabet, 9);
const generateToken = customAlphabet(alphabet, 24);

export function generateSlug(): string {
  return generate();
}

export function generateEditToken(): string {
  return generateToken();
}
