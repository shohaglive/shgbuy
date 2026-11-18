// Sample catalog used by `npm run db:seed`. Safe to edit and re-run.

import type { ProductImage } from "./schema";

const unsplash = (id: string, width = 1400) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=80`;

const APPAREL = ["XS", "S", "M", "L", "XL"];

export const seedCategories = [
  { slug: "bags", name: "Bags" },
  { slug: "outerwear", name: "Outerwear" },
  { slug: "shoes", name: "Shoes" },
  { slug: "knitwear", name: "Knitwear" },
  { slug: "tailoring", name: "Tailoring" },
  { slug: "dresses", name: "Dresses" },
  { slug: "eyewear", name: "Eyewear" },
  { slug: "hats", name: "Hats" },
] as const;

type SeedProduct = {
  slug: string;
  name: string;
  categorySlug: (typeof seedCategories)[number]["slug"];
  priceCents: number;
  description: string;
  details: string[];
  sizes?: string[];
  images: ProductImage[];
  isNew?: boolean;
  isFeatured?: boolean;
  stock: number;
};

export const seedProducts: SeedProduct[] = [
  {
    slug: "boxy-top-handle-bag",
    name: "Boxy Top-Handle Bag",
    categorySlug: "bags",
    priceCents: 189000,
    description:
      "A structured top-handle bag in glossy vermilion calf leather, finished with a polished metal clasp. Carried by hand or on the detachable strap.",
    details: ["Smooth calf leather", "Polished metal hardware", "Suede-lined interior with one zip pocket", "Detachable shoulder strap", "Made in Italy"],
    images: [{ src: unsplash("1584917865442-de89df76afd3"), alt: "Boxy Top-Handle Bag" }],
    isNew: true,
    isFeatured: true,
    stock: 12,
  },
  {
    slug: "garden-print-tote",
    name: "Garden Print Tote",
    categorySlug: "bags",
    priceCents: 145000,
    description:
      "A roomy tote printed with a hand-drawn botanical pattern and trimmed in leather. Large enough for a laptop, polished enough for the evening.",
    details: ["Printed canvas with leather trim", "Twin rolled handles", "Magnetic closure", "Interior zip pocket", "Made in Italy"],
    images: [{ src: unsplash("1591561954557-26941169b49e"), alt: "Garden Print Tote" }],
    isFeatured: true,
    stock: 4,
  },
  {
    slug: "leather-biker-jacket",
    name: "Leather Biker Jacket",
    categorySlug: "outerwear",
    priceCents: 225000,
    description:
      "The classic asymmetric biker silhouette in supple lambskin, with a quilted-free lining and silver zips at the cuffs and pockets. It softens and darkens beautifully with wear.",
    details: ["Lambskin leather", "Asymmetric zip front", "Silver-tone hardware", "Satin lining", "Wipe clean with a soft cloth"],
    sizes: APPAREL,
    images: [
      { src: unsplash("1551028719-00167b16eac5"), alt: "Leather Biker Jacket" },
      {
        src: unsplash("1487222477894-8943e31ef7b2"),
        alt: "Man wearing a leather biker jacket over a shirt and tie",
      },
    ],
    isNew: true,
    isFeatured: true,
    stock: 8,
  },
  {
    slug: "botanical-stiletto-pump",
    name: "Botanical Stiletto Pump",
    categorySlug: "shoes",
    priceCents: 74000,
    description:
      "A pointed-toe stiletto in vivid floral satin on a slim 100 mm heel. Cushioned insole and leather sole.",
    details: ["Floral-print satin", "100 mm heel", "Leather sole and lining", "Cushioned insole", "Made in Portugal"],
    sizes: ["36", "37", "38", "39", "40", "41"],
    images: [{ src: unsplash("1543163521-1bf539c55dd2"), alt: "Botanical Stiletto Pump" }],
    isFeatured: true,
    stock: 0,
  },
  {
    slug: "fringe-knit-poncho",
    name: "Fringe Knit Poncho",
    categorySlug: "knitwear",
    priceCents: 52000,
    description:
      "An open-knit poncho in soft ivory cotton with a deep V neckline and long fringe hem. Layer it over a slip dress or a simple tee.",
    details: ["Open-knit cotton blend", "V neckline", "Fringed hem", "One size fits most", "Hand wash cold, dry flat"],
    images: [{ src: unsplash("1434389677669-e08b4cac3105"), alt: "Fringe Knit Poncho" }],
    isFeatured: true,
    stock: 20,
  },
  {
    slug: "windowpane-three-piece",
    name: "Windowpane Three-Piece Suit",
    categorySlug: "tailoring",
    priceCents: 298000,
    description:
      "A three-piece suit in a blue wool blend with a subtle windowpane check. Half-canvassed jacket, notch lapels and a matching waistcoat and trouser.",
    details: ["Wool-blend suiting", "Jacket, waistcoat and trouser", "Half-canvassed construction", "Fully lined", "Dry clean only"],
    sizes: APPAREL,
    images: [{ src: unsplash("1594938298603-c8148c4dae35"), alt: "Windowpane Three-Piece Suit" }],
    isNew: true,
    isFeatured: true,
    stock: 3,
  },
  {
    slug: "poppy-belted-midi",
    name: "Poppy Belted Midi Dress",
    categorySlug: "dresses",
    priceCents: 96000,
    description:
      "A flared midi dress in a red poppy print with a V neckline, short sleeves and a wide buckled belt that defines the waist.",
    details: ["Printed viscose crepe", "Wide belt with covered buckle", "Side pockets", "Concealed back zip", "Cool machine wash"],
    sizes: APPAREL,
    images: [{ src: unsplash("1572804013309-59a88b7e92f1"), alt: "Poppy Belted Midi Dress" }],
    isFeatured: true,
    stock: 15,
  },
  {
    slug: "camel-wrap-coat",
    name: "Camel Wrap Coat",
    categorySlug: "outerwear",
    priceCents: 178000,
    description:
      "An unlined wrap coat in a brushed wool blend with a self-tie belt and a relaxed shawl collar. Cut long for an easy, enveloping drape.",
    details: ["Brushed wool blend", "Shawl collar with self-tie belt", "Unlined", "Two patch pockets", "Dry clean only"],
    sizes: APPAREL,
    images: [
      { src: unsplash("1608748010899-18f300247112"), alt: "Camel Wrap Coat" },
      {
        src: unsplash("1445205170230-053b83016050"),
        alt: "Rail of wool and knit coats in neutral tones",
      },
    ],
    isFeatured: true,
    stock: 6,
  },
  {
    slug: "round-acetate-sunglasses",
    name: "Round Acetate Sunglasses",
    categorySlug: "eyewear",
    priceCents: 38000,
    description:
      "Round-frame sunglasses in pale acetate with grey-tinted lenses and a slim metal bridge. Supplied with a chain and a hard case.",
    details: ["Acetate frame", "UV400 grey lenses", "Metal bridge and temples", "Detachable chain", "Hard case included"],
    images: [{ src: unsplash("1469334031218-e382a71b716b"), alt: "Woman holding round sunglasses in front of her eyes" }],
    isNew: true,
    stock: 25,
  },
  {
    slug: "rust-rib-knit-beanie",
    name: "Rust Rib-Knit Beanie",
    categorySlug: "hats",
    priceCents: 14000,
    description:
      "A deep-cuffed beanie in a soft merino-blend rib, in a warm rust shade that goes with everything in the winter wardrobe.",
    details: ["Merino-blend rib knit", "Deep turn-up cuff", "One size", "Hand wash cold, dry flat"],
    images: [{ src: unsplash("1556905055-8f358a7a47b2"), alt: "Rust beanie laid on a grey knit sweater and denim" }],
    stock: 18,
  },
];

export const seedCollections = [
  {
    slug: "women",
    name: "Women",
    blurb: "Dresses, knitwear and tailoring",
    imageSrc: unsplash("1496747611176-843222e1e57c", 1000),
    imageAlt: "Woman holding the skirt of a floral wrap dress by the sea",
    sortOrder: 1,
    productSlugs: [
      "poppy-belted-midi",
      "camel-wrap-coat",
      "fringe-knit-poncho",
      "botanical-stiletto-pump",
      "boxy-top-handle-bag",
      "garden-print-tote",
      "leather-biker-jacket",
      "round-acetate-sunglasses",
    ],
  },
  {
    slug: "men",
    name: "Men",
    blurb: "Leather, suiting and essentials",
    imageSrc: unsplash("1487222477894-8943e31ef7b2", 1000),
    imageAlt: "Man in a brown leather jacket and sunglasses",
    sortOrder: 2,
    productSlugs: [
      "windowpane-three-piece",
      "leather-biker-jacket",
      "rust-rib-knit-beanie",
      "round-acetate-sunglasses",
    ],
  },
  {
    slug: "accessories",
    name: "Accessories",
    blurb: "Eyewear, bags and small leather goods",
    imageSrc: unsplash("1469334031218-e382a71b716b", 1000),
    imageAlt: "Woman holding round sunglasses in front of her eyes",
    sortOrder: 3,
    productSlugs: [
      "boxy-top-handle-bag",
      "garden-print-tote",
      "round-acetate-sunglasses",
      "rust-rib-knit-beanie",
    ],
  },
] as const;

export const seedJournal = [
  {
    slug: "dressing-for-the-city",
    title: "Dressing for the city, in any weather",
    excerpt:
      "From cathedral squares to rain-slicked boulevards, how this season's coats are cut, lined and finished.",
    publishedAt: "2026-11-02T09:00:00Z",
    coverSrc: unsplash("1539109136881-3be0616acf4b", 1600),
    coverAlt: "Woman in a powder-blue coat standing in a cathedral square",
    body: `A good coat does more work than any other piece in the wardrobe. It frames every outfit, takes the worst of the weather, and is the first thing anyone notices when you walk in.

