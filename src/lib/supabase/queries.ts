import { createPublicClient } from "@/lib/supabase/public";
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
 * anonymous RLS policies from Phase 2 via the cookie-less public client,
 * so inactive categories/products and unapproved reviews are filtered out
 * by the database rather than by these queries - the explicit
 * `.eq("is_active", true)` calls are belt and braces, and keep the intent
 * readable at the call site.
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
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*, products(count)")
      .eq("branch", branch)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      console.error(`[queries] getCategoriesWithCounts error for ${branch}:`, error.message);
      return [];
    }

    return (data ?? []).map((row) => {
      const { products, ...category } = row as CategoryRow & {
        products: { count: number }[] | null;
      };
      return { ...category, productCount: products?.[0]?.count ?? 0 };
    });
  } catch (err) {
    console.error(`[queries] getCategoriesWithCounts exception for ${branch}:`, err);
    return [];
  }
}

export async function getCategoryBySlug(branch: Branch, slug: string): Promise<CategoryRow | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("branch", branch)
      .eq("slug", slug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error(`[queries] getCategoryBySlug error for ${branch}/${slug}:`, error.message);
      return null;
    }
    return data;
  } catch (err) {
    console.error(`[queries] getCategoryBySlug exception for ${branch}/${slug}:`, err);
    return null;
  }
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("category_id", categoryId)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      console.error(`[queries] getProductsByCategory error for ${categoryId}:`, error.message);
      return [];
    }
    return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
  } catch (err) {
    console.error(`[queries] getProductsByCategory exception for ${categoryId}:`, err);
    return [];
  }
}

/** Every active product for a branch, across all categories - the flat gallery grid. */
export async function getAllProducts(branch: Branch): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("branch", branch)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      console.error(`[queries] getAllProducts error for ${branch}:`, error.message);
      return [];
    }
    return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
  } catch (err) {
    console.error(`[queries] getAllProducts exception for ${branch}:`, err);
    return [];
  }
}

export async function getFeaturedProducts(branch: Branch, limit = 6): Promise<Product[]> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("branch", branch)
      .eq("is_active", true)
      .eq("is_featured", true)
      .order("sort_order")
      .order("name")
      .limit(limit);

    if (error) {
      console.error(`[queries] getFeaturedProducts error for ${branch}:`, error.message);
      return [];
    }
    return (data as ProductRowWithCategory[] | null)?.map(toProduct) ?? [];
  } catch (err) {
    console.error(`[queries] getFeaturedProducts exception for ${branch}:`, err);
    return [];
  }
}

export async function getProductBySlug(
  branch: Branch,
  categorySlug: string,
  productSlug: string
): Promise<Product | null> {
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("products")
      .select(PRODUCT_SELECT)
      .eq("branch", branch)
      .eq("slug", productSlug)
      .eq("categories.slug", categorySlug)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error(
        `[queries] getProductBySlug error for ${branch}/${categorySlug}/${productSlug}:`,
        error.message
      );
      return null;
    }
    return data ? toProduct(data as ProductRowWithCategory) : null;
  } catch (err) {
    console.error(
      `[queries] getProductBySlug exception for ${branch}/${categorySlug}/${productSlug}:`,
      err
    );
    return null;
  }
}

/** Every active product for one branch, for sitemap generation. */
export async function getAllProductPaths(
  branch: Branch
): Promise<{ categorySlug: string; productSlug: string; updatedAt: string }[]> {
  try {
    const supabase = createPublicClient();
    type Row = {
      slug: string;
      created_at: string;
      updated_at?: string | null;
      categories: { slug: string };
    };

    const { data, error } = await supabase
      .from("products")
      .select("slug, created_at, updated_at, categories!inner(slug)")
      .eq("branch", branch)
      .eq("is_active", true);

    let rows = data as Row[] | null;
    if (error) {
      const fallback = await supabase
        .from("products")
        .select("slug, created_at, categories!inner(slug)")
        .eq("branch", branch)
        .eq("is_active", true);
      rows = fallback.data as Row[] | null;
    }

    return (
      rows?.map((row) => ({
        categorySlug: row.categories.slug,
        productSlug: row.slug,
        updatedAt: row.updated_at ?? row.created_at,
      })) ?? []
    );
  } catch (err) {
    console.error(`[queries] getAllProductPaths exception for ${branch}:`, err);
    return [];
  }
}

export async function getApprovedReviews(branch: Branch, limit?: number): Promise<ReviewRow[]> {
  try {
    const supabase = createPublicClient();
    let query = supabase
      .from("reviews")
      .select("*")
      .eq("branch", branch)
      .eq("is_approved", true)
      .order("created_at", { ascending: false });

    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) {
      console.error(`[queries] getApprovedReviews error for ${branch}:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error(`[queries] getApprovedReviews exception for ${branch}:`, err);
    return [];
  }
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
  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("delivery_areas")
      .select("*")
      .eq("branch", branch)
      .eq("is_active", true)
      .order("sort_order")
      .order("name");

    if (error) {
      console.error(`[queries] getDeliveryAreas error for ${branch}:`, error.message);
      return [];
    }
    return data ?? [];
  } catch (err) {
    console.error(`[queries] getDeliveryAreas exception for ${branch}:`, err);
    return [];
  }
}
