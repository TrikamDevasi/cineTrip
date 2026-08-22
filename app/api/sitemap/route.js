export async function GET() {
  const baseUrl = "https://cinephiles-watch.vercel.app";

  const routes = [
    "",
    "/dashboard",
    "/watchlist",
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes
  .map((route) => {
    return `<url>
  <loc>${baseUrl}${route}</loc>
  <lastmod>${new Date().toISOString()}</lastmod>
  <changefreq>daily</changefreq>
  <priority>0.8</priority>
</url>`;
  })
  .join("\n")}
</urlset>
`;

  return new Response(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
