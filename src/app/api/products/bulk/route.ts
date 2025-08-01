import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { z } from 'zod'

// Validation schema for bulk product import
const BulkProductSchema = z.object({
  products: z.array(z.object({
    name: z.string().min(1),
    desc: z.string().optional(),
    specialFeatures: z.array(z.string()).default([]),
    images: z.array(z.string()).default([]),
    price: z.number().positive(),
    salePrice: z.number().positive().optional(),
    sku: z.string().optional(),
    stock: z.number().int().min(0).default(0),
    brandName: z.string().min(1),
    categoryName: z.string().min(1),
    specs: z.record(z.any()).optional(),
    isAvailable: z.boolean().default(true)
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = BulkProductSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { products } = validation.data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    // Process each product
    for (const productData of products) {
      try {
        // Find or create brand
        let brand = await db.brand.findUnique({
          where: { name: productData.brandName }
        })

        if (!brand) {
          brand = await db.brand.create({
            data: { name: productData.brandName }
          })
        }

        // Find or create category
        let category = await db.category.findFirst({
          where: { name: productData.categoryName }
        })

        if (!category) {
          category = await db.category.create({
            data: {
              name: productData.categoryName,
              url: productData.categoryName.toLowerCase().replace(/\s+/g, '-')
            }
          })
        }

        // Create search vector for full-text search
        const searchVector = [
          productData.name,
          productData.desc || '',
          productData.brandName,
          productData.categoryName,
          ...productData.specialFeatures
        ].join(' ').toLowerCase()

        // Create product
        await db.product.create({
          data: {
            name: productData.name,
            desc: productData.desc,
            specialFeatures: productData.specialFeatures,
            images: productData.images,
            price: productData.price,
            salePrice: productData.salePrice,
            sku: productData.sku,
            stock: productData.stock,
            brandID: brand.id,
            categoryID: category.id,
            specs: productData.specs,
            isAvailable: productData.isAvailable,
            searchVector,
            optionSets: [] // Will be populated separately if needed
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Failed to create product "${productData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      message: 'Bulk import completed',
      results
    }, { status: 200 })

  } catch (error) {
    console.error('Bulk import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}