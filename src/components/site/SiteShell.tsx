import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { BackToTop, ScrollProgress } from "./ScrollProgress";

export function SiteShell({ children, hideFooter = false }: { children: ReactNode; hideFooter?: boolean }) {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollProgress />
      <Navbar />
      <main className="flex-1 pt-16">{children}</main>
      {!hideFooter && <Footer />}
      <BackToTop />
    </div>
  );
}
