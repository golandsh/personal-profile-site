import type { Metadata, Viewport } from "next";
import {
  JetBrains_Mono,
  Plus_Jakarta_Sans,
  Space_Grotesk,
} from "next/font/google";
import type { ReactElement, ReactNode } from "react";
import { DigitalTwinChat } from "@/components/DigitalTwinChat";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { PROFILE } from "@/data/profile";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["500", "600", "700"],
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${PROFILE.name} — ${PROFILE.title}`,
    template: `%s | ${PROFILE.name}`,
  },
  description: PROFILE.heroLead,
  authors: [{ name: PROFILE.name }],
  keywords: [
    "Shlomi Goland",
    "Full Stack Engineer",
    "Technical Lead",
    "TypeScript",
    "Next.js",
    "AWS Serverless",
    "Payment Architecture",
    "Tel Aviv",
  ],
};

export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f8fb" },
    { media: "(prefers-color-scheme: dark)", color: "#07090d" },
  ],
};

interface RootLayoutProps {
  readonly children: ReactNode;
}

const COLOR_SCHEME_INIT_SCRIPT =
  'try{const s=localStorage.getItem("color-scheme");if(s==="light"||s==="dark"){const m=document.querySelector(\'meta[name="color-scheme"]\');if(m)m.content=s;}}catch{}';

export default function RootLayout({ children }: RootLayoutProps): ReactElement {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${plusJakartaSans.variable} ${jetBrainsMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta name="color-scheme" content="light dark" />
        <script id="color-scheme-init">{COLOR_SCHEME_INIT_SCRIPT}</script>
      </head>
      <body className="architectural-backdrop selection:bg-cyan-400/30">
        <a href="#main-content" className="skip-link visually-hidden">
          Skip to main content
        </a>
        <div className="scroll-progress-bar" aria-hidden="true" />
        <div className="flex min-h-dvh flex-col">
          <SiteHeader monogram={PROFILE.monogram} name={PROFILE.name} />
          <main id="main-content" tabIndex={-1} className="flex-1">
            {children}
          </main>
          <SiteFooter />
        </div>
        <DigitalTwinChat monogram={PROFILE.monogram} name={PROFILE.name} />
      </body>
    </html>
  );
}
