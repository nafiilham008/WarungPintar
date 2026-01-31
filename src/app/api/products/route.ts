import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)

    // Pagination params
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit

    // Filter params
    const q = searchParams.get('q')
    const category = searchParams.get('category')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const minStock = searchParams.get('minStock')
    const maxStock = searchParams.get('maxStock')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc'

    // Base query conditions
    let where: Prisma.ProductWhereInput = {}

    if (category && category !== 'Semua') {
        where.kategori = category
    }

    if (minPrice || maxPrice) {
        where.harga = {
            ...(minPrice ? { gte: parseFloat(minPrice) } : {}),
            ...(maxPrice ? { lte: parseFloat(maxPrice) } : {}),
        }
    }

    if (minStock || maxStock) {
        where.stok = {
            ...(minStock ? { gte: parseInt(minStock) } : {}),
            ...(maxStock ? { lte: parseInt(maxStock) } : {}),
        }
    }

    // Search logic
    if (q) {
        where.OR = [
            { nama: { contains: q, mode: 'insensitive' } },
            { kategori: { contains: q, mode: 'insensitive' } },
            { lokasi: { contains: q, mode: 'insensitive' } }
        ]
    }

    try {
        // Fetch data and count in parallel
        const [products, total] = await Promise.all([
            prisma.product.findMany({
                where,
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit,
            }),
            prisma.product.count({ where })
        ])

        // Smart fallback logic only if no filters are active besides search
        if (products.length === 0 && q && !category && !minPrice && !maxPrice && !minStock && !maxStock) {
            const keywords = q.split(' ').filter(word => word.length > 2)
            if (keywords.length > 0) {
                const looseWhere: Prisma.ProductWhereInput = {
                    OR: keywords.flatMap(k => [
                        { nama: { contains: k, mode: 'insensitive' } },
                        { kategori: { contains: k, mode: 'insensitive' } }
                    ])
                }
                const [looseProducts, looseTotal] = await Promise.all([
                    prisma.product.findMany({
                        where: looseWhere,
                        orderBy: { [sortBy]: sortOrder },
                        skip,
                        take: limit,
                    }),
                    prisma.product.count({ where: looseWhere })
                ])

                return NextResponse.json({
                    products: looseProducts,
                    pagination: {
                        total: looseTotal,
                        page,
                        limit,
                        totalPages: Math.ceil(looseTotal / limit)
                    }
                })
            }
        }

        return NextResponse.json({
            products,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        })
    } catch (error) {
        console.error("API Error:", error)
        return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 })
    }
}
