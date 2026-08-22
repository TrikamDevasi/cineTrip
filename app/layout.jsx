import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Outfit, Inter } from "next/font/google";
import ThemeWrapper from "@/components/ThemeWrapper";
import { RegionProvider } from "@/context/RegionContext";

const outfit = Outfit({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: {
    default: "Cinephiles Watch — Premium Movie Discovery",
    template: "%s | Cinephiles Watch",
  },
  description:
    "Discover, track, and explore movies and series with AI-powered recommendations. Your premium movie companion powered by TMDB and Trakt.",
  keywords: [
    "movies",
    "series",
    "streaming",
    "movie recommendations",
    "AI movie analysis",
    "watchlist",
    "film discovery",
  ],
  authors: [{ name: "Cinephiles Watch" }],
  creator: "Cinephiles Watch",
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Cinephiles Watch",
    title: "Cinephiles Watch — Premium Movie Discovery",
    description:
      "Discover, track, and explore movies and series with AI-powered recommendations.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Cinephiles Watch",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Cinephiles Watch — Premium Movie Discovery",
    description:
      "Discover, track, and explore movies and series with AI-powered recommendations.",
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
    <html lang="en" className={`${outfit.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
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
