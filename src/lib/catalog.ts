// Static storefront content (hero, collections, navigation) and shared helpers.
// Products, categories and stock live in Postgres: see src/lib/products.ts.

const unsplash = (id: string, width = 1200) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

export type StockStatus = "in-stock" | "low-stock" | "out-of-stock";

export const LOW_STOCK_THRESHOLD = 5;

export function getStockStatus(stock: number): StockStatus {
  if (stock <= 0) return "out-of-stock";
  return stock <= LOW_STOCK_THRESHOLD ? "low-stock" : "in-stock";
}

export const heroSlide = {
  eyebrow: "Autumn / Winter 2026",
  title: "The Season in Burgundy",
  body: "Tailored outerwear and quiet luxuries, cut for the colder months.",
  image: unsplash("1483985988355-763728e1935b", 2400),
  alt: "Woman in a burgundy wool coat and sunglasses carrying shopping bags",
  href: "/collections/new-arrivals",
};

export const editorial = {
  eyebrow: "The Journal",
  title: "Dressing for the city, in any weather",
  body: "From the cathedral squares of Milan to rain-slicked boulevards, our outerwear is designed to move with you. Discover how the season's coats are cut, lined and finished by hand.",
  cta: "Read the story",
  href: "/journal/dressing-for-the-city",
  image: unsplash("1539109136881-3be0616acf4b", 1400),
  alt: "Woman in a powder-blue coat standing in a cathedral square",
};

export const lookbook = [
  {
    title: "Colour Study",
    href: "/collections/colour-study",
    image: unsplash("1509631179647-0177331693ae", 1000),
    alt: "Woman in striped wide-leg trousers against a teal wall",
  },
  {
    title: "Weekend Sport",
    href: "/collections/weekend-sport",
    image: unsplash("1515886657613-9f3515b0c78f", 1000),
    alt: "Model in a yellow cropped hoodie and joggers on a seaside court",
  },
  {
    title: "Evening Studio",
    href: "/collections/evening-studio",
    image: unsplash("1524504388940-b1c1722653e1", 1000),
    alt: "Portrait of a woman in a black sheer top against a dark backdrop",
  },
];

export const services = [
  { title: "Complimentary Shipping", body: "On all orders over $250, worldwide." },
  { title: "30-Day Returns", body: "Free returns on unworn items." },
  { title: "Gift Packaging", body: "Every order arrives beautifully wrapped." },
  { title: "Client Care", body: "Styling advice, seven days a week." },
];

export const mainNav = [
  { label: "New Arrivals", href: "/collections/new-arrivals" },
  { label: "Women", href: "/collections/women" },
  { label: "Men", href: "/collections/men" },
  { label: "Accessories", href: "/collections/accessories" },
  { label: "Journal", href: "/journal" },
];

export const footerLinks = [
  {
    heading: "Shop",
    links: [
      { label: "New Arrivals", href: "/collections/new-arrivals" },
      { label: "Women", href: "/collections/women" },
      { label: "Men", href: "/collections/men" },
      { label: "Accessories", href: "/collections/accessories" },
    ],
  },
  {
    heading: "Client Care",
    links: [
      { label: "Contact Us", href: "/help/contact" },
      { label: "Shipping & Delivery", href: "/help/shipping" },
      { label: "Returns & Exchanges", href: "/help/returns" },
      { label: "Size Guide", href: "/help/size-guide" },
    ],
  },
  {
    heading: "About",
    links: [
      { label: "Our Story", href: "/about" },
      { label: "Journal", href: "/journal" },
      { label: "Careers", href: "/careers" },
    ],
  },
];

/** Formats a price given in USD cents. */
export const formatPrice = (cents: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(cents / 100);
