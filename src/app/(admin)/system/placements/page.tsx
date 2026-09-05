import { SystemPlacementsForm } from "@/features/admin/system-placements-form";
import { getAdminSystemConfig } from "@/lib/api/admin";

export default async function SystemPlacementsPage() {
  const config = await getAdminSystemConfig();
  return <SystemPlacementsForm zones={config.placement_zones ?? []} />;
}
