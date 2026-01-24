'use server'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getCategoriesAction() {
    try {
        const categories = await prisma.product.findMany({
            select: {
                kategori: true
            },
            where: {
                kategori: {
                    not: null
                }
            },
            distinct: ['kategori']
        })

        // Filter out nulls/empties, normalize case to Title Case, and remove duplicates
        const rawCategories = categories
            .map(c => c.kategori)
            .filter((c): c is string => !!c && c.trim() !== '')

        // Helper for Title Case with stronger normalization
        const toTitleCase = (str: string) => {
            // Replace hyphens with spaces, remove extra spaces
            const cleanStr = str.replace(/[-]/g, ' ').replace(/\s+/g, ' ').trim();
            return cleanStr.replace(
                /\w\S*/g,
                (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
            );
        }

        const normalized = Array.from(new Set(rawCategories.map(c => toTitleCase(c))))
        return normalized.sort()
    } catch (error) {
        console.error("Failed to fetch categories:", error)
        return []
    }
}
