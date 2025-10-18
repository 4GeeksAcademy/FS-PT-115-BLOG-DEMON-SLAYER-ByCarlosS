// src/components/Navbar.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const Navbar = () => {
  const navigate = useNavigate();
  const { store, dispatch } = useGlobalReducer();
  const [term, setTerm] = useState("");

  const favs = store.favorites || [];

  function onSubmit(e) {
    e.preventDefault();
    const q = term.trim();
    navigate(q ? `/?q=${encodeURIComponent(q)}` : "/");
    setTerm("");
  }

  return (
    <nav className="navbar navbar-expand-lg bg-body-tertiary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-semibold" to="/">ByCarlosS</Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navMain">
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navMain">
          {/* Izquierda: Links */}
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item"><Link className="nav-link" to="/">Inicio</Link></li>
          </ul>

          {/* Centro: Buscador */}
          <form className="d-flex me-3" role="search" onSubmit={onSubmit}>
            <input
              className="form-control me-2"
              type="search"
              placeholder="Buscar anime..."
              aria-label="Search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
            <button className="btn btn-outline-primary" type="submit">Buscar</button>
          </form>

          {/* Derecha: Favoritos (dropdown) */}
          <div className="dropdown">
            <button
              className="btn btn-secondary dropdown-toggle"
              type="button"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Favoritos <span className="badge text-bg-light ms-1">{favs.length}</span>
            </button>
            <ul className="dropdown-menu dropdown-menu-end p-2" style={{ minWidth: 280 }}>
              {favs.length === 0 ? (
                <li className="px-2 py-1 text-muted">Sin favoritos</li>
              ) : (
                favs.map((f) => (
                  <li key={f.mal_id} className="d-flex align-items-center gap-2 px-2 py-1">
                    {f.image && (
                      <img
                        src={f.image}
                        alt={f.title}
                        width={36}
                        height={36}
                        style={{ objectFit: "cover" }}
                        className="rounded"
                      />
                    )}
                    <div className="flex-grow-1 text-truncate" title={f.title}>
                      <Link to={`/anime/${f.mal_id}`} className="text-decoration-none">{f.title}</Link>
                    </div>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => dispatch({ type: "fav_remove", payload: f.mal_id })}
                      title="Quitar"
                    >
                      ×
                    </button>
                  </li>
                ))
              )}
              {favs.length > 0 && <li><hr className="dropdown-divider" /></li>}
              {favs.length > 0 && (
                <li className="px-2">
                  <Link className="btn btn-sm btn-outline-secondary w-100" to="/">
                    Ver todos
                  </Link>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};
