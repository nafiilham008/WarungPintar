'use client'

import { useActionState } from 'react'
import { CategoryCombobox } from "@/components/features/CategoryCombobox"
import { useFormStatus } from 'react-dom'
import { addProductAction } from '@/actions/products'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={pending}>
            {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Save className="mr-2 h-4 w-4" /> Simpan Barang</>}
        </Button>
    )
}

export function AddProductForm() {
    const [state, action] = useActionState(addProductAction, null)

    return (
        <Card className="max-w-xl border-0 shadow-sm">
            <CardHeader>
                <div className="flex items-center gap-4 mb-2">
                    <Link href="/dashboard" className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </Link>
                    <CardTitle>Input Barang Baru</CardTitle>
                </div>
            </CardHeader>
            <CardContent>
                <form action={action} className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="nama">Nama Barang</Label>
                        <Input id="nama" name="nama" placeholder="Contoh: Indomie Goreng" required className="bg-slate-50 border-slate-200" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="harga">Harga (Rp)</Label>
                            <Input id="harga" name="harga" type="number" placeholder="3500" required className="bg-slate-50 border-slate-200" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="satuan">Satuan</Label>
                            <Input id="satuan" name="satuan" placeholder="pcs" defaultValue="pcs" className="bg-slate-50 border-slate-200" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="kategori">Kategori</Label>
                        <CategoryCombobox name="kategori" />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="lokasi">Lokasi Rak / Etalase</Label>
                        <Input id="lokasi" name="lokasi" placeholder="Rak Depan Kanan" required className="bg-slate-50 border-slate-200" />
                    </div>

                    {state?.error && (
                        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 text-center font-medium animate-in fade-in">
                            {state.error}
                        </div>
                    )}

                    <div className="pt-4">
                        <SubmitButton />
                    </div>
                </form>
            </CardContent>
        </Card>
    )
}
