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

        // 1. Identifikasi Gambar dengan Gemini Flash (Cepat & Hemat)
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ]
        })

        // Hapus prefix data:image/jpeg;base64, jika ada
        const base64Data = image.split(',')[1] || image

        // 2. Prompt Pintar dengan Output JSON
        const prompt = `
        Analyze this image of a product sold in an Indonesian "Warung".
        Identify the **Brand** and **Product Name**.
        Also, suggest 2-3 **competitor brands** or similar alternatives commonly sold in warungs.
        
        Strictly output valid JSON format ONLY:
        {
            "name": "Visible Brand & Product Name",
            "category": "Generic Category (e.g. Kopi, Sabun, Mie Instan)",
            "alternatives": ["Competitor Brand 1", "Competitor Brand 2"]
        }
        
        If the image is unclear/unknown, guess the category and suggest generic brands.
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

        // Bersihkan markdown json block jika ada
        text = text.replace(/```json/g, '').replace(/```/g, '').trim()

        console.log("Gemini JSON:", text)

        let aiResult;
        try {
            aiResult = JSON.parse(text)
        } catch (e) {
            // Fallback jika gagal parse JSON (jarang terjadi di Flash)
            console.error("JSON Parse Error", e)
            aiResult = { name: text, alternatives: [] }
        }

        const searchTerm = aiResult.name || ""
        const alternatives = aiResult.alternatives || []

        // 3. Search Utama
        const mainProducts = await prisma.product.findMany({
            where: {
                nama: { contains: searchTerm, mode: 'insensitive' }
            },
            take: 3
        })

        // 4. Search Alternatif (Jika hasil utama sedikit)
        let altProducts: any[] = []
        if (mainProducts.length < 3 && alternatives.length > 0) {
            const altConditions = alternatives.map((alt: string) => ({
                nama: { contains: alt, mode: 'insensitive' }
            }))

            altProducts = await prisma.product.findMany({
                where: {
                    OR: altConditions,
                    NOT: { nama: { contains: searchTerm, mode: 'insensitive' } } // Jangan duplikat
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


    } catch (error) {
        console.error('AI Scan Error:', error)
        return NextResponse.json({ error: 'Gagal memproses AI' }, { status: 500 })
    }
}
