import { isAllowedMediaUrl } from "@/lib/media";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const source = searchParams.get("url");
  const filename = (searchParams.get("filename") ?? "drecio-visuel").replace(
    /[^\w.-]/g,
    "_",
  );

  if (!source || !isAllowedMediaUrl(source)) {
    return new Response("URL de média non autorisée.", { status: 400 });
  }

  const upstream = await fetch(source, { cache: "no-store" });
  if (!upstream.ok || !upstream.body) {
    return new Response("Téléchargement impossible.", { status: 502 });
  }

  const contentType =
    upstream.headers.get("content-type") ?? "application/octet-stream";
  return new Response(upstream.body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=60",
    },
  });
}
