import "server-only";

import { cache } from "react";

import type { Article } from "@/types/api";

import { api } from "./client";
import { endpoints } from "./endpoints";

export async function createArticle(formData: FormData): Promise<Article> {
  return api<Article>(endpoints.articles.collection, {
    method: "POST",
    body: formData,
  });
}

export async function patchArticle(
  id: string,
  body: { categorie?: string | null },
): Promise<Article> {
  return api<Article>(endpoints.articles.byId(id), {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export const getArticle = cache(async function getArticle(id: string): Promise<Article> {
  return api<Article>(endpoints.articles.byId(id));
});

export const listArticles = cache(async function listArticles(): Promise<Article[]> {
  return api<Article[]>(endpoints.articles.collection);
});