This season we started with the weather itself. Cities are rarely just cold or just wet; they are both, with a wind tunnel between every pair of buildings. So our outerwear is cut with room across the shoulders for layering, and longer in the body than you might expect.

Fabric matters as much as shape. The wool blends are brushed rather than pressed, which gives a soft surface that sheds light rain and keeps its shape through a long commute. Linings are chosen for how they feel against knitwear, not just how they look when the coat is open.

Finally, the details. Pockets are deep enough for gloves and a phone. Belts are self-tied so they sit exactly where you want them. And every seam is finished by hand, so the coat looks as good inside as it does on the street.`,
  },
  {
    slug: "the-case-for-the-biker-jacket",
    title: "The case for the biker jacket",
    excerpt:
      "Why one well-made leather jacket outlasts a dozen trends, and how to wear it with almost anything.",
    publishedAt: "2026-10-20T09:00:00Z",
    coverSrc: unsplash("1551028719-00167b16eac5", 1600),
    coverAlt: "Black leather biker jacket laid flat on white linen",
    body: `Few garments have survived as many decades as the biker jacket. The asymmetric zip, the sharp lapels and the slightly cropped body have barely changed, because they didn't need to.

What does change is how it ages. Good lambskin softens at the elbows, darkens at the seams and takes on the shape of whoever wears it. A new jacket is a starting point; a ten-year-old one is a personal record.

