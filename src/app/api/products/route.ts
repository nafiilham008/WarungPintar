import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q) {
        return NextResponse.json([])
    }

    // Pencarian Cerdas dengan "Insensitive Case"
    const products = await prisma.product.findMany({
        where: {
            OR: [
                { nama: { contains: q, mode: 'insensitive' } },
                { kategori: { contains: q, mode: 'insensitive' } },
                { detail: { contains: q, mode: 'insensitive' } }
            ]
        },
        take: 20 // Limit hasil agar cepat
    })

    return NextResponse.json(products)
}
