# Migration Guide: MongoDB to Supabase + Prisma ORM

This guide will help you migrate your e-commerce store from MongoDB to Supabase (PostgreSQL) with enhanced search functionality.

## 🚀 Quick Start

### 1. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Project Settings > Database
3. Copy your connection string

### 2. Environment Configuration
Copy `.env.example` to `.env` and update:

```bash
# Your Supabase PostgreSQL connection string
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth secret (generate a random string)
NEXTAUTH_SECRET="your-super-secret-nextauth-key"

# Your domain (for production)
NEXTAUTH_URL="https://yourdomain.com"
```

### 3. Database Migration
```bash
# Install dependencies
npm install

# Generate Prisma client
npm run db:generate

# Create and run migrations
npm run db:migrate

# Seed the database with sample data
npm run db:seed
```

## 📊 New Features Added

### 🔍 Enhanced Search Functionality
- **Full-text search** across product names, descriptions, brands, and categories
- **Advanced filtering** by price, brand, category, availability
- **Search analytics** with query logging
- **Faceted search** with result counts for filters

### 📤 Bulk Import System
- **Bulk product import** via API endpoints
- **Bulk category import** with automatic URL generation
- **Bulk brand import** with duplicate checking
- **Error handling** and detailed import reports

### 🗃️ PostgreSQL Optimizations
- **Database indexes** for faster queries
- **JSON fields** for flexible product specifications
- **Proper relationships** with foreign key constraints
- **Timestamps** for audit trails

## 🛠️ API Endpoints

### Search API
```
GET /api/search?q=iPhone&category=smartphones&minPrice=500&maxPrice=1000
```

### Bulk Import APIs
```
POST /api/products/bulk
POST /api/categories/bulk  
POST /api/brands/bulk
```

### Example Bulk Product Import
```javascript
const response = await fetch('/api/products/bulk', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    products: [
      {
        name: "iPhone 15 Pro",
        desc: "Latest iPhone with A17 Pro chip",
        price: 999.99,
        salePrice: 899.99,
        brandName: "Apple",
        categoryName: "Smartphones",
        specialFeatures: ["A17 Pro Chip", "Titanium Design"],
        images: ["/products/iphone15pro.jpg"],
        sku: "IP15P-001",
        stock: 50,
        specs: {
          display: "6.1 inch OLED",
          storage: "128GB",
          camera: "48MP Pro Camera System"
        }
      }
    ]
  })
})
```

## 🔄 Data Migration Steps

### 1. Export Existing Data
If you have existing MongoDB data, export it:
```bash
mongoexport --db your_db_name --collection products --out products.json
mongoexport --db your_db_name --collection categories --out categories.json
mongoexport --db your_db_name --collection brands --out brands.json
```

### 2. Transform and Import
Use the bulk import APIs to transform and import your data:

```javascript
// Example transformation script
const transformProducts = (mongoProducts) => {
  return mongoProducts.map(product => ({
    name: product.name,
    desc: product.description,
    price: product.price,
    salePrice: product.salePrice,
    brandName: product.brand?.name || 'Unknown',
    categoryName: product.category?.name || 'Uncategorized',
    specialFeatures: product.features || [],
    images: product.imageUrls || [],
    sku: product.sku,
    stock: product.inventory || 0,
    specs: product.specifications
  }))
}
```

## 🎯 Search Implementation

### Basic Search
```javascript
// Client-side search
const searchProducts = async (query) => {
  const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
  const data = await response.json()
  return data.products
}
```

### Advanced Search with Filters
```javascript
const advancedSearch = async (searchParams) => {
  const response = await fetch('/api/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: searchParams.query,
      filters: {
        categories: searchParams.categoryIds,
        brands: searchParams.brandIds,
        priceRange: {
          min: searchParams.minPrice,
          max: searchParams.maxPrice
        },
        hasDiscount: searchParams.onSale,
        inStock: searchParams.inStock
      },
      sort: {
        field: searchParams.sortBy || 'createdAt',
        order: searchParams.sortOrder || 'desc'
      },
      pagination: {
        page: searchParams.page || 1,
        limit: searchParams.limit || 20
      }
    })
  })
  return response.json()
}
```

## 🚨 Important Changes from MongoDB

### ID Field Changes
- **Before**: `@id @default(auto()) @map("_id") @db.ObjectId`
- **After**: `@id @default(cuid())`

### JSON Fields
- **Before**: Custom types like `ProductSpec[]`, `NameValue[]`
- **After**: `Json` type for flexible data storage

### Relationships
- **Before**: String IDs with `@db.ObjectId`
- **After**: Standard string relationships with proper foreign keys

### Indexes
- Added database indexes for commonly queried fields
- Full-text search optimization
- Composite indexes for complex queries

## 📈 Performance Improvements

1. **Database Indexes**: Faster queries on name, category, brand, price
2. **Search Vector**: Pre-computed search strings for faster text search
3. **Pagination**: Efficient offset-based pagination
4. **Caching**: Database query optimization with Prisma

## 🔧 Development Commands

```bash
# Database operations
npm run db:migrate    # Run migrations
npm run db:generate   # Generate Prisma client  
npm run db:seed       # Seed with sample data
npm run db:studio     # Open Prisma Studio
npm run db:reset      # Reset and reseed database

# Development
npm run dev           # Start development server
npm run build         # Build for production
npm run lint          # Run linting
```

## 🎉 Next Steps

1. **Set up Supabase project** and get connection string
2. **Update environment variables** with your credentials
3. **Run migrations** to create database schema
4. **Import your existing data** using bulk APIs
5. **Test search functionality** with sample queries
6. **Deploy to production** with proper environment setup

## 🆘 Troubleshooting

### Common Issues

1. **Connection Error**: Verify DATABASE_URL is correct
2. **Migration Failed**: Check PostgreSQL permissions
3. **Search Not Working**: Ensure search indexes are created
4. **Bulk Import Failing**: Validate data format matches schema

### Support
- Check Prisma docs: [prisma.io/docs](https://prisma.io/docs)
- Supabase docs: [supabase.com/docs](https://supabase.com/docs)
- NextJS API routes: [nextjs.org/docs/api-routes](https://nextjs.org/docs/api-routes)