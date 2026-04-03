// Marketing layout — no sidebar, full-width; includes hero image preload for LCP
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Preload above-the-fold hero image for faster LCP */}
      <link
        rel="preload"
        as="image"
        href="/hero-monaco-1280.webp"
        // @ts-expect-error — imagesrcset/imagesizes are valid preload attributes not yet in React typings
        imagesrcset="/hero-monaco-1280.webp 1280w, /hero-monaco-2560.webp 2560w"
        imagesizes="100vw"
      />
      {children}
    </>
  );
}
