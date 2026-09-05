import { getTranslations } from "next-intl/server";

import { getAdminSystemConfig } from "@/lib/api/admin";

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export default async function SystemStatusPage() {
  const t = await getTranslations("admin.system");
  const config = await getAdminSystemConfig();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{t("statusHint")}</p>
      <div className="rounded-2xl bg-card px-5 ring-1 ring-foreground/8 lg:max-w-3xl">
        <Row label={t("api")} value={config.api_status} />
        <Row label={t("database")} value={config.database_status} />
        <Row
          label={t("rodium")}
          value={config.rodium_configured ? t("configured") : t("missing")}
        />
        <Row label={t("imageModel")} value={config.image_model} />
        <Row label={t("videoModel")} value={config.video_model} />
        <Row
          label={t("enableImage")}
          value={config.enable_image_generation ? t("on") : t("off")}
        />
        <Row
          label={t("enableVideo")}
          value={config.enable_video_generation ? t("on") : t("off")}
        />
      </div>
    </div>
  );
}
