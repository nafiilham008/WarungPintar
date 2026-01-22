import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
    // Ambil semua kategori unik
    const categories = await prisma.product.groupBy({
        by: ['kategori'],
        _count: {
            id: true
        },
        orderBy: {
            _count: {
                id: 'desc'
            }
        }
    })

    // Format hasil biar enak dibaca frontend
    const formatted = categories
        .map((c: any) => ({
            name: c.kategori || 'Lainnya',
            count: c._count.id
        }))
        .filter((c: any) => c.name !== 'Lainnya') // Filter optional

    return NextResponse.json(formatted)
}
