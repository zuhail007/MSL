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
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mx-auto max-w-6xl px-4 pb-10 pt-2 text-center text-sm text-white/60">
            MSL League • Admin-managed • Built for match days
          </footer>
        </div>
      </body>
      <a href="/groups">Groups</a>
    </html>
  );
}

