import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Sample data for seeding
const sampleBrands = [
  { name: 'Apple', logoUrl: '/brands/apple.png' },
  { name: 'Samsung', logoUrl: '/brands/samsung.png' },
  { name: 'Sony', logoUrl: '/brands/sony.png' },
  { name: 'LG', logoUrl: '/brands/lg.png' },
  { name: 'Dell', logoUrl: '/brands/dell.png' },
  { name: 'HP', logoUrl: '/brands/hp.png' },
  { name: 'Lenovo', logoUrl: '/brands/lenovo.png' },
  { name: 'Nike', logoUrl: '/brands/nike.png' },
  { name: 'Adidas', logoUrl: '/brands/adidas.png' },
  { name: 'Canon', logoUrl: '/brands/canon.png' }
]

const sampleCategories = [
  {
    name: 'Electronics',
    url: 'electronics',
    iconUrl: '/categories/electronics.svg',
    iconSize: [24, 24]
  },
  {
    name: 'Smartphones',
    url: 'smartphones',
    iconUrl: '/categories/smartphones.svg',
    iconSize: [24, 24]
  },
  {
    name: 'Laptops',
    url: 'laptops',
    iconUrl: '/categories/laptops.svg',
    iconSize: [24, 24]
  },
  {
    name: 'Clothing',
    url: 'clothing',
    iconUrl: '/categories/clothing.svg',
    iconSize: [24, 24]
  },
  {
    name: 'Shoes',
    url: 'shoes',
    iconUrl: '/categories/shoes.svg',
    iconSize: [24, 24]
  },
  {
    name: 'Cameras',
    url: 'cameras',
    iconUrl: '/categories/cameras.svg',
    iconSize: [24, 24]
  }
]

const sampleOptionSets = [
  {
    name: 'Colors',
    type: 'COLOR' as const,
    options: [
      { name: 'Black', value: '#000000' },
      { name: 'White', value: '#FFFFFF' },
      { name: 'Blue', value: '#0066CC' },
      { name: 'Red', value: '#CC0000' },
      { name: 'Silver', value: '#C0C0C0' }
    ]
  },
  {
    name: 'Storage',
    type: 'TEXT' as const,
    options: [
      { name: '64GB', value: '64GB' },
      { name: '128GB', value: '128GB' },
      { name: '256GB', value: '256GB' },
      { name: '512GB', value: '512GB' },
      { name: '1TB', value: '1TB' }
    ]
  },
  {
    name: 'Size',
    type: 'TEXT' as const,
    options: [
      { name: 'Small', value: 'S' },
      { name: 'Medium', value: 'M' },
      { name: 'Large', value: 'L' },
      { name: 'Extra Large', value: 'XL' }
    ]
  }
]

const sampleSpecGroups = [
  {
    title: 'Technical Specifications',
    specs: ['Display', 'Processor', 'RAM', 'Storage', 'Battery', 'OS']
  },
  {
    title: 'Physical Specifications',
    specs: ['Dimensions', 'Weight', 'Material', 'Colors Available']
  },
  {
    title: 'Connectivity',
    specs: ['WiFi', 'Bluetooth', 'USB', 'Ports', '5G']
  }
]

// Generate sample products
function generateSampleProducts(brands: any[], categories: any[]) {
  const products = []
  
  const productTemplates = [
    {
      name: 'iPhone 15 Pro',
      desc: 'Latest iPhone with A17 Pro chip and titanium design',
      specialFeatures: ['A17 Pro Chip', 'Titanium Design', 'Pro Camera System'],
      images: ['/products/iphone15pro-1.jpg', '/products/iphone15pro-2.jpg'],
      price: 999.99,
      salePrice: 899.99,
      sku: 'IP15P-001'
    },
    {
      name: 'MacBook Pro 16"',
      desc: 'Powerful laptop for professionals with M3 chip',
      specialFeatures: ['M3 Chip', 'Liquid Retina XDR Display', '22-hour battery'],
      images: ['/products/macbook-pro-1.jpg', '/products/macbook-pro-2.jpg'],
      price: 2499.99,
      sku: 'MBP16-001'
    },
    {
      name: 'Samsung Galaxy S24',
      desc: 'AI-powered smartphone with advanced camera',
      specialFeatures: ['AI Photography', '120Hz Display', '5G Ready'],
      images: ['/products/galaxy-s24-1.jpg', '/products/galaxy-s24-2.jpg'],
      price: 799.99,
      salePrice: 749.99,
      sku: 'SGS24-001'
    },
    {
      name: 'Sony WH-1000XM5',
      desc: 'Industry-leading noise canceling headphones',
      specialFeatures: ['Noise Canceling', '30-hour Battery', 'Quick Charge'],
      images: ['/products/sony-headphones-1.jpg', '/products/sony-headphones-2.jpg'],
      price: 399.99,
      sku: 'SWH1000-001'
    },
    {
      name: 'Nike Air Max 270',
      desc: 'Comfortable running shoes with Max Air unit',
      specialFeatures: ['Max Air Unit', 'Lightweight', 'Breathable Mesh'],
      images: ['/products/nike-airmax-1.jpg', '/products/nike-airmax-2.jpg'],
      price: 149.99,
      salePrice: 129.99,
      sku: 'NAM270-001'
    }
  ]

  productTemplates.forEach((template, index) => {
    const brand = brands[index % brands.length]
    const category = categories[index % categories.length]
    
    products.push({
      ...template,
      brandID: brand.id,
      categoryID: category.id,
      stock: Math.floor(Math.random() * 100) + 10,
      specs: {
        technical: {
          brand: brand.name,
          model: template.name,
          warranty: '1 year'
        }
      },
      searchVector: `${template.name} ${template.desc} ${brand.name} ${category.name}`.toLowerCase()
    })
  })

  return products
}

