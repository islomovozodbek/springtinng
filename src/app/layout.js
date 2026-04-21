import { Lora, Inter, Source_Serif_4 } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { AuthProvider } from "@/context/AuthContext";

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

export const metadata = {
  title: "KeyboardSprint — 3-Minute Creative Writing Sprints",
  description:
    "Train your creativity, not your productivity. Get a random prompt, write for 3 minutes, and share your story with the world. Stop typing and your words vanish.",
  keywords: "creative writing, writing sprints, storytelling, writing game, creativity",
  openGraph: {
    title: "KeyboardSprint — 3-Minute Creative Writing Sprints",
    description: "Train your creativity, not your productivity.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable} ${sourceSerif.variable}`} suppressHydrationWarning>
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
          <Navbar />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
