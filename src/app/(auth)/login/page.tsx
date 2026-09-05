import { getTranslations } from "next-intl/server";
import { LoginForm } from "@/features/auth/login-form";

export default async function LoginPage() {
  const t = await getTranslations("auth");
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">{t("loginTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("loginSubtitle")}</p>
      </div>
      <LoginForm />
    </div>
  );
}