async function main() {
  console.log('🌱 Starting database seed...')

  try {
    // Clear existing data
    console.log('🧹 Clearing existing data...')
    await prisma.searchLog.deleteMany()
    await prisma.pageVisit.deleteMany()
    await prisma.product.deleteMany()
    await prisma.category_OptionSet.deleteMany()
    await prisma.category_SpecGroup.deleteMany()
    await prisma.optionSet.deleteMany()
    await prisma.specGroup.deleteMany()
    await prisma.category.deleteMany()
    await prisma.brand.deleteMany()

    // Seed brands
    console.log('📦 Seeding brands...')
    const brands = await Promise.all(
      sampleBrands.map(brand =>
        prisma.brand.create({ data: brand })
      )
    )
    console.log(`✅ Created ${brands.length} brands`)

    // Seed categories
    console.log('📂 Seeding categories...')
    const categories = await Promise.all(
      sampleCategories.map(category =>
        prisma.category.create({ data: category })
      )
    )
    console.log(`✅ Created ${categories.length} categories`)

    // Seed option sets
    console.log('⚙️ Seeding option sets...')
    const optionSets = await Promise.all(
      sampleOptionSets.map(optionSet =>
        prisma.optionSet.create({ data: optionSet })
      )
    )
    console.log(`✅ Created ${optionSets.length} option sets`)

    // Seed spec groups
    console.log('📋 Seeding spec groups...')
    const specGroups = await Promise.all(
      sampleSpecGroups.map(specGroup =>
        prisma.specGroup.create({ data: specGroup })
      )
    )
    console.log(`✅ Created ${specGroups.length} spec groups`)

    // Seed products
    console.log('🛍️ Seeding products...')
    const productsData = generateSampleProducts(brands, categories)
    const products = await Promise.all(
      productsData.map(product =>
        prisma.product.create({ data: product })
      )
    )
    console.log(`✅ Created ${products.length} products`)

    // Create some category-option relationships
    console.log('🔗 Creating category relationships...')
    await Promise.all([
      prisma.category_OptionSet.create({
        data: {
          categoryID: categories[0].id, // Electronics
          optionID: optionSets[0].id    // Colors
        }
      }),
      prisma.category_OptionSet.create({
        data: {
          categoryID: categories[1].id, // Smartphones
          optionID: optionSets[1].id    // Storage
        }
      }),
      prisma.category_SpecGroup.create({
        data: {
          categoryID: categories[0].id, // Electronics
          specGroupID: specGroups[0].id // Technical Specifications
        }
      })
    ])

    console.log('🎉 Database seeded successfully!')
    
    // Print summary
    const counts = await Promise.all([
      prisma.brand.count(),
      prisma.category.count(),
      prisma.product.count(),
      prisma.optionSet.count(),
      prisma.specGroup.count()
    ])
    
    console.log('\n📊 Seed Summary:')
    console.log(`   Brands: ${counts[0]}`)
    console.log(`   Categories: ${counts[1]}`)
    console.log(`   Products: ${counts[2]}`)
    console.log(`   Option Sets: ${counts[3]}`)
    console.log(`   Spec Groups: ${counts[4]}`)

  } catch (error) {
    console.error('❌ Error seeding database:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })