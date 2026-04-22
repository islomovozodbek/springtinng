import { Lora, Inter, Source_Serif_4, Outfit, Playfair_Display, Cormorant_Garamond } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import { AchievementToastProvider } from "@/components/AchievementToast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-body-var",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading-var",
  subsets: ["latin"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-hero-var",
  subsets: ["latin"],
  weight: ["600"],
  display: "swap",
});

export const metadata = {
  title: "Sprinting Ink — 3-Minute Creative Writing Sprints",
  description:
    "Train your creativity, not your productivity. Get a random prompt, write for 3 minutes, and share your story with the world. Stop typing and your words vanish.",
  keywords: "creative writing, writing sprints, storytelling, writing game, creativity",
  openGraph: {
    title: "Sprinting Ink — 3-Minute Creative Writing Sprints",
    description: "Train your creativity, not your productivity.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${sourceSerif.variable} ${outfit.variable} ${playfair.variable} ${cormorant.variable}`} suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  var supportDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (!theme && supportDarkMode) theme = 'dark';
                  if (theme) document.documentElement.setAttribute('data-theme', theme);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body>
        <AuthProvider>
          <AchievementToastProvider>
            <Navbar />
            <main>{children}</main>
          </AchievementToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
