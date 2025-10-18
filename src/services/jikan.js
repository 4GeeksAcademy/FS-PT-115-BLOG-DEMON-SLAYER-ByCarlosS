// src/services/jikan.js
const API = "https://api.jikan.moe/v4";

function buildUrl(path, params = {}) {
  const url = new URL(API + path);
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  return url.toString();
}

export async function jikan(path, params = {}) {
  const res = await fetch(buildUrl(path, params));
  if (!res.ok) throw new Error(`Error ${res.status}`);
  return res.json();
}

export async function searchAnime({ q, page = 1, type = "", limit = 24, sfw = true }) {
  return jikan("/anime", {
    q: q || undefined,
    page,
    type: type || undefined,
    limit,
    sfw: sfw ? "true" : undefined,
    order_by: "score",
    sort: "desc",
  });
}

export async function getAnime(id) {
  return jikan(`/anime/${id}`);
}

export async function getAnimeEpisodes(id, page = 1) {
  return jikan(`/anime/${id}/episodes`, { page });
}

export async function getAnimeCharacters(id) {
  return jikan(`/anime/${id}/characters`);
}
