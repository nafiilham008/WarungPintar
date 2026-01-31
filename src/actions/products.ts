'use server'

import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function addProductAction(prevState: any, formData: FormData) {
    const nama = formData.get('nama') as string
    const harga = parseFloat(formData.get('harga') as string)
    const satuan = formData.get('satuan') as string
    const kategori = formData.get('kategori') as string
    const lokasi = formData.get('lokasi') as string

    if (!nama || isNaN(harga)) {
        return { error: 'Nama dan harga wajib diisi' }
    }

    try {
        await prisma.product.create({
            data: {
                nama,
                harga,
                satuan: satuan || null,
                kategori: kategori || null,
                lokasi: lokasi || '',
                stok: 0,
            }
        })
    } catch (error) {
        console.error('Create error:', error)
        return { error: 'Gagal menambahkan barang' }
    }

    revalidatePath('/')
    revalidatePath('/dashboard/products')
    redirect('/dashboard/products')
}

export async function deleteProduct(id: string | number) {
    try {
        await prisma.product.delete({
            where: { id: Number(id) }
        })
        revalidatePath('/')
        revalidatePath('/dashboard/products')
        return { success: true }
    } catch (error) {
        console.error('Delete error:', error)
        return { success: false, error: 'Gagal menghapus barang' }
    }
}

export async function updateProduct(id: string | number, data: any) {
    try {
        const updateData: any = {
            nama: String(data.nama),
            harga: Number(data.harga),
            stok: Number(data.stok),
            lokasi: String(data.lokasi),
        }

        if (data.kategori) updateData.kategori = String(data.kategori);
        else updateData.kategori = null;

        if (data.satuan) updateData.satuan = String(data.satuan);
        else updateData.satuan = null;


        await prisma.product.update({
            where: { id: Number(id) },
            data: updateData
        })
        revalidatePath('/')
        revalidatePath('/dashboard/products')
        return { success: true }
    } catch (error) {
        console.error('Update error:', error)
        return { success: false, error: 'Gagal memperbarui barang' }
    }
}
