"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect } from "react";
import { useTranslations } from "next-intl";

import { login, type AuthState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [state, action, pending] = useActionState(login, {} as AuthState);

  useEffect(() => {
    if (state.redirectTo) {
      router.replace(state.redirectTo);
    }
  }, [router, state.redirectTo]);

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className="h-11 rounded-xl bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="h-11 rounded-xl bg-background"
        />
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      <Button
        type="submit"
        disabled={pending}
        className="h-11 rounded-xl text-sm"
      >
        {pending ? t("pendingLogin") : t("submitLogin")}
      </Button>
    </form>
  );
}
