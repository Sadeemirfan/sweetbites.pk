import type { Database } from "@/types/db";

export type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
export type ProductRow = Database["public"]["Tables"]["products"]["Row"];
export type ReviewRow = Database["public"]["Tables"]["reviews"]["Row"];

/** Shape stored in products.sizes - see the seed data in supabase/seed.sql. */
export type ProductSize = {
  label: string;
  weight_kg: number | null;
  price: number;
};

export type CategoryWithCount = CategoryRow & { productCount: number };

/** A product with its jsonb columns parsed and its starting price resolved. */
export type Product = Omit<ProductRow, "sizes" | "flavors" | "images"> & {
  sizes: ProductSize[];
  flavors: string[];
  images: string[];
  /** Lowest size price, falling back to base_price. Drives "From Rs. X". */
  startingPrice: number | null;
  category: Pick<CategoryRow, "id" | "name" | "slug"> | null;
};
