import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const q = searchParams.get('q')

    if (!q) {
        const allProducts = await prisma.product.findMany({
            orderBy: { createdAt: 'desc' },
            take: 100
        })
        return NextResponse.json(allProducts)
    }

    // 1. Search Utama (Prioritas 1: Exact/Phrase Match)
    let products = await prisma.product.findMany({
        where: {
            OR: [
                { nama: { contains: q, mode: 'insensitive' as const } },
                { kategori: { contains: q, mode: 'insensitive' as const } }
            ]
        },
        take: 20
    })

    // 2. Fallback Loose Search (Jika hasil kosong)
    // Misal user ketik "Aquviva air mineral enak banget", tapi di DB cuma "Aquviva"
    if (products.length === 0) {
        // Pecah kalimat jadi kata-kata, buang kata pendek
        const keywords = q.split(' ').filter(word => word.length > 2)

        if (keywords.length > 0) {
            console.log("Strict search failed for:", q, ". Trying loose search with:", keywords)

            products = await prisma.product.findMany({
                where: {
                    OR: keywords.flatMap(k => [
                        { nama: { contains: k, mode: 'insensitive' as const } },
                        { kategori: { contains: k, mode: 'insensitive' as const } }
                    ])
                },
                take: 20
            })

            // 3. Extreme Fallback: Substring/Typo Tolerance (Jika masih kosong)
            // Misal: "freshcare" (DB: "Fresh Care"). Kita cari "fres" nya saja.
            if (products.length === 0) {
                const subKeywords = keywords.filter(k => k.length >= 4).map(k => k.substring(0, 4))

                if (subKeywords.length > 0) {
                    console.log("Loose search failed. Trying substring match:", subKeywords)
                    products = await prisma.product.findMany({
                        where: {
                            OR: subKeywords.flatMap(k => [
                                { nama: { contains: k, mode: 'insensitive' as const } },
                                { kategori: { contains: k, mode: 'insensitive' as const } }
                            ])
                        },
                        take: 20
                    })
                }
            }
        }
    }

    return NextResponse.json(products)
}
