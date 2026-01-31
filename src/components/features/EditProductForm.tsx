'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { CategoryCombobox } from "@/components/features/CategoryCombobox"
import { updateProduct } from '@/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface EditProductFormProps {
    product: any
}

export function EditProductForm({ product }: EditProductFormProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        const formData = new FormData(e.currentTarget)
        const data = Object.fromEntries(formData.entries())

        startTransition(async () => {
            const res = await updateProduct(product.id, data)
            if (res.success) {
                toast.success("Barang diperbarui")
                router.push('/dashboard/products')
                router.refresh()
            } else {
                toast.error(res.error || "Gagal menyimpan perubahan")
            }
        })
    }

    return (
        <Card className="max-w-xl border-0 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard/products" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <CardTitle>Edit Barang: {product.nama}</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama">Nama Barang</Label>
                        <Input id="nama" name="nama" defaultValue={product.nama} required className="bg-slate-50 border-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="harga">Harga (Rp)</Label>
                            <Input id="harga" name="harga" type="number" defaultValue={product.harga} required className="bg-slate-50 border-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="satuan">Satuan</Label>
                            <Input id="satuan" name="satuan" defaultValue={product.satuan} className="bg-slate-50 border-slate-200" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <CategoryCombobox name="kategori" defaultValue={product.kategori} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="stok">Stok Saat Ini</Label>
                            <Input id="stok" name="stok" type="number" defaultValue={product.stok} required className="bg-slate-50 border-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lokasi">Lokasi</Label>
                            <Input id="lokasi" name="lokasi" defaultValue={product.lokasi} placeholder="Rak A1" className="bg-slate-50 border-slate-200" />
                        </div>
                    </div>

                    <div className="pt-4">
                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isPending} type="submit">
                            {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan Perubahan</>}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
