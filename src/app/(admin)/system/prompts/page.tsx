import { SystemPromptsForm } from "@/features/admin/system-prompts-form";
import { getAdminSystemConfig } from "@/lib/api/admin";

export default async function SystemPromptsPage() {
  const config = await getAdminSystemConfig();
  return <SystemPromptsForm config={config} />;
}
