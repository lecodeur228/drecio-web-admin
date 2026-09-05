import { getTranslations } from "next-intl/server";

import { SystemModelsForm } from "@/features/admin/system-models-form";
import { ApiError } from "@/lib/api/errors";
import { getAdminSystemConfig, listRodiumModels } from "@/lib/api/admin";
import type { RodiumModelsCatalogue } from "@/types/admin";

export default async function SystemModelsPage() {
  const t = await getTranslations("admin.system");
  const config = await getAdminSystemConfig();

  let catalogue: RodiumModelsCatalogue | null = null;
  let catalogueError: string | undefined;
  try {
    catalogue = await listRodiumModels();
  } catch (error) {
    catalogueError =
      error instanceof ApiError
        ? error.message
        : t("modelsFetchError");
  }

  return (
    <SystemModelsForm
      config={config}
      catalogue={catalogue}
      catalogueError={catalogueError}
    />
  );
}
