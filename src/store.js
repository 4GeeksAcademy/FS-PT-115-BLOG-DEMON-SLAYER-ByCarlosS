export const initialStore = () => {
  let persistedFavorites = [];
  try {
    persistedFavorites = JSON.parse(localStorage.getItem("favorites")) || [];
  } catch {
    persistedFavorites = [];
  }

  return {
    message: null,
    todos: [
      { id: 1, title: "Make the bed", background: null },
      { id: 2, title: "Do my homework", background: null }
    ],
    favorites: persistedFavorites
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "add_task": {
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map((todo) =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };
    }


    case "fav_add": {
      const item = action.payload;
      const exists = store.favorites.some((f) => f.mal_id === item.mal_id);
      const favorites = exists ? store.favorites : [...store.favorites, item];
      localStorage.setItem("favorites", JSON.stringify(favorites));
      return { ...store, favorites };
    }

    case "fav_remove": {
      const mal_id = action.payload;
      const favorites = store.favorites.filter((f) => f.mal_id !== mal_id);
      localStorage.setItem("favorites", JSON.stringify(favorites));
      return { ...store, favorites };
    }

    case "fav_toggle": {
      const item = action.payload;
      const exists = store.favorites.some((f) => f.mal_id === item.mal_id);
      const favorites = exists
        ? store.favorites.filter((f) => f.mal_id !== item.mal_id)
        : [...store.favorites, item];
      localStorage.setItem("favorites", JSON.stringify(favorites));
      return { ...store, favorites };
    }

    default:
      throw Error("Unknown action.");
  }
}
