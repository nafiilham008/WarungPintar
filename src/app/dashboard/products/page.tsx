'use client'

import { useState, useEffect, useCallback } from 'react'
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
import {
    Search,
    Edit,
    Trash2,
    Loader2,
    PackageSearch,
    ChevronLeft,
    ChevronRight,
    Filter,
    X,
    ArrowUpDown,
    ArrowUp,
    ArrowDown
} from 'lucide-react'
import { deleteProduct } from '@/actions/products'
import { toast } from 'sonner'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { getCategoriesAction } from '@/actions/categories'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function ProductsPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [deletingId, setDeletingId] = useState<string | number | null>(null)
    const [productToDelete, setProductToDelete] = useState<{ id: string | number, name: string } | null>(null)
    const [mounted, setMounted] = useState(false)

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalItems, setTotalItems] = useState(0)
    const [limit, setLimit] = useState(10)

    // Filter State
    const [showFilters, setShowFilters] = useState(false)
    const [categories, setCategories] = useState<string[]>([])
    const [filters, setFilters] = useState({
        category: 'Semua',
        minPrice: '',
        maxPrice: '',
        minStock: '',
        maxStock: ''
    })

    // Sorting State
    const [sortBy, setSortBy] = useState('createdAt')
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                q: search,
                page: currentPage.toString(),
                limit: limit.toString(),
                category: filters.category,
                minPrice: filters.minPrice,
                maxPrice: filters.maxPrice,
                minStock: filters.minStock,
                maxStock: filters.maxStock,
                sortBy,
                sortOrder
            })

            const res = await fetch(`/api/products?${params.toString()}`)
            const data = await res.json()

            if (data.products) {
                setProducts(data.products)
                setTotalPages(data.pagination.totalPages)
                setTotalItems(data.pagination.total)
            }
        } catch (error) {
            toast.error("Gagal memuat barang")
        } finally {
            setLoading(false)
        }
    }, [search, currentPage, filters, sortBy, sortOrder, limit])

    useEffect(() => {
        setMounted(true)
        getCategoriesAction().then(setCategories)
    }, [])

    useEffect(() => {
        if (!mounted) return
        const timer = setTimeout(fetchProducts, 400)
        return () => clearTimeout(timer)
    }, [fetchProducts, mounted])

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1)
    }, [search, filters])

    const handleDelete = async () => {
        if (!productToDelete) return

        const { id } = productToDelete
        setDeletingId(id)
        const res = await deleteProduct(id)
        if (res.success) {
            toast.success("Barang dihapus")
            fetchProducts() // Refresh to sync with pagination
        } else {
            toast.error(res.error || "Gagal menghapus")
        }
        setDeletingId(null)
        setProductToDelete(null)
    }

    const clearFilters = () => {
        setFilters({
            category: 'Semua',
            minPrice: '',
            maxPrice: '',
            minStock: '',
            maxStock: ''
        })
        setSearch('')
    }

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
        } else {
            setSortBy(column)
            setSortOrder('asc')
        }
    }

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown className="ml-2 w-3 h-3 opacity-30" />
        return sortOrder === 'asc' ? <ArrowUp className="ml-2 w-3 h-3 text-emerald-600" /> : <ArrowDown className="ml-2 w-3 h-3 text-emerald-600" />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">Daftar Barang</h1>
                    <p className="text-slate-500">Kelola stok dan harga warung Anda.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={cn(showFilters && "bg-slate-100")}
                    >
                        <Filter className="w-4 h-4 mr-2" />
                        Filter
                    </Button>
                    <Button asChild className="bg-emerald-600 hover:bg-emerald-700">
                        <Link href="/dashboard/products/add">Tambah Barang</Link>
                    </Button>
                </div>
            </div>

            {showFilters && (
                <Card className="p-4 border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-2">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label>Kategori</Label>
                            <Select
                                value={filters.category}
                                onValueChange={(v) => setFilters(f => ({ ...f, category: v }))}
                            >
                                <SelectTrigger className="bg-slate-50">
                                    <SelectValue placeholder="Semua Kategori" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Semua">Semua Kategori</SelectItem>
                                    {categories.map(cat => (
                                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Harga (Min - Max)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="bg-slate-50"
                                    value={filters.minPrice}
                                    onChange={(e) => setFilters(f => ({ ...f, minPrice: e.target.value }))}
                                />
                                <span>-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="bg-slate-50"
                                    value={filters.maxPrice}
                                    onChange={(e) => setFilters(f => ({ ...f, maxPrice: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Stok (Min - Max)</Label>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="number"
                                    placeholder="Min"
                                    className="bg-slate-50"
                                    value={filters.minStock}
                                    onChange={(e) => setFilters(f => ({ ...f, minStock: e.target.value }))}
                                />
                                <span>-</span>
                                <Input
                                    type="number"
                                    placeholder="Max"
                                    className="bg-slate-50"
                                    value={filters.maxStock}
                                    onChange={(e) => setFilters(f => ({ ...f, maxStock: e.target.value }))}
                                />
                            </div>
                        </div>
                        <div className="flex items-end">
                            <Button variant="ghost" className="text-slate-500 w-full" onClick={clearFilters}>
                                <X className="w-4 h-4 mr-2" />
                                Reset Filter
                            </Button>
                        </div>
                    </div>
                </Card>
            )}

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
                <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Cari nama barang..."
                        className="pl-10 h-10"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="rounded-md border border-slate-100 overflow-hidden max-w-[calc(100vw-2rem)] md:max-w-full">
                    <div className="overflow-x-auto">
                        <Table className="min-w-[800px]">
                            <TableHeader className="bg-slate-50">
                                <TableRow>
                                    <TableHead
                                        className="w-[300px] cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort('nama')}
                                    >
                                        <div className="flex items-center">
                                            Barang
                                            <SortIcon column="nama" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort('kategori')}
                                    >
                                        <div className="flex items-center">
                                            Kategori
                                            <SortIcon column="kategori" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort('harga')}
                                    >
                                        <div className="flex items-center">
                                            Harga
                                            <SortIcon column="harga" />
                                        </div>
                                    </TableHead>
                                    <TableHead
                                        className="cursor-pointer hover:text-emerald-600 transition-colors"
                                        onClick={() => handleSort('stok')}
                                    >
                                        <div className="flex items-center">
                                            Stok
                                            <SortIcon column="stok" />
                                        </div>
                                    </TableHead>
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
                                                    <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                        <PackageSearch className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700">{product.nama}</div>
                                                        <div className="text-[10px] text-slate-400 uppercase tracking-wider">{product.satuan || 'Pcs'}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                                                    {product.kategori || 'Tanpa Kategori'}
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
                                                        onClick={() => setProductToDelete({ id: product.id, name: product.nama })}
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

                {/* Pagination Control */}
                {!loading && totalItems > 0 && (
                    <div className="mt-6 flex flex-col gap-4 border-t border-slate-100 pt-4">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500 text-center sm:text-left">
                            <span>
                                Menampilkan <span className="font-medium text-slate-700">{products.length}</span> dari <span className="font-medium text-slate-700">{totalItems}</span> barang.
                            </span>
                            <div className="flex items-center gap-2">
                                <span>Baris per halaman:</span>
                                <Select
                                    value={limit.toString()}
                                    onValueChange={(v) => {
                                        setLimit(Number(v))
                                        setCurrentPage(1) // Reset to page 1 when limit changes
                                    }}
                                >
                                    <SelectTrigger className="h-8 w-[70px]">
                                        <SelectValue placeholder={limit.toString()} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="5">5</SelectItem>
                                        <SelectItem value="10">10</SelectItem>
                                        <SelectItem value="25">25</SelectItem>
                                        <SelectItem value="50">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="flex items-center justify-center sm:justify-end gap-2 w-full">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" />
                                Sebelumnya
                            </Button>

                            <div className="flex items-center gap-1 overflow-x-auto max-w-[200px] sm:max-w-none">
                                {[...Array(totalPages)].map((_, i) => (
                                    <Button
                                        key={i + 1}
                                        variant={currentPage === i + 1 ? "secondary" : "ghost"}
                                        size="icon"
                                        className="w-8 h-8 text-sm shrink-0"
                                        onClick={() => setCurrentPage(i + 1)}
                                    >
                                        {i + 1}
                                    </Button>
                                )).slice(Math.max(0, currentPage - 3), Math.min(totalPages, currentPage + 2))}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            >
                                Selanjutnya
                                <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {mounted && (
                <AlertDialog open={!!productToDelete} onOpenChange={(open) => !open && setProductToDelete(null)}>
                    <AlertDialogContent className="max-w-[90vw] sm:max-w-lg rounded-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle>Hapus Barang?</AlertDialogTitle>
                            <AlertDialogDescription className="text-slate-500">
                                Apakah Anda yakin ingin menghapus <strong>&quot;{productToDelete?.name}&quot;</strong>? Tindakan ini tidak dapat dibatalkan.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="flex-col-reverse sm:flex-row gap-2 mt-4">
                            <AlertDialogCancel className="rounded-xl border-slate-200">Batal</AlertDialogCancel>
                            <AlertDialogAction
                                onClick={handleDelete}
                                className="bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg shadow-red-100"
                            >
                                Hapus Sekarang
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </div>
    )
}

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ')
}

function Card({ children, className }: { children: React.ReactNode, className?: string }) {
    return <div className={`bg-white rounded-xl border border-slate-200 overflow-hidden ${className}`}>{children}</div>
}

function Label({ children }: { children: React.ReactNode }) {
    return <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1 block">{children}</label>
}
