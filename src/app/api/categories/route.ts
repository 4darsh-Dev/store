import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/shared/lib/db'
import { z } from 'zod'

const BulkCategorySchema = z.object({
  categories: z.array(z.object({
    name: z.string().min(1),
    url: z.string().optional(),
    iconUrl: z.string().optional(),
    iconSize: z.array(z.number()).default([24, 24]),
    parentID: z.string().optional()
  }))
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validation = BulkCategorySchema.safeParse(body)

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Invalid data format', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { categories } = validation.data
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[]
    }

    for (const categoryData of categories) {
      try {
        // Generate URL if not provided
        const url = categoryData.url || categoryData.name.toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '')

        // Check if category already exists
        const existingCategory = await db.category.findFirst({
          where: {
            OR: [
              { name: categoryData.name },
              { url: url }
            ]
          }
        })

        if (existingCategory) {
          results.errors.push(`Category "${categoryData.name}" already exists`)
          results.failed++
          continue
        }

        await db.category.create({
          data: {
            name: categoryData.name,
            url: url,
            iconUrl: categoryData.iconUrl,
            iconSize: categoryData.iconSize,
            parentID: categoryData.parentID
          }
        })

        results.success++
      } catch (error) {
        results.failed++
        results.errors.push(
          `Failed to create category "${categoryData.name}": ${error instanceof Error ? error.message : 'Unknown error'}`
        )
      }
    }

    return NextResponse.json({
      message: 'Bulk category import completed',
      results
    })

  } catch (error) {
    console.error('Bulk category import error:', error)
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

    const categories = await db.category.findMany({
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
      orderBy: [
        { parentID: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ categories })

  } catch (error) {
    console.error('Categories fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}