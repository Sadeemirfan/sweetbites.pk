import { redirect } from "next/navigation";
import { isBranch } from "@/lib/branches";

type Params = { branch: string };

/**
 * "Menu" and "Gallery" used to be two separate pages showing essentially
 * the same cakes. Gallery is the real, structured catalogue (categories,
 * products, photos), so it's the one that stays - this route just
 * forwards old links instead of breaking them.
 */
export default async function MenuRedirectPage({ params }: { params: Promise<Params> }) {
  const { branch } = await params;
  redirect(isBranch(branch) ? `/${branch}/gallery` : "/");
}
