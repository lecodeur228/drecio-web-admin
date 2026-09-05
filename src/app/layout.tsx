import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";

import { Providers } from "@/components/providers";
import { assets } from "@/lib/assets";

import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3001";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const title = t("title");
  const description = t("description");

  return {
    metadataBase: new URL(appUrl),
    applicationName: "Drecio Admin",
    title: {
      default: title,
      template: "%s · Drecio",
    },
    description,
    icons: {
      icon: [{ url: assets.logo.icon, type: "image/png" }],
      apple: [{ url: assets.logo.icon, type: "image/png" }],
      shortcut: assets.logo.icon,
    },
    openGraph: {
      type: "website",
      siteName: "Drecio Admin",
      title,
      description,
      images: [
        {
          url: assets.logo.fullBlack,
          width: 1200,
          height: 1200,
          alt: "Drecio",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [assets.logo.fullBlack],
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className={jakarta.variable} suppressHydrationWarning>
      <body className="min-h-svh font-sans" suppressHydrationWarning>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>{children}</Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
