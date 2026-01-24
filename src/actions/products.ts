'use server'

import { z } from 'zod'
import { PrismaClient } from '@prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

const productSchema = z.object({
    nama: z.string().min(3, "Nama barang terlalu pendek"),
    harga: z.coerce.number().min(100, "Harga tidak valid"),
    kategori: z.string().optional(),
    lokasi: z.string().min(1, "Lokasi wajib diisi"),
    satuan: z.string().default("pcs"),
})

export async function addProductAction(prevState: any, formData: FormData) {
    // 1. Auth Check
    const session = (await cookies()).get('admin_session')
    if (!session) {
        return { error: "Akses ditolak. Silakan login kembali." }
    }

    // 2. Validation
    const data = Object.fromEntries(formData.entries())
    const parsed = productSchema.safeParse(data)

    if (!parsed.success) {
        return { error: parsed.error.issues[0].message }
    }

    const { nama, harga, kategori, lokasi, satuan } = parsed.data

    try {
        await prisma.product.create({
            data: {
                nama,
                harga,
                kategori,
                lokasi,
                satuan
            }
        })

        revalidatePath('/dashboard')
        revalidatePath('/') // Update public list too
    } catch (e) {
        console.error("Add Product Error:", e)
        return { error: "Gagal menyimpan barang ke database." }
    }

    redirect('/dashboard')
}
