'use client' // Note: This file should be 'use server' if strictly server actions, but usually imported in client. Let's make it 'use server'.
'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function deleteProduct(id: string) {
    try {
        await prisma.product.delete({
            where: { id }
        })
        revalidatePath('/dashboard/products')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Gagal menghapus barang' }
    }
}

export async function updateProduct(id: string, data: any) {
    try {
        await prisma.product.update({
            where: { id },
            data: {
                nama: data.nama,
                harga: parseFloat(data.harga),
                stok: parseInt(data.stok),
                kategori: data.kategori,
                satuan: data.satuan,
                gambar: data.gambar
            }
        })
        revalidatePath('/dashboard/products')
        revalidatePath('/')
        return { success: true }
    } catch (error) {
        console.error('Update error:', error)
        return { success: false, error: 'Gagal memperbarui barang' }
    }
}
