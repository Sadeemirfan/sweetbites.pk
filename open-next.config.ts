import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache yet - nothing in this app uses ISR or on-demand
// revalidation, so there's no R2 bucket to bind (see the note in
// wrangler.jsonc). Add one here when that changes.
export default defineCloudflareConfig();
