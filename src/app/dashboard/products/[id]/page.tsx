import { prisma } from '@/lib/prisma'
import { EditProductForm } from "@/components/features/EditProductForm"
import { notFound } from 'next/navigation'

export default async function EditProductPage({ params }: { params: { id: string } }) {
    const { id } = await params

    const product = await prisma.product.findUnique({
        where: { id }
    })

    if (!product) {
        notFound()
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800">Edit Detail Barang</h2>
                <p className="text-slate-500">Sesuaikan informasi barang di database.</p>
            </div>
            <EditProductForm product={product} />
        </div>
    )
}
