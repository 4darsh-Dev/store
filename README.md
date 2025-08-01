## Full Stack E-Commerce Website (+ Dashboard) with Next.js 14: React, Typescript, Tailwindcss, Prisma, Supabase, NextAuth, Redux.

![Fullstack E-Commerce Website](https://res.cloudinary.com/drokemaoa/image/upload/v1709638892/bitexPoster.png)

## Overview

Bitex is a full-stack E-Commerce project developed with Next.js 14, featuring a range of technologies including React, Typescript, Tailwindcss, Prisma, Supabase (PostgreSQL), NextAuth, and Redux. **Now enhanced with advanced search functionality and bulk import capabilities.**

⚠️ `Note:` This project is a personal endeavor created for portfolio purposes and is not associated with any real business or project.

## 🆕 Latest Updates

- **✅ Migrated from MongoDB to Supabase (PostgreSQL)** for better performance and scalability
- **🔍 Enhanced Search Engine** with full-text search and advanced filtering
- **📤 Bulk Import System** for products, categories, and brands
- **📊 Search Analytics** with query logging and performance tracking
- **🎯 Optimized Database Schema** with proper indexes and relationships

---

#### 🔗 Live Version:

https://bitex.namvar.dev ⤴️

---

### 🖥️ Admin Dashboard Features

#### 🔐 Authentication:

- Credential authentication for Dashboard using NextAuth.

#### 📁 Category Management:

- Advanced category management, including combining categories.
- Add, update, and delete categories and subcategories.
- Dedicated **specifications** for every category.

#### 🏭 Brands and Products:

- Add and delete products with category-specific specifications.
- Add, update, and delete brands.

#### 📋 Traffic Report:

- Reports on user page visits.

<br/>
<br/>

---

### 🛍️ E-Commerce Store Features

#### 🎨 UI Features:

- Full responsiveness
- CSS animations and effects
- Skeleton loadings (without using external library )to have seamless page navigation experience.
- Custom made UI Components (no external library):

  - Price range slider
  - CheckBox
  - DropDownList
  - Popups
  - Button

- Interactive Homepage Slider

  - Crafted from scratch without using any Library
  - Supports both Mouse Drag and `TouchInput`

- Shopping cart management with **Redux**.
- Product gallery to showcase items attractively.
- Dynamically Loading Categories (List) from Database

#### 🔍 Filter and Search:

- **🆕 Advanced Search Engine** with full-text search across products, brands, and categories
- **🎯 Smart Filtering** by price range, brand, category, availability, and discounts
- **📊 Search Analytics** with query logging and result tracking
- **⚡ Real-time Search** with instant results and suggestions
- Advanced filters products by Price, Brand, and Availability.
- Sorting options in product list page (sort by name, price, and relevance).

#### ⚙️ Backend:

- **🆕 Supabase Integration** with PostgreSQL for enhanced performance
- **📤 Bulk Import APIs** for efficient data management
- Database integration using Supabase (PostgreSQL) with Prisma ORM.
- Server-side form data validation using ZOD.
- **🔍 Search APIs** with advanced filtering and pagination

<br/>

## 🚀 Getting Started

### 📋 Prerequisites

- Node.js 18+ 
- Supabase account ([supabase.com](https://supabase.com))
- npm or yarn package manager

### 💾 Cloning the repository

```shell
git clone https://github.com/HosseinNamvar/bitex.git
cd bitex
```

### 📥 Install packages

```shell
npm install
```

### 🛠️ Setup .env file

Copy `.env.example` to `.env` and configure:

```js
# Supabase Database URL (PostgreSQL)
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# NextAuth Configuration
NEXTAUTH_SECRET="your-super-secret-nextauth-key"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Cloudinary for image uploads
CLOUDINARY_URL="cloudinary://api_key:api_secret@cloud_name"

# Optional: Supabase keys for advanced features  
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### ⬆️ Setup Database with Prisma

```shell
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed database with sample data
npm run db:seed
```

### 🚀 Start the app

```shell
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see your store!

## 📤 Bulk Data Import

### Quick Import with Sample Data

```shell
cd examples
node bulk-import.js
```

### API Endpoints for Bulk Import

- `POST /api/products/bulk` - Import products
- `POST /api/categories` - Import categories  
- `POST /api/brands` - Import brands
- `GET /api/search` - Search products with filters

See `examples/` directory for sample data and import scripts.

## 🔍 Search API Usage

### Basic Search
```javascript
GET /api/search?q=iPhone&category=smartphones&minPrice=500&maxPrice=1000
```

### Advanced Search
```javascript
POST /api/search
{
  "query": "iPhone",
  "filters": {
    "categories": ["cat-id-1"],
    "brands": ["brand-id-1"],
    "priceRange": { "min": 500, "max": 1000 },
    "hasDiscount": true,
    "inStock": true
  },
  "sort": { "field": "price", "order": "asc" },
  "pagination": { "page": 1, "limit": 20 }
}
```

## 📚 Documentation

- **[Migration Guide](./MIGRATION_GUIDE.md)** - Complete migration from MongoDB to Supabase
- **[Bulk Import Examples](./examples/BULK_IMPORT_EXAMPLES.md)** - Sample data and scripts
- **[API Documentation](./docs/API.md)** - Detailed API reference

## 🛠️ Available Scripts

```shell
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:migrate      # Run Prisma migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset and reseed database

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
```
