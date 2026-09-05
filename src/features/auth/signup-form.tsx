"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";
import { useTranslations } from "next-intl";

import { signup, type AuthState } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMAGE_ACCEPT } from "@/lib/image-upload";

export function SignupForm() {
  const t = useTranslations("auth");
  const [state, action, pending] = useActionState(signup, {} as AuthState);
  const [logoName, setLogoName] = useState<string | null>(null);
  const logoRef = useRef<HTMLInputElement>(null);

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
          autoComplete="new-password"
          required
          minLength={8}
          className="h-11 rounded-xl bg-background"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="logo">{t("logoOptional")}</Label>
        <input
          ref={logoRef}
          id="logo"
          name="logo"
          type="file"
          accept={IMAGE_ACCEPT}
          className="sr-only"
          onChange={(event) => {
            setLogoName(event.target.files?.[0]?.name ?? null);
          }}
        />
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full rounded-xl"
          onClick={() => logoRef.current?.click()}
        >
          {logoName ?? t("logoOptional")}
        </Button>
        <p className="text-xs text-muted-foreground">{t("logoHint")}</p>
      </div>
      {state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state.message ? (
        <p className="text-sm text-foreground">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending} className="h-11 rounded-xl text-sm">
        {pending ? t("pendingSignup") : t("submitSignup")}
      </Button>
      <p className="text-center text-sm text-muted-foreground">
        {t("hasAccount")}{" "}
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          {t("submitLogin")}
        </Link>
      </p>
    </form>
  );
}
