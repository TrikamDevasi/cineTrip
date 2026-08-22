export async function GET() {
  return new Response(
    `User-agent: *
Allow: /

Sitemap: https://cinephiles-watch.vercel.app/sitemap.xml`,
    {
      headers: {
        "Content-Type": "text/plain",
      },
    }
  );
}
