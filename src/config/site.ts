/**
 * Central place for app-wide, static configuration.
 * Keeping it here avoids magic strings scattered around the codebase.
 */
export const siteConfig = {
  name: "GameStore",
  description:
    "Your one-stop shop for gaming accessories — controllers, headsets, keyboards and more.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  nav: [
    { title: "Home", href: "/" },
    { title: "Products", href: "/products" },
    { title: "Categories", href: "/categories" },
  ],
};

export type SiteConfig = typeof siteConfig;
