import { AdminHeader } from "@/components/admin/AdminBits";
import { SettingsForm } from "@/app/admin/settings/SettingsForm";
import { getSettings } from "@/lib/settings";
import { signOut } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <>
      <AdminHeader
        title="Settings"
        subtitle="Site text, fees, and payment details - no developer needed"
      />
      <div className="p-4 md:p-6">
        <SettingsForm settings={settings} />

        <form action={signOut} className="mt-8 border-t border-cream-200 pt-5">
          <button
            type="submit"
            className="min-h-11 rounded-md border border-cream-200 bg-cream-50 px-4 text-sm text-ink"
          >
            Sign out
          </button>
        </form>
      </div>
    </>
  );
}
