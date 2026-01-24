import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai'

const prisma = new PrismaClient()

// Initialize Gemini
// Pastikan GEMINI_API_KEY ada di .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(request: Request) {
    try {
        const { image } = await request.json()

        if (!image) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 })
        }

        if (!process.env.GEMINI_API_KEY) {
            return NextResponse.json({ error: 'API Key Gemini belum disetting di .env' }, { status: 500 })
        }

        // 1. Identifikasi Gambar: Gunakan Gemini 2.5 Flash Lite (Versi Stabil 2026)
        // Note: Versi 1.5 (404) dan 2.0 (Limit 0) bermasalah. Kita pakai 2.5 Lite.
        const model = genAI.getGenerativeModel({
            model: "gemini-2.5-flash-lite",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        })

        // Hapus prefix data:image/jpeg;base64, jika ada
        const base64Data = image.split(',')[1] || image

        // 2. Prompt Pintar dengan Output JSON + Keywords Bahasa Indonesia
        const prompt = `
        Analyze this image of a product sold in an Indonesian "Warung".
        Identify the **Brand** and **Product Name**.
        
        Important: The database might use different naming conventions (e.g. "Kopi Top" instead of "Top Coffee").
        Provide a list of **search keywords** in Indonesian that would best match this product in a database.
        
        Strictly output valid JSON format ONLY:
        {
            "name": "Visible Brand & Product Name",
            "searchKeywords": ["keyword1", "keyword2", "keyword3"],
            "alternatives": ["Competitor Brand 1", "Competitor Brand 2"]
        }
        
        Example: If image is "Top Coffee Cappuccino", return searchKeywords: ["top", "kopi", "cappuccino"].
        If image is "Sajiku Golden Crispy", return searchKeywords: ["sajiku", "tepung", "bumbu"].
        Do not acknowledge or apologize. JSON only.
        `

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Data,
                    mimeType: "image/jpeg",
                },
            },
        ])

        const response = await result.response
        let text = response.text()
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()
        console.log("Gemini JSON:", text)

        let aiResult;
        try {
            aiResult = JSON.parse(text)
        } catch (e) {
            console.error("JSON Parse Error", e)
            aiResult = { name: text, searchKeywords: [], alternatives: [] }
        }

        const searchTerm: string = aiResult.name || ""
        const aiKeywords: string[] = aiResult.searchKeywords || []
        const alternatives: string[] = aiResult.alternatives || []

        // 3. Search Utama Hybrid
        // Prioritas 1: Exact/Phrase Match dari Nama Asli
        let mainProducts = await prisma.product.findMany({
            where: {
                nama: { contains: searchTerm, mode: 'insensitive' as const }
            },
            take: 3
        })

        // Prioritas 2: Fallback ke Loose Search (AI Keywords + Split Manual)
        // Gabungkan keyword dari AI ("kopi", "top") + keyword dari nama asli ("top", "coffee", "cappuccino")
        if (mainProducts.length === 0) {
            const manualKeywords = searchTerm.split(' ').filter(k => k.length > 2)

            // Gabungkan dan hilangkan duplikat
            const allKeywords = [...new Set([...aiKeywords, ...manualKeywords])]

            if (allKeywords.length > 0) {
                console.log("Strict match failed. Trying loose match with keywords:", allKeywords)
                mainProducts = await prisma.product.findMany({
                    where: {
                        OR: allKeywords.flatMap((k: string) => [
                            { nama: { contains: k, mode: 'insensitive' as const } },
                            { kategori: { contains: k, mode: 'insensitive' as const } }
                        ])
                    },
                    take: 5
                })

                // 3. Extreme Fallback: Substring Match (Untuk merged words)
                // Misal AI/User: "freshcare" -> DB: "fresh care". Cari "fres" nya aja.
                if (mainProducts.length === 0) {
                    const subKeywords = allKeywords.filter(k => k.length >= 4).map(k => k.substring(0, 4))
                    if (subKeywords.length > 0) {
                        console.log("Loose match failed. Trying substring:", subKeywords)
                        mainProducts = await prisma.product.findMany({
                            where: {
                                OR: subKeywords.flatMap(k => [
                                    { nama: { contains: k, mode: 'insensitive' as const } },
                                    { kategori: { contains: k, mode: 'insensitive' as const } }
                                ])
                            },
                            take: 5
                        })
                    }
                }
            }
        }

        // 4. Search Alternatif (Jika hasil utama sedikit)
        let altProducts: any[] = []
        if (mainProducts.length < 3 && alternatives.length > 0) {
            const altConditions = alternatives.map((alt: string) => ({
                nama: { contains: alt, mode: 'insensitive' as const }
            }))

            altProducts = await prisma.product.findMany({
                where: {
                    OR: altConditions,
                    NOT: { nama: { contains: searchTerm, mode: 'insensitive' as const } } // Jangan duplikat
                },
                take: 3
            })
        }

        return NextResponse.json({
            identifiedName: searchTerm,
            alternatives: alternatives,
            products: mainProducts,
            recommendations: altProducts
        })


    } catch (error: any) {
        console.error('AI Scan Error:', error)
        const msg = error?.message || "Unknown Server Error"
        return NextResponse.json({ error: `Gagal memproses AI: ${msg}` }, { status: 500 })
    }
}
