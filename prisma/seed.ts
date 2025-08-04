import { PrismaClient, OptionSetType, PageType } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...");

  try {
    // Clear existing data in correct order
    console.log("🧹 Clearing existing data...");

    await prisma.pageVisit.deleteMany();
    await prisma.productOptionSet.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category_OptionSet.deleteMany();
    await prisma.category_SpecGroup.deleteMany();
    await prisma.optionSet.deleteMany();
    await prisma.specGroup.deleteMany();
    await prisma.category.deleteMany();
    await prisma.brand.deleteMany();

    console.log("✅ Existing data cleared");

    // Create brands one by one to avoid connection pool issues
    console.log("📦 Creating brands...");
    const apple = await prisma.brand.create({
      data: { name: "Apple", logoUrl: "/brands/apple.png" },
    });
    const samsung = await prisma.brand.create({
      data: { name: "Samsung", logoUrl: "/brands/samsung.png" },
    });
    const sony = await prisma.brand.create({
      data: { name: "Sony", logoUrl: "/brands/sony.png" },
    });
    const nike = await prisma.brand.create({
      data: { name: "Nike", logoUrl: "/brands/nike.png" },
    });

    console.log(`✅ Created 4 brands`);

    // Create categories
    console.log("📂 Creating categories...");
    const electronics = await prisma.category.create({
      data: {
        name: "Electronics",
        url: "electronics",
        iconUrl: "/computerIcon.svg",
        iconSize: [24, 24],
      },
    });
    const smartphones = await prisma.category.create({
      data: {
        name: "Smartphones",
        url: "smartphones",
        iconUrl: "/phoneIcon.svg",
        iconSize: [24, 24],
      },
    });
    const laptops = await prisma.category.create({
      data: {
        name: "Laptops",
        url: "laptops",
        iconUrl: "/computerIcon.svg",
        iconSize: [24, 24],
      },
    });
    const shoes = await prisma.category.create({
      data: {
        name: "Shoes",
        url: "shoes",
        iconUrl: "/otherCatIcon.svg",
        iconSize: [24, 24],
      },
    });

    console.log(`✅ Created 4 categories`);

    // Create option sets
    console.log("⚙️ Creating option sets...");
    const colorsOption = await prisma.optionSet.create({
      data: {
        name: "Colors",
        type: OptionSetType.COLOR,
        options: [
          { name: "Black", value: "#000000" },
          { name: "White", value: "#FFFFFF" },
          { name: "Blue", value: "#0066CC" },
          { name: "Red", value: "#CC0000" },
        ],
      },
    });

    const storageOption = await prisma.optionSet.create({
      data: {
        name: "Storage",
        type: OptionSetType.TEXT,
        options: [
          { name: "64GB", value: "64GB" },
          { name: "128GB", value: "128GB" },
          { name: "256GB", value: "256GB" },
          { name: "512GB", value: "512GB" },
        ],
      },
    });

    console.log(`✅ Created 2 option sets`);

    // Create spec groups
    console.log("📋 Creating spec groups...");
    const techSpecs = await prisma.specGroup.create({
      data: {
        title: "Technical Specifications",
        specs: ["Display", "Processor", "RAM", "Storage", "Battery"],
      },
    });

    console.log(`✅ Created 1 spec group`);

    // Create products
    console.log("🛍️ Creating products...");

    const iphone = await prisma.product.create({
      data: {
        name: "iPhone 15 Pro",
        desc: "Latest iPhone with A17 Pro chip and titanium design",
        specialFeatures: ["A17 Pro Chip", "Titanium Design", "Pro Camera System"],
        images: ["/products/iphone15pro-1.jpg", "/products/iphone15pro-2.jpg"],
        price: new Decimal("999.99"),
        salePrice: new Decimal("899.99"),
        sku: "IP15P-001",
        brandID: apple.id,
        categoryID: smartphones.id,
        stock: 50,
        specs: {
          technical: {
            brand: "Apple",
            model: "iPhone 15 Pro",
            warranty: "1 year",
          },
          features: ["A17 Pro Chip", "Titanium Design", "Pro Camera System"],
        },
      },
    });

    const macbook = await prisma.product.create({
      data: {
        name: 'MacBook Pro 16"',
        desc: "Powerful laptop for professionals with M3 chip",
        specialFeatures: ["M3 Chip", "Liquid Retina XDR Display", "22-hour battery"],
        images: ["/products/macbook-pro-1.jpg", "/products/macbook-pro-2.jpg"],
        price: new Decimal("2499.99"),
        sku: "MBP16-001",
        brandID: apple.id,
        categoryID: laptops.id,
        stock: 25,
        specs: {
          technical: {
            brand: "Apple",
            model: 'MacBook Pro 16"',
            warranty: "1 year",
          },
          features: ["M3 Chip", "Liquid Retina XDR Display", "22-hour battery"],
        },
      },
    });

    const galaxy = await prisma.product.create({
      data: {
        name: "Samsung Galaxy S24",
        desc: "AI-powered smartphone with advanced camera",
        specialFeatures: ["AI Photography", "120Hz Display", "5G Ready"],
        images: ["/products/galaxy-s24-1.jpg", "/products/galaxy-s24-2.jpg"],
        price: new Decimal("799.99"),
        salePrice: new Decimal("749.99"),
        sku: "SGS24-001",
        brandID: samsung.id,
        categoryID: smartphones.id,
        stock: 75,
        specs: {
          technical: {
            brand: "Samsung",
            model: "Galaxy S24",
            warranty: "2 years",
          },
          features: ["AI Photography", "120Hz Display", "5G Ready"],
        },
      },
    });

    const airmax = await prisma.product.create({
      data: {
        name: "Nike Air Max 270",
        desc: "Comfortable running shoes with Max Air unit",
        specialFeatures: ["Max Air Unit", "Lightweight", "Breathable Mesh"],
        images: ["/products/nike-airmax-1.jpg", "/products/nike-airmax-2.jpg"],
        price: new Decimal("149.99"),
        salePrice: new Decimal("129.99"),
        sku: "NAM270-001",
        brandID: nike.id,
        categoryID: shoes.id,
        stock: 100,
        specs: {
          technical: {
            brand: "Nike",
            model: "Air Max 270",
            warranty: "6 months",
          },
          features: ["Max Air Unit", "Lightweight", "Breathable Mesh"],
        },
      },
    });

    console.log(`✅ Created 4 products`);

    // Create relationships
    console.log("🔗 Creating relationships...");

    // Category-Option relationships
    await prisma.category_OptionSet.create({
      data: {
        categoryID: smartphones.id,
        optionID: colorsOption.id,
      },
    });

    await prisma.category_OptionSet.create({
      data: {
        categoryID: smartphones.id,
        optionID: storageOption.id,
      },
    });

    // Category-SpecGroup relationships
    await prisma.category_SpecGroup.create({
      data: {
        categoryID: electronics.id,
        specGroupID: techSpecs.id,
      },
    });

    // Product-Option relationships
    await prisma.productOptionSet.create({
      data: {
        productID: iphone.id,
        optionSetID: colorsOption.id,
        selectedValue: "Black",
      },
    });

    await prisma.productOptionSet.create({
      data: {
        productID: iphone.id,
        optionSetID: storageOption.id,
        selectedValue: "256GB",
      },
    });

    console.log(`✅ Created relationships`);

    console.log("🎉 Database seeded successfully!");

    // Print summary
    const counts = await Promise.all([
      prisma.brand.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.optionSet.count(),
      prisma.specGroup.count(),
      prisma.productOptionSet.count(),
    ]);

    console.log("\n📊 Seed Summary:");
    console.log(`   Brands: ${counts[0]}`);
    console.log(`   Categories: ${counts[1]}`);
    console.log(`   Products: ${counts[2]}`);
    console.log(`   Option Sets: ${counts[3]}`);
    console.log(`   Spec Groups: ${counts[4]}`);
    console.log(`   Product-Option Relations: ${counts[5]}`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
