import { SystemFeaturesForm } from "@/features/admin/system-features-form";
import { getAdminSystemConfig } from "@/lib/api/admin";

export default async function SystemFeaturesPage() {
  const config = await getAdminSystemConfig();
  return <SystemFeaturesForm config={config} />;
}
