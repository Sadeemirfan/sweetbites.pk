/**
 * Pakistani mobile numbers: 11 digits, 03XXXXXXXXX. Spaces, dashes and
 * a +92 / 0092 country prefix are all accepted on input and normalised
 * to the local 03… form, because that is how the shop already stores
 * and dials them.
 */
export function normalisePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.startsWith("0092")) return `0${digits.slice(4)}`;
  if (digits.startsWith("92")) return `0${digits.slice(2)}`;
  return digits;
}