Wear it over a slip dress for contrast, over a shirt and tie to take the edge off tailoring, or simply with denim and a white tee. The trick is to keep everything else simple and let the leather do the talking.

Care is easy. Wipe it with a soft cloth, store it on a wide hanger, and let it dry naturally if it gets caught in the rain. Avoid heat, and avoid over-conditioning; leather this good mostly wants to be left alone.`,
  },
  {
    slug: "colour-notes-for-autumn",
    title: "Colour notes for autumn",
    excerpt:
      "Burgundy, camel and a single bright accent: a short guide to building a palette that works all season.",
    publishedAt: "2026-10-05T09:00:00Z",
    coverSrc: unsplash("1509631179647-0177331693ae", 1600),
    coverAlt: "Woman in striped wide-leg trousers against a teal wall",
    body: `Autumn palettes tend to be earthy, and for good reason: deep reds, warm browns and soft creams all look better as the light turns low and golden.

Start with a base of two or three neutrals you genuinely love. Camel and ivory are an easy pair; add charcoal if you want something sharper. These are the pieces you'll reach for most, so choose quality over novelty.

Then add one colour with some nerve. Burgundy is the obvious choice this year, but a bold teal or a poppy red can do the same job. Keep it to a single piece at a time, such as a coat, a bag or a pair of shoes, so it reads as a decision rather than an accident.

Finally, repeat. If your bag picks up the colour of your scarf, or your shoes echo the coat lining, the whole outfit feels considered without feeling matched.`,
  },
  {
    slug: "slow-knitwear",
    title: "In praise of slow knitwear",
    excerpt:
      "Open stitches, natural fibres and long fringes: what makes a knit worth keeping for years.",
    publishedAt: "2026-09-18T09:00:00Z",
    coverSrc: unsplash("1434389677669-e08b4cac3105", 1600),
    coverAlt: "Ivory open-knit poncho hanging on a wooden hanger",
    body: `Knitwear is where fast fashion most often shows its hand: pilling after two washes, stretched cuffs, colours that fade. Slow knitwear is the opposite, and you can usually tell from across the room.

It starts with the fibre. Natural yarns such as cotton, wool and cashmere blends breathe, hold their shape and age gracefully. An open stitch like the one in our fringe poncho adds air and texture, which is why it layers so well in the shoulder seasons.

Then there is construction. Fully fashioned knits are shaped as they are made rather than cut from a flat piece, so seams sit where the body does and nothing twists after washing.

Look after it and it will last. Wash cold by hand, press out the water in a towel, and dry it flat. Fold it rather than hanging it, and it will be as good in ten winters as it is today.`,
  },
] as const;
