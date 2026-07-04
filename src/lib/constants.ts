export const PARTNERS = [
  { name: "aways", ownershipBps: 6000, sortOrder: 1, legacyNames: ["Partner A"] },
  { name: "zawar", ownershipBps: 2000, sortOrder: 2, legacyNames: ["Partner B"] },
  { name: "zaham", ownershipBps: 2000, sortOrder: 3, legacyNames: ["Partner C"] },
] as const;

export const CATEGORIES = [
  { name: "Inventory", slug: "inventory", color: "#2563eb", excludeFromReconciliation: false },
  {
    name: "Warehouse Rent",
    slug: "warehouse-rent",
    color: "#7c3aed",
    excludeFromReconciliation: false,
  },
  { name: "Utilities", slug: "utilities", color: "#0891b2", excludeFromReconciliation: false },
  { name: "Packaging", slug: "packaging", color: "#059669", excludeFromReconciliation: false },
  { name: "Shipping", slug: "shipping", color: "#dc2626", excludeFromReconciliation: false },
  { name: "Fuel", slug: "fuel", color: "#ea580c", excludeFromReconciliation: false },
  { name: "Marketing", slug: "marketing", color: "#db2777", excludeFromReconciliation: false },
  { name: "Equipment", slug: "equipment", color: "#475569", excludeFromReconciliation: false },
  { name: "Repairs", slug: "repairs", color: "#ca8a04", excludeFromReconciliation: false },
  { name: "Software", slug: "software", color: "#4f46e5", excludeFromReconciliation: false },
  { name: "Office", slug: "office", color: "#0d9488", excludeFromReconciliation: false },
  { name: "Food", slug: "food", color: "#16a34a", excludeFromReconciliation: false },
  { name: "Returns", slug: "returns", color: "#be123c", excludeFromReconciliation: false },
  { name: "Salary", slug: "salary", color: "#9333ea", excludeFromReconciliation: true },
  { name: "Misc", slug: "misc", color: "#64748b", excludeFromReconciliation: false },
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
