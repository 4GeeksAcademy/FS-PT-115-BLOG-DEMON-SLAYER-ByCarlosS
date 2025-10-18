// src/pages/Home.jsx
import React, { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { searchAnime } from "../services/jikan.js";

export const Home = () => {
  const { store, dispatch } = useGlobalReducer();
  const [searchParams] = useSearchParams();
  const initialQ = searchParams.get("q") || "";

  const [q, setQ] = useState(initialQ);
  const [type, setType] = useState("");
  const [page, setPage] = useState(1);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const typeOptions = useMemo(
    () => [
      { id: "", label: "Todos" },
      { id: "tv", label: "TV" },
      { id: "movie", label: "Película" },
      { id: "ova", label: "OVA" },
      { id: "ona", label: "ONA" },
      { id: "special", label: "Especial" },
    ],
    []
  );

  async function loadList() {
    setLoading(true);
    setError("");
    setItems([]);
    try {
      const json = await searchAnime({ q, page, type, limit: 24, sfw: true });
      setItems(json.data || []);
    } catch (e) {
      setError(e.message || "Error al cargar");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setQ(initialQ);
  }, [initialQ]);

  useEffect(() => {
    loadList();
  }, [page, q, type]);

  return (
    <div className="container py-4">
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="m-0">Blog de ByCarlosS Animes</h3>
        <span className="badge text-bg-secondary">Favoritos: {store.favorites?.length || 0}</span>
      </div>

      <form
        className="row g-2 align-items-end"
        onSubmit={(e) => {
          e.preventDefault();
          setPage(1);
          loadList();
        }}
      >
        <div className="col-6 col-md-3">
          <label className="form-label">Tipo</label>
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            {typeOptions.map((t) => (
              <option value={t.id} key={t.id}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      </form>

      {error && <div className="alert alert-danger mt-3">{error}</div>}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status" />
        </div>
      ) : items.length === 0 ? (
        <div className="alert alert-light mt-3">No se encontraron animes.</div>
      ) : (
        <div className="row row-cols-2 row-cols-md-3 row-cols-lg-4 g-3 mt-2">
          {items.map((a) => {
            const cover = a.images?.jpg?.image_url || a.images?.webp?.image_url || null;
            const isFav = store.favorites?.some((f) => f.mal_id === a.mal_id);
            return (
              <div className="col" key={a.mal_id}>
                <div className="card h-100 shadow-sm">
                  {cover && <img src={cover} className="card-img-top" alt={a.title} loading="lazy" />}
                  <div className="card-body d-flex flex-column">
                    <h6 className="card-title">{a.title}</h6>
                    <p className="card-text small text-muted mb-2">
                      {a.type || "—"} {a.year ? `· ${a.year}` : ""}
                    </p>
                    <div className="mt-auto d-flex gap-2">
                      <Link className="btn btn-sm btn-primary" to={`/anime/${a.mal_id}`}>
                        Detalles
                      </Link>
                      <button
                        type="button"
                        className={`btn btn-sm ${isFav ? "btn-danger" : "btn-outline-secondary"}`}
                        onClick={() =>
                          dispatch({
                            type: "fav_toggle",
                            payload: { mal_id: a.mal_id, title: a.title, image: cover },
                          })
                        }
                      >
                        {isFav ? "Quitar" : "Favorito"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="d-flex gap-2 justify-content-center align-items-center mt-3">
        <button
          type="button"
          className="btn btn-outline-secondary"
          disabled={page === 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
        >
          Anterior
        </button>
        <span className="badge text-bg-light">Página {page}</span>
        <button
          type="button"
          className="btn btn-outline-secondary"
          onClick={() => setPage((p) => p + 1)}
        >
          Siguiente
        </button>
      </div>
    </div>
  );
};
