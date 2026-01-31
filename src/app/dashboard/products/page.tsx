'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Search, Edit, Trash2, Loader2, PackageSearch } from 'lucide-react'
import { deleteProduct } from '@/actions/products'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/products?q=${encodeURIComponent(search)}`)
            const data = await res.json()
            setProducts(data)
        } catch (error) {
            toast.error("Gagal memuat barang")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 400)
        return () => clearTimeout(timer)
    }, [search])

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`Hapus "${name}"?`)) return

        setDeletingId(id)
        const res = await deleteProduct(id)
        if (res.success) {
            toast.success("Barang dihapus")
            setProducts(products.filter(p => p.id !== id))
        } else {
            toast.error(res.error || "Gagal menghapus")
        }
        setDeletingId(null)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daftar Barang</h1>
                    <p className="text-slate-500">Kelola stok dan harga warung Anda.</p>
                </div>
                <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                    <Link href="/dashboard/products/add">Tambah Barang</Link>
                </Button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama barang..."
                        className="pl-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="rounded-md border border-slate-100 overflow-hidden">
                    <Table>
                        <TableHeader className="bg-slate-50">
                            <TableRow>
                                <TableHead className="w-[300px]">Barang</TableHead>
                                <TableHead>Kategori</TableHead>
                                <TableHead>Harga</TableHead>
                                <TableHead>Stok</TableHead>
                                <TableHead className="text-right">Aksi</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <Loader2 className="w-8 h-8 animate-spin" />
                                            <span>Memuat data...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : products.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-48 text-center">
                                        <div className="flex flex-col items-center gap-2 text-slate-400">
                                            <PackageSearch className="w-12 h-12 opacity-20" />
                                            <span>Barang tidak ditemukan.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                products.map((product) => (
                                    <TableRow key={product.id} className="hover:bg-slate-50/50 transition-colors">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {product.gambar ? (
                                                    <img src={product.gambar} className="w-10 h-10 rounded-lg object-cover" />
                                                ) : (
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                        <PackageSearch className="w-5 h-5" />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="font-bold text-slate-700">{product.nama}</div>
                                                    <div className="text-[10px] text-slate-400 uppercase tracking-wider">{product.satuan}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                {product.kategori}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-medium text-slate-700">
                                            {formatRupiah(product.harga)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <span className={`w-2 h-2 rounded-full ${product.stok > 10 ? 'bg-emerald-500' : product.stok > 0 ? 'bg-amber-500' : 'bg-red-500'}`} />
                                                <span className="font-bold text-slate-700">{product.stok}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="icon" asChild className="text-slate-500 hover:text-emerald-600">
                                                    <Link href={`/dashboard/products/${product.id}`}>
                                                        <Edit className="w-4 h-4" />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-slate-500 hover:text-red-600"
                                                    disabled={deletingId === product.id}
                                                    onClick={() => handleDelete(product.id, product.nama)}
                                                >
                                                    {deletingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    )
}
