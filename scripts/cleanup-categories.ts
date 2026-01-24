
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Helper same as frontend
const toTitleCase = (str: string) => {
    // Replace hyphens with spaces, remove extra spaces
    const cleanStr = str.replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
    return cleanStr.replace(
        /\w\S*/g,
        (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
}

async function main() {
    console.log("Starting category cleanup...")

    const products = await prisma.product.findMany({
        where: {
            kategori: {
                not: null
            }
        }
    })

    console.log(`Analyzing ${products.length} products...`)

    let updatedCount = 0
    const changes = new Map<string, string>()

    for (const product of products) {
        if (!product.kategori) continue

        const original = product.kategori
        const normalized = toTitleCase(original)

        if (original !== normalized) {
            await prisma.product.update({
                where: { id: product.id },
                data: { kategori: normalized }
            })

            if (!changes.has(original)) {
                changes.set(original, normalized)
            }
            updatedCount++
        }
    }

    console.log("\nCleanup Complete! 🎉")
    console.log(`Total Updated: ${updatedCount}`)

    if (changes.size > 0) {
        console.log("\nChanges Summary:")
        changes.forEach((to, from) => {
            console.log(`"${from}" -> "${to}"`)
        })
    } else {
        console.log("No changes needed. Database is already clean.")
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
