import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { z } from 'zod'

const BulkBrandSchema = z.object({
  brands: z.array(z.object({
    name: z.string().min(1),
    logoUrl: z.string().optional()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = BulkBrandSchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { brands } = validation.data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const brandData of brands) {
      try {
        // Check if brand already exists
        const existingBrand = await db.brand.findUnique({
          where: { name: brandData.name }
        })

        if (existingBrand) {
          results.errors.push(`Brand "${brandData.name}" already exists`)
          results.failed++
          continue
        }

        await db.brand.create({
          data: {
            name: brandData.name,
            logoUrl: brandData.logoUrl
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Failed to create brand "${brandData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      message: 'Bulk brand import completed',
      results
    })

  } catch (error) {
    console.error('Bulk brand import error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const includeProductCount = searchParams.get('includeProductCount') === 'true'

    const brands = await db.brand.findMany({
      include: {
        ...(includeProductCount && {
          _count: {
            select: {
              products: {
                where: { isAvailable: true }
              }
            }
          }
        })
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ brands })

  } catch (error) {
    console.error('Brands fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}