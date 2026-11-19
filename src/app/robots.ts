import type { MetadataRoute } from "next";

// Private areas are also protected by auth; this only keeps well-behaved crawlers out.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/account", "/checkout", "/cart", "/search", "/api"] },
  };
}
