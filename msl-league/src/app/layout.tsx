import type { Metadata } from "next";
import "./globals.css";
import { TopNav } from "@/components/TopNav";

export const metadata: Metadata = {
  title: {
    default: "MSL League",
    template: "%s | MSL League",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <div className="min-h-screen">
          <TopNav />
          <main className="mx-auto max-w-6xl px-3 py-4 sm:px-4 sm:py-8">{children}</main>
          <footer className="mx-auto max-w-6xl px-3 py-3 sm:px-4 sm:pb-10 sm:pt-2 text-center text-xs sm:text-sm text-white/60">
            MSL League • Admin-managed • Built for match days
          </footer>
        </div>
      </body>
    </html>
  );
}

