// Shared configuration for Artificial Jewellery product types.
// These map to the `jewelleryType` field on the Product model and are used
// by the Shop mega-menu and the Shop listing page for category browsing.

export const JEWELLERY_MENU = [
  {
    label: "Jewellery",
    items: [
      { value: "earrings", label: "Earrings" },
      { value: "necklaces", label: "Necklaces" },
      { value: "rings", label: "Rings" },
      { value: "bracelets", label: "Bracelets" },
      { value: "bangles", label: "Bangles" },
      { value: "anklets", label: "Anklets" },
      { value: "sets", label: "Jewellery Sets" },
    ],
  },
];

// Featured (non-jewellery-type) entries shown in the mega-menu.
// These map to sort/filter values the listing page understands.
export const FEATURED_MENU = [
  { value: "newest", label: "New Arrivals", sort: "newest" },
  { value: "best-seller", label: "Best Sellers", sort: "best-seller" },
];

// Flattened list of jewellery categories for lookups.
export const JEWELLERY_CATEGORIES = JEWELLERY_MENU.flatMap((group) =>
  group.items.map((item) => ({ ...item, group: group.label })),
);

export const jewelleryLabel = (value) =>
  JEWELLERY_CATEGORIES.find((item) => item.value === value)?.label || "";

export const jewelleryHref = (value) =>
  `/shop?jewelleryType=${encodeURIComponent(value)}`;

export const jewellerySortHref = (sort) => `/shop?sort=${sort}`;
