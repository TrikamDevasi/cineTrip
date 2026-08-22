import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ThemeWrapper from "@/components/ThemeWrapper";
import { RegionProvider } from "@/context/RegionContext";

export const metadata = {
  title: {
    default: "CineTrip — Cinema Outing Planner, Movie Discovery & Memories",
    template: "%s | CineTrip",
  },
  description:
    "Plan cinema outings with friends, discover movies by mood and genre, track upcoming theater releases, and capture your movie night memories with CineTrip.",
  keywords: [
    "CineTrip",
    "movie outing planner",
    "cinema planner",
    "movie tickets",
    "movie nights",
    "AI movie recommendations",
    "film memories",
    "watchlist",
    "IMAX",
  ],
  authors: [{ name: "CineTrip" }],
  creator: "CineTrip",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "CineTrip",
    title: "CineTrip — Cinema Outing Planner, Movie Discovery & Memories",
    description:
      "Plan cinema outings with friends, discover movies by mood and genre, and capture your movie night memories.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "CineTrip",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "CineTrip — Cinema Outing Planner & Discovery",
    description:
      "Plan cinema outings with friends, discover movies by mood, and capture movie night memories.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var s = localStorage.getItem('cinephiles-theme');
                var t = s ? JSON.parse(s).state.theme : 'dark';
                document.documentElement.setAttribute('data-theme', t);
              } catch(e) {
                document.documentElement.setAttribute('data-theme', 'dark');
              }
            `,
          }}
        />
      </head>
      <body>
        <a href="#main-content" className="skip-to-content">
          Skip to content
        </a>
        <ThemeWrapper>
          <RegionProvider>
            <Navbar />
            <main
              id="main-content"
              role="main"
              style={{
                paddingTop: "80px",
                minHeight: "100vh",
              }}
            >
              {children}
            </main>
            <Footer />
          </RegionProvider>
        </ThemeWrapper>
      </body>
    </html>
  );
}
