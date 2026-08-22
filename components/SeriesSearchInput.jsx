"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SeriesSearchInput({ initialValue = "" }) {
  const [query, setQuery] = useState(initialValue);
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/series?q=${encodeURIComponent(query)}`);
    } else {
      router.push("/series");
    }
  };

  return (
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
  );
}
