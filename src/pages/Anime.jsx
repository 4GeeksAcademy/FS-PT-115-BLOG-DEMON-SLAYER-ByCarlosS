import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { getAnime, getAnimeCharacters, getAnimeEpisodes } from "../services/jikan.js";

export function Anime() {
  const { id } = useParams();
  const { store, dispatch } = useGlobalReducer();

  const [info, setInfo] = useState(null);
  const [episodes, setEpisodes] = useState([]);
  const [epPage, setEpPage] = useState(1);
  const [epHasMore, setEpHasMore] = useState(false);
  const [chars, setChars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let cancel = false;
    async function load() {
      try {
        setLoading(true);
        setErr("");
        const [a, e, c] = await Promise.all([
          getAnime(id),
          getAnimeEpisodes(id, 1),
          getAnimeCharacters(id),
        ]);
        if (cancel) return;
        setInfo(a.data);
        setEpisodes(e.data || []);
        setEpHasMore(Boolean(e.pagination?.has_next_page));
        setChars(c.data || []);
      } catch (error) {
        if (!cancel) setErr(error.message || "Error cargando datos");
      } finally {
        if (!cancel) setLoading(false);
      }
    }
    load();
    return () => { cancel = true; };
  }, [id]);

  async function loadMoreEpisodes(nextPage) {
    try {
      const e = await getAnimeEpisodes(id, nextPage);
      setEpisodes((prev) => [...prev, ...(e.data || [])]);
      setEpHasMore(Boolean(e.pagination?.has_next_page));
      setEpPage(nextPage);
    } catch {}
  }

  const cover =
    info?.images?.jpg?.large_image_url ||
    info?.images?.jpg?.image_url ||
    info?.images?.webp?.image_url ||
    null;

  const isFav = store.favorites?.some((f) => f.mal_id === Number(id));

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">
          <Link to="/" className="text-decoration-none me-2">←</Link>
          {info?.title || "Anime"}
        </h3>
        <div className="d-flex gap-2">
          <button
            className={`btn ${isFav ? "btn-danger" : "btn-outline-secondary"}`}
            onClick={() =>
              dispatch({
                type: "fav_toggle",
                payload: { mal_id: Number(id), title: info?.title || "Anime", image: cover },
              })
            }
          >
            {isFav ? "Quitar de favoritos" : "Agregar a favoritos"}
          </button>
          {info?.url && (
            <a href={info.url} className="btn btn-outline-primary" target="_blank" rel="noreferrer">
              Ver en MAL
            </a>
          )}
        </div>
      </div>

      {err && <div className="alert alert-danger">{err}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" role="status" /></div>
      ) : (
        <>
          <div className="row g-3">
            <div className="col-12 col-md-4">
              {cover && <img src={cover} className="img-fluid rounded" alt={info?.title} />}
              <div className="mt-2 small text-muted">{info?.genres?.map((g) => g.name).join(" · ")}</div>
            </div>
            <div className="col-12 col-md-8">
              <p className="mb-1"><span className="fw-semibold">Tipo:</span> {info?.type || "—"}</p>
              <p className="mb-1"><span className="fw-semibold">Episodios:</span> {info?.episodes ?? "?"}</p>
              <p className="mb-1"><span className="fw-semibold">Estado:</span> {info?.status || "—"}</p>
              <p className="mb-1"><span className="fw-semibold">Puntuación:</span> {info?.score ?? "—"}</p>
              <p className="mt-3">{info?.synopsis || "Sin sinopsis."}</p>
            </div>
          </div>

          <hr className="my-4" />

          <h5 className="mb-2">Episodios</h5>
          <div className="list-group mb-3">
            {episodes.length === 0 && <div className="text-muted">No hay episodios disponibles.</div>}
            {episodes.map((ep) => (
              <div className="list-group-item" key={ep.mal_id || ep.episode}>
                <div className="d-flex justify-content-between">
                  <div>
                    <span className="badge text-bg-primary me-2">#{ep.mal_id || ep.episode}</span>
                    <strong>{ep.title || ep.titles?.[0]?.title || "Episodio"}</strong>
                  </div>
                  <small className="text-muted">{ep.aired || ep.aired?.string || ""}</small>
                </div>
                {ep.forum_url && (
                  <a className="small" href={ep.forum_url} target="_blank" rel="noreferrer">Ver foro</a>
                )}
              </div>
            ))}
          </div>
          {epHasMore && (
            <div className="d-grid">
              <button className="btn btn-outline-secondary" onClick={() => loadMoreEpisodes(epPage + 1)}>
                Cargar más episodios
              </button>
            </div>
          )}

          <hr className="my-4" />

          <h5 className="mb-2">Personajes</h5>
          <div className="row row-cols-2 row-cols-md-3 g-3">
            {chars.length === 0 && <div className="text-muted">Sin personajes.</div>}
            {chars.map((c) => (
              <div className="col" key={c.character?.mal_id}>
                <div className="card h-100">
                  {c.character?.images?.jpg?.image_url && (
                    <img
                      src={c.character.images.jpg.image_url}
                      className="card-img-top"
                      alt={c.character?.name}
                    />
                  )}
                  <div className="card-body">
                    <strong className="card-title small d-block">{c.character?.name}</strong>
                    <span className="badge text-bg-light">{c.role}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
