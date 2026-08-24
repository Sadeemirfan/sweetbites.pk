/**
 * Link to one object in a private bucket, served through
 * /api/private-file - which checks the admin session and redirects to a
 * short-lived signed URL (§5 keeps these buckets private).
 *
 * Pure string building, so this is safe to call from client components.
 */
export function privateFileUrl(
  bucket: "payment-proofs" | "receipts" | "order-refs",
  path: string
): string {
  return `/api/private-file?bucket=${bucket}&path=${encodeURIComponent(path)}`;
}
