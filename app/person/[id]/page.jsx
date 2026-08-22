import Image from "next/image";
import Link from "next/link";
import { fetchTMDB } from "@/lib/tmdb";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }) {
  const { id } = params;
  try {
    const person = await fetchTMDB(`/person/${id}`);
    return {
      title: `${person.name} | Cinephiles Watch`,
      description:
        person.biography?.slice(0, 160) ||
        `Filmography and details of ${person.name}`,
      openGraph: {
        title: `${person.name} | Cinephiles Watch`,
        description: person.biography?.slice(0, 160),
        images: person.profile_path
          ? [`https://image.tmdb.org/t/p/w342${person.profile_path}`]
          : [],
      },
    };
  } catch {
    return { title: "Person | Cinephiles Watch" };
  }
}

export default async function PersonPage({ params }) {
  const { id } = params;

  if (!id || isNaN(Number(id))) notFound();

  try {
    const [person, credits] = await Promise.all([
      fetchTMDB(`/person/${id}`),
      fetchTMDB(`/person/${id}/movie_credits`),
    ]);

    if (!person || person.success === false) notFound();

    const knownFor = (credits.cast || [])
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, 12);

    const filmography = (credits.cast || []).sort(
      (a, b) => (b.release_date || "").localeCompare(a.release_date || "")
    );

    const avatarFallback = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      person.name
    )}&background=1f2937&color=fff&size=342`;

    return (
      <div className="person-page animate-in pt-28 pb-16">
        <div className="container grid grid-cols-1 md:grid-cols-[300px_1fr] gap-10">
          <div className="space-y-6">
            <div className="relative aspect-[2/3] max-w-[280px] mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-2xl border border-[var(--color-border)]">
              <Image
                src={
                  person.profile_path
                    ? `https://image.tmdb.org/t/p/w342${person.profile_path}`
                    : avatarFallback
                }
                alt={person.name}
                fill
                priority
                className="object-cover"
              />
            </div>

            <div className="p-6 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-lg space-y-4">
              <h1 className="text-xl font-extrabold text-[var(--color-text-primary)]">{person.name}</h1>

              <div className="space-y-3 text-xs">
                {person.birthday && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-[10px]">Born</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{person.birthday}</span>
                  </div>
                )}
                {person.deathday && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-[10px]">Died</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{person.deathday}</span>
                  </div>
                )}
                {person.place_of_birth && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-[10px]">Place of Birth</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{person.place_of_birth}</span>
                  </div>
                )}
                {person.known_for_department && (
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold uppercase tracking-wider text-[var(--color-text-muted)] text-[10px]">Known For</span>
                    <span className="font-semibold text-[var(--color-text-primary)]">{person.known_for_department}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            {person.biography && (
              <div className="space-y-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-l-4 border-[var(--color-accent)] pl-3">
                  Biography
                </h2>
                <p className="text-xs md:text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  {person.biography}
                </p>
              </div>
            )}

            {knownFor.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-l-4 border-[var(--color-accent)] pl-3">
                  Known For
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none">
                  {knownFor.map((m) => (
                    <Link key={m.id} href={`/movie/${m.id}`} className="flex-shrink-0 w-36 space-y-2 group">
                      <div className="relative w-36 h-52 rounded-xl overflow-hidden shadow-lg border border-[var(--color-border)] group-hover:-translate-y-1 transition-transform">
                        <Image
                          src={
                            m.poster_path
                              ? `https://image.tmdb.org/t/p/w185${m.poster_path}`
                              : "/default-1778606634.jpg"
                          }
                          alt={m.title || m.name || "Untitled"}
                          fill
                          sizes="140px"
                          className="object-cover"
                        />
                      </div>
                      <span className="block text-xs font-semibold text-[var(--color-text-primary)] truncate">
                        {m.title || m.name}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {filmography.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[var(--color-text-secondary)] border-l-4 border-[var(--color-accent)] pl-3">
                  Filmography ({filmography.length})
                </h2>
                <div className="space-y-1 border border-[var(--color-border)] rounded-2xl p-2 bg-[var(--color-surface)]">
                  {filmography.map((m) => (
                    <Link
                      key={m.id}
                      href={`/movie/${m.id}`}
                      className="grid grid-cols-[1fr_60px_1fr] gap-4 p-3 rounded-xl hover:bg-[var(--color-surface-2)] transition-colors text-xs items-center"
                    >
                      <span className="font-semibold text-[var(--color-text-primary)] truncate">{m.title || m.name}</span>
                      <span className="text-[var(--color-text-muted)] text-center">
                        {m.release_date ? m.release_date.slice(0, 4) : "—"}
                      </span>
                      <span className="text-[var(--color-text-secondary)] text-right truncate">
                        {m.character ? `as ${m.character}` : ""}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    );
  } catch {
    notFound();
  }
}

