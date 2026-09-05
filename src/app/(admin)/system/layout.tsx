import { getTranslations } from "next-intl/server";

import { PageHeader } from "@/components/layout/page-header";

export default async function SystemLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = await getTranslations("admin.system");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} subtitle={t("subtitle")} />
      {children}
    </div>
  );
}
