"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import SeriesCard from "@/components/SeriesCard";

export default function SeriesSearch({ initialQuery = "" }) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialQuery && initialQuery.length >= 2) {
      performSearch(initialQuery);
    } else {
      setResults([]);
    }
  }, [initialQuery]);

  async function performSearch(searchTerm) {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/series/search?query=${encodeURIComponent(searchTerm)}`
      );
      const json = await res.json();
      console.log("[Series Search API Response]:", json);
      setResults(json.success ? json.data : []);
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      router.push(`/series?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <div>
      <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mb-8">
        <input
          type="text"
          placeholder="Search TV Series..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-[#18181f] border border-white/10 rounded-full px-12 py-3 text-white focus:outline-none focus:border-[#e50914] transition-colors"
          style={{ minHeight: "44px" }}
        />
        <Search
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={18}
        />
      </form>

      {loading && (
        <div className="text-center py-8 text-gray-400">
          <Loader2 className="animate-spin inline-block mr-2" size={24} />
          <span>Searching series...</span>
        </div>
      )}

      {!loading && initialQuery && initialQuery.length >= 2 && results.length === 0 && (
        <p className="text-center text-gray-400">
          No series found for "{initialQuery}".
        </p>
      )}

      {!loading && results.length > 0 && initialQuery && (
        <div>
          <h2 className="text-xl font-bold mb-6 border-l-4 border-[#e50914] pl-3">
            Search Results for "{initialQuery}"
          </h2>
          <div
            className="grid gap-6"
            style={{
              gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            }}
          >
            {results.map((s) => (
              <SeriesCard key={s.id} series={s} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
