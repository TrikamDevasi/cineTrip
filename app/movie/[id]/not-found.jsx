import Link from "next/link";
import { Film } from "lucide-react";

export default function MovieNotFound() {
  return (
    <div className="error-page">
      <Film size={48} className="error-icon" />
      <h2>Movie Not Found</h2>
      <p>This movie doesn't exist in our database or may have been removed.</p>
      <Link href="/" className="btn-primary">Browse Movies</Link>
    </div>
  );
}
