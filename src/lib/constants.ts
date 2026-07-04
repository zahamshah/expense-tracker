export const PARTNERS = [
  { name: "aways", ownershipBps: 6000, sortOrder: 1, legacyNames: ["Partner A"] },
  { name: "zawar", ownershipBps: 2000, sortOrder: 2, legacyNames: ["Partner B"] },
  { name: "zaham", ownershipBps: 2000, sortOrder: 3, legacyNames: ["Partner C"] },
  { name: "Business Account", ownershipBps: 0, sortOrder: 4, legacyNames: [] },
] as const;

export const CATEGORIES = [
  { name: "Inventory", slug: "inventory", color: "#2563eb" },
  { name: "Warehouse Rent", slug: "warehouse-rent", color: "#7c3aed" },
  { name: "Utilities", slug: "utilities", color: "#0891b2" },
  { name: "Packaging", slug: "packaging", color: "#059669" },
  { name: "Shipping", slug: "shipping", color: "#dc2626" },
  { name: "Fuel", slug: "fuel", color: "#ea580c" },
  { name: "Marketing", slug: "marketing", color: "#db2777" },
  { name: "Equipment", slug: "equipment", color: "#475569" },
  { name: "Repairs", slug: "repairs", color: "#ca8a04" },
  { name: "Software", slug: "software", color: "#4f46e5" },
  { name: "Office", slug: "office", color: "#0d9488" },
  { name: "Food", slug: "food", color: "#16a34a" },
  { name: "Returns", slug: "returns", color: "#be123c" },
  { name: "Misc", slug: "misc", color: "#64748b" },
] as const;

export const TIME_ZONE = "Europe/London";
export const PAGE_SIZE = 10;
export const RECEIPT_MAX_BYTES = 10 * 1024 * 1024;
export const RECEIPT_ALLOWED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
