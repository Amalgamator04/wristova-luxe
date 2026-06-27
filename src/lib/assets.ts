// Map seed asset paths (like "/src/assets/cat-leather.jpg") to bundled Vite URLs.
import leather from "@/assets/cat-leather.jpg";
import beaded from "@/assets/cat-beaded.jpg";
import chain from "@/assets/cat-chain.jpg";
import gold from "@/assets/cat-gold.jpg";
import lifestyle from "@/assets/lifestyle-1.jpg";
import hero from "@/assets/hero-bracelet.jpg";
import craft from "@/assets/craft-1.jpg";

const map: Record<string, string> = {
  "/src/assets/cat-leather.jpg": leather,
  "/src/assets/cat-beaded.jpg": beaded,
  "/src/assets/cat-chain.jpg": chain,
  "/src/assets/cat-gold.jpg": gold,
  "/src/assets/lifestyle-1.jpg": lifestyle,
  "/src/assets/hero-bracelet.jpg": hero,
  "/src/assets/craft-1.jpg": craft,
};

export function resolveAsset(url: string | null | undefined): string {
  if (!url) return lifestyle;
  if (url.startsWith("http")) return url;
  return map[url] ?? url;
}

export { hero as heroImage, craft as craftImage, lifestyle as lifestyleImage };
