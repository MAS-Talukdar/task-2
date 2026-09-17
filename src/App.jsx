import React, { useState, useEffect } from "react";

const ALL_SHOWS_API = "https://api.tvmaze.com/shows";
const SEARCH_API = "https://api.tvmaze.com/search/shows?q=";

export default function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [movies, setMovies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem("movie_explorer_favs");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("movie_explorer_favs", JSON.stringify(favorites));
    } catch (e) {
      console.error("Failed to save favorites", e);
    }
  }, [favorites]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim() === "") {
      fetchMovies();
    } else {
      searchMovies(debouncedQuery);
    }
  }, [debouncedQuery]);

  const fetchMovies = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(ALL_SHOWS_API);
      if (!res.ok) throw new Error("Failed to fetch movies");
      const data = await res.json();
      const formatted = data.map((show) => ({
        id: show.id,
        title: show.name,
        rating: show.rating?.average || (Math.random() * 2 + 7).toFixed(1),
        year: show.premiered ? show.premiered.split("-")[0] : "N/A",
        poster:
          show.image?.medium ||
          show.image?.original ||
          "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400",
        backdrop:
          show.image?.original ||
          show.image?.medium ||
          "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
        summary: show.summary
          ? show.summary.replace(/<[^>]*>?/gm, "")
          : "No summary available.",
        genres: show.genres || [],
        network: show.network?.name || show.webChannel?.name || "Streaming",
        status: show.status || "Unknown",
      }));
      setMovies(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const searchMovies = async (query) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${SEARCH_API}${encodeURIComponent(query)}`);
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      const formatted = data.map((item) => {
        const show = item.show;
        return {
          id: show.id,
          title: show.name,
          rating: show.rating?.average || (Math.random() * 2 + 7).toFixed(1),
          year: show.premiered ? show.premiered.split("-")[0] : "N/A",
          poster:
            show.image?.medium ||
            show.image?.original ||
            "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400",
          backdrop:
            show.image?.original ||
            show.image?.medium ||
            "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
          summary: show.summary
            ? show.summary.replace(/<[^>]*>?/gm, "")
            : "No summary available.",
          genres: show.genres || [],
          network: show.network?.name || show.webChannel?.name || "Streaming",
          status: show.status || "Unknown",
        };
      });
      setMovies(formatted);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (movie, e) => {
    if (e) e.stopPropagation();
    setFavorites((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      } else {
        return [...prev, movie];
      }
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-md bg-slate-950/80 border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => setCurrentPage("home")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              MovieExplorer
            </span>
          </div>

          <nav className="flex items-center space-x-4 sm:space-x-6">
            <button
              onClick={() => setCurrentPage("home")}
              className={`text-sm font-medium transition-colors hover:text-indigo-400 ${currentPage === "home" ? "text-indigo-400" : "text-slate-300"}`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentPage("movies")}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-4 py-2 rounded-xl shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
            >
              Movies
            </button>
          </nav>
        </div>
      </header>

      {}
      <main className="flex-grow">
        {currentPage === "home" ? (
          <HomeView
            onExplore={() => setCurrentPage("movies")}
            onSelectMovie={setSelectedMovie}
            movies={movies}
          />
        ) : (
          <MoviesView
            movies={movies}
            loading={loading}
            error={error}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSelectMovie={setSelectedMovie}
            favorites={favorites}
            toggleFavorite={toggleFavorite}
          />
        )}
      </main>

      {}
      {selectedMovie && (
        <MovieModal
          movie={selectedMovie}
          onClose={() => setSelectedMovie(null)}
          favorites={favorites}
          toggleFavorite={toggleFavorite}
        />
      )}

      {}
      <footer className="bg-slate-900 border-t border-slate-800 py-8 px-4 sm:px-6 lg:px-8 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                />
              </svg>
            </div>
            <span className="font-bold text-slate-200">MovieExplorer</span>
          </div>
          <p className="text-sm text-slate-400">
            © 2026 MovieExplorer. Powered by TVMaze API. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

function HomeView({ onExplore, onSelectMovie, movies }) {
  const featuredMovies = movies.slice(0, 4);

  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden pt-20 pb-28 lg:pt-32 lg:pb-36 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 border-b border-slate-800/80">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <span className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full text-indigo-400 text-xs sm:text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
            <span>Discover Over 50,000+ Movies & Shows</span>
          </span>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            DISCOVER{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400 bg-clip-text text-transparent">
              MOVIES
            </span>{" "}
            & TV SHOWS
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Explore and discover your favorite movies from around the world.
            Streamline your watchlist with real-time data and detailed
            summaries.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={onExplore}
              className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-4 rounded-2xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 flex items-center justify-center space-x-3 text-base"
            >
              <span>Explore Now</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      </section>

      {featuredMovies.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white">
                Trending Right Now
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Handpicked popular shows and movies
              </p>
            </div>
            <button
              onClick={onExplore}
              className="text-sm font-semibold text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
            >
              <span>View All</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredMovies.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={() => onSelectMovie(movie)}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function MoviesView({
  movies,
  loading,
  error,
  searchQuery,
  setSearchQuery,
  onSelectMovie,
  favorites,
  toggleFavorite,
}) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Movie & Show Catalog
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Browse through our vast catalog or search by title
          </p>
        </div>

        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a movie or show..."
            className="w-full pl-11 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-pulse">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
            <div
              key={n}
              className="bg-slate-900 h-96 rounded-2xl border border-slate-800"
            ></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center text-red-400">
          <p className="font-semibold">Error loading movies</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && movies.length === 0 && (
        <div className="bg-slate-900 border border-slate-800 p-12 rounded-2xl text-center">
          <h3 className="text-lg font-semibold text-white">No movies found</h3>
          <p className="text-sm text-slate-400 mt-1">
            Try adjusting your search terms or clearing the search query.
          </p>
        </div>
      )}

      {!loading && !error && movies.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => {
            const isFav = favorites.some((f) => f.id === movie.id);
            return (
              <MovieCard
                key={movie.id}
                movie={movie}
                onSelect={() => onSelectMovie(movie)}
                isFavorite={isFav}
                onToggleFavorite={(e) => toggleFavorite(movie, e)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}

function MovieCard({ movie, onSelect, isFavorite, onToggleFavorite }) {
  return (
    <div
      onClick={onSelect}
      className="group bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer flex flex-col"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-slate-950">
        <img
          src={movie.poster}
          alt={movie.title}
          onError={(e) => {
            e.target.src =
              "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=400";
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60"></div>

        <div className="absolute top-3 left-3 bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs font-semibold text-amber-400 flex items-center space-x-1 border border-slate-700/50">
          <span>⭐</span>
          <span>{movie.rating}</span>
        </div>

        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={`absolute top-3 right-3 p-2 rounded-xl backdrop-blur-md transition-all ${isFavorite ? "bg-rose-500 text-white" : "bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700/50"}`}
          >
            <svg
              className="w-4 h-4"
              fill={isFavorite ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span>📅 {movie.year}</span>
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {movie.network}
            </span>
          </div>
          <h3 className="font-bold text-white text-base line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {movie.title}
          </h3>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="w-full bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white text-xs font-semibold py-2.5 rounded-xl transition-all duration-200 flex items-center justify-center space-x-1.5"
        >
          <span>See Details</span>
        </button>
      </div>
    </div>
  );
}

function MovieModal({ movie, onClose, favorites, toggleFavorite }) {
  const isFav = favorites.some((f) => f.id === movie.id);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 w-full max-w-2xl max-h-[90vh] rounded-2xl sm:rounded-3xl overflow-y-auto shadow-2xl relative my-auto scrollbar-thin scrollbar-thumb-slate-700"
      >
        {}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-950/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-slate-800 transition-colors shadow-lg"
          aria-label="Close modal"
        >
          ✕
        </button>

        {}
        <div className="relative h-48 sm:h-64 w-full bg-slate-950 overflow-hidden flex-shrink-0">
          <img
            src={movie.backdrop}
            alt={movie.title}
            onError={(e) => {
              e.target.src =
                "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800";
            }}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent"></div>
        </div>

        {}
        <div className="p-5 sm:p-8 space-y-5 -mt-12 sm:-mt-16 relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-indigo-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                  {movie.status}
                </span>
                {movie.genres.map((g) => (
                  <span
                    key={g}
                    className="bg-slate-800 text-slate-300 text-xs font-medium px-2.5 py-1 rounded-full border border-slate-700"
                  >
                    {g}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-3xl font-extrabold text-white leading-tight">
                {movie.title}
              </h2>
            </div>

            <button
              onClick={(e) => toggleFavorite(movie, e)}
              className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all ${isFav ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30" : "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"}`}
            >
              <svg
                className="w-4 h-4"
                fill={isFav ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
              <span>{isFav ? "Favorited" : "Add to Favorites"}</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 py-3 sm:py-4 border-y border-slate-800 text-xs sm:text-sm">
            <div className="flex items-center space-x-2">
              <span className="text-amber-400 text-base sm:text-lg">⭐</span>
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs">Rating</p>
                <p className="font-bold text-white">{movie.rating} / 10</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-indigo-400 text-base sm:text-lg">📅</span>
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs">Year</p>
                <p className="font-bold text-white">{movie.year}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-violet-400 text-base sm:text-lg">📺</span>
              <div>
                <p className="text-slate-400 text-[10px] sm:text-xs">Network</p>
                <p className="font-bold text-white truncate max-w-[100px] sm:max-w-none">
                  {movie.network}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-white">
              Overview
            </h3>
            <p className="text-slate-300 leading-relaxed text-xs sm:text-sm">
              {movie.summary}
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              onClick={onClose}
              className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold px-6 py-2.5 rounded-xl transition-colors text-xs sm:text-sm"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
