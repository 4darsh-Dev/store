import { NextRequest, NextResponse } from "next/server";
import { db } from "@/shared/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = { isAvailable: true };

    // Search functionality
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { desc: { contains: query, mode: "insensitive" } },
        { specialFeatures: { hasSome: [query] } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    // Category filter
    if (category) {
      where.category = {
        OR: [{ name: { equals: category, mode: "insensitive" } }, { url: { equals: category, mode: "insensitive" } }],
      };
    }

    // Brand filter
    if (brand) {
      where.brand = { name: { equals: brand, mode: "insensitive" } };
    }

    // Price filters
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    // Build order by clause
    const orderBy: any = {};
    if (sortBy === "price") {
      orderBy.price = sortOrder;
    } else if (sortBy === "name") {
      orderBy.name = sortOrder;
    } else if (sortBy === "createdAt") {
      orderBy.createdAt = sortOrder;
    } else {
      orderBy.createdAt = "desc";
    }

    // Fetch products with related data
    const [rawProducts, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: {
            select: {
              id: true,
              name: true,
              logoUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              url: true,
              iconUrl: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      db.product.count({ where }),
    ]);

    // Convert Decimal fields to numbers for Client Components
    const products = rawProducts.map((product) => ({
      ...product,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

    // Log search query for analytics
    if (query) {
      await db.searchLog
        .create({
          data: {
            query,
            results: totalCount,
          },
        })
        .catch(() => {}); // Don't fail if logging fails
    }

    // Get aggregation data for filters
    const [brands, categories, priceRange] = await Promise.all([
      db.brand.findMany({
        where: {
          products: {
            some: where,
          },
        },
        select: {
          id: true,
          name: true,
          _count: {
            select: {
              products: {
                where,
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      db.category.findMany({
        where: {
          products: {
            some: where,
          },
        },
        select: {
          id: true,
          name: true,
          url: true,
          _count: {
            select: {
              products: {
                where,
              },
            },
          },
        },
        orderBy: { name: "asc" },
      }),
      db.product.aggregate({
        where,
        _min: { price: true },
        _max: { price: true },
      }),
    ]);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
      filters: {
        brands,
        categories,
        priceRange: {
          min: priceRange._min.price ? Number(priceRange._min.price) : 0,
          max: priceRange._max.price ? Number(priceRange._max.price) : 0,
        },
      },
      meta: {
        query,
        totalResults: totalCount,
        searchTime: Date.now(),
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// POST endpoint for advanced search with complex filters
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      query,
      filters = {},
      sort = { field: "createdAt", order: "desc" },
      pagination = { page: 1, limit: 20 },
    } = body;

    const { page, limit } = pagination;
    const skip = (page - 1) * Math.min(limit, 100);

    // Build complex where clause
    const where: any = { isAvailable: true };

    // Text search
    if (query) {
      where.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { desc: { contains: query, mode: "insensitive" } },
        { brand: { name: { contains: query, mode: "insensitive" } } },
        { category: { name: { contains: query, mode: "insensitive" } } },
      ];
    }

    // Apply filters
    if (filters.categories && filters.categories.length > 0) {
      where.categoryID = { in: filters.categories };
    }

    if (filters.brands && filters.brands.length > 0) {
      where.brandID = { in: filters.brands };
    }

    if (filters.priceRange) {
      where.price = {};
      if (filters.priceRange.min) where.price.gte = filters.priceRange.min;
      if (filters.priceRange.max) where.price.lte = filters.priceRange.max;
    }

    if (filters.hasDiscount) {
      where.salePrice = { not: null };
    }

    if (filters.inStock) {
      where.stock = { gt: 0 };
    }

    // Build order by
    const orderBy: any = {};
    if (sort.field === "price") {
      orderBy.price = sort.order;
    } else if (sort.field === "name") {
      orderBy.name = sort.order;
    } else if (sort.field === "discount") {
      // Custom sorting for discount percentage
      orderBy.salePrice = sort.order;
    } else {
      orderBy.createdAt = sort.order;
    }

    const [rawProducts, totalCount] = await Promise.all([
      db.product.findMany({
        where,
        include: {
          brand: true,
          category: true,
        },
        orderBy,
        skip,
        take: Math.min(limit, 100),
      }),
      db.product.count({ where }),
    ]);

    // Convert Decimal fields to numbers for Client Components
    const products = rawProducts.map((product) => ({
      ...product,
      price: Number(product.price),
      salePrice: product.salePrice ? Number(product.salePrice) : null,
    }));

    // Log search
    if (query) {
      await db.searchLog
        .create({
          data: {
            query,
            results: totalCount,
          },
        })
        .catch(() => {});
    }

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("Advanced search error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
