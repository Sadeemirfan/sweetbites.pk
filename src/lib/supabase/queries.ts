import { createClient } from "@/lib/supabase/server";
import type { Branch } from "@/lib/branches";
import type {
  CategoryRow,
  CategoryWithCount,
  Product,
  ProductRow,
  ProductSize,
  ReviewRow,
} from "@/types/catalogue";

/**
 * Read paths for the public catalogue. Everything here runs under the
 * anonymous RLS policies from Phase 2, so inactive categories/products
 * and unapproved reviews are filtered out by the database rather than by
 * these queries - the explicit `.eq("is_active", true)` calls are belt
 * and braces, and keep the intent readable at the call site.
 *
 * Every function also takes a `branch` - Arifwala, Lahore, and Pattoki
 * share these tables, each row tagged by which branch it belongs to.
 */

function parseSizes(value: ProductRow["sizes"]): ProductSize[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (typeof entry !== "object" || entry === null || Array.isArray(entry)) return [];
    const record = entry as Record<string, unknown>;
    const label = typeof record.label === "string" ? record.label : null;
    const price = typeof record.price === "number" ? record.price : null;
    if (!label || price === null) return [];
    return [
      {
        label,
        price,
        weight_kg: typeof record.weight_kg === "number" ? record.weight_kg : null,
      },
    ];
  });
}

function parseStringArray(value: ProductRow["flavors"]): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

type ProductRowWithCategory = ProductRow & {
  categories: Pick<CategoryRow, "id" | "name" | "slug"> | null;
};

function toProduct(row: ProductRowWithCategory): Product {
  const sizes = parseSizes(row.sizes);
  const prices = sizes.map((size) => size.price);

  return {
    ...row,
    sizes,
    flavors: parseStringArray(row.flavors),
    images: parseStringArray(row.images),
    startingPrice: prices.length ? Math.min(...prices) : row.base_price,
    category: row.categories,
  };
}

const PRODUCT_SELECT = "*, categories!inner(id, name, slug)";

export async function getCategoriesWithCounts(branch: Branch): Promise<CategoryWithCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*, products(count)")
    .eq("branch", branch)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw error;

  return (data ?? []).map((row) => {
    const { products, ...category } = row as CategoryRow & {
      products: { count: number }[] | null;
    };
    return { ...category, productCount: products?.[0]?.count ?? 0 };
  });
}

export async function getCategoryBySlug(branch: Branch, slug: string): Promise<CategoryRow | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("*")
    .eq("branch", branch)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();

  return data;
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
}

/** Every active product for a branch, across all categories - the flat gallery grid. */
export async function getAllProducts(branch: Branch): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("branch", branch)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  if (error) throw error;
  return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
}

export async function getFeaturedProducts(branch: Branch, limit = 6): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("branch", branch)
    .eq("is_active", true)
    .eq("is_featured", true)
    .order("sort_order")
    // Ties in sort_order come back in whatever order Postgres likes,
    // which changes after any edit - the bestsellers strip would quietly
    // reshuffle itself between visits.
    .order("name")
    .limit(limit);

  if (error) throw error;
  return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
}

export async function getProductBySlug(
  branch: Branch,
  categorySlug: string,
  productSlug: string
): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("branch", branch)
    .eq("slug", productSlug)
    .eq("categories.slug", categorySlug)
    .eq("is_active", true)
    .maybeSingle();

  return data ? toProduct(data as ProductRowWithCategory) : null;
}

/** Every active product for one branch, for sitemap generation. */
export async function getAllProductPaths(
  branch: Branch
): Promise<{ categorySlug: string; productSlug: string; updatedAt: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("slug, created_at, categories!inner(slug)")
    .eq("branch", branch)
    .eq("is_active", true);

  return (
    (data as { slug: string; created_at: string; categories: { slug: string } }[] | null)?.map(
      (row) => ({
        categorySlug: row.categories.slug,
        productSlug: row.slug,
        updatedAt: row.created_at,
      })
    ) ?? []
  );
}

export async function getApprovedReviews(branch: Branch, limit?: number): Promise<ReviewRow[]> {
  const supabase = await createClient();
  let query = supabase
    .from("reviews")
    .select("*")
    .eq("branch", branch)
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

/** Feeds AggregateRating in the Bakery schema (§15). */
export async function getReviewAggregate(
  branch: Branch
): Promise<{ count: number; average: number } | null> {
  const reviews = await getApprovedReviews(branch);
  const rated = reviews.filter((review) => typeof review.rating === "number");
  if (!rated.length) return null;

  const total = rated.reduce((sum, review) => sum + (review.rating ?? 0), 0);
  return {
    count: rated.length,
    average: Math.round((total / rated.length) * 10) / 10,
  };
}

export async function getDeliveryAreas(branch: Branch) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("delivery_areas")
    .select("*")
    .eq("branch", branch)
    .eq("is_active", true)
    .order("sort_order")
    .order("name");

  return data ?? [];
}
