import { Suspense } from "react";
import SearchContent from "@/components/SearchContent";

export async function generateMetadata({ searchParams }) {
  const q = searchParams?.q;
  return {
    title: q ? `"${q}" | Search | Cinephiles Watch` : "Search | Cinephiles Watch",
  };
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="container" style={{ textAlign: "center", paddingTop: "100px" }}>Loading Search...</div>}>
      <SearchContent />
    </Suspense>
  );
}
