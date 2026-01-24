import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { formatRupiah } from "@/lib/utils"
import { MapPin, Plus, ShoppingBag, Info } from 'lucide-react'

// Kita define interface disini biar mandiri
export interface Product {
    id: number
    nama: string
    harga: number
    satuan: string | null
    lokasi: string
    detail: string | null
    kategori: string | null
}

interface ProductCardProps {
    product: Product
    onAdd: (product: Product) => void
    isAlternative?: boolean
}

export function ProductCard({ product, onAdd, isAlternative = false }: ProductCardProps) {
    return (
        <Card className={`group relative overflow-hidden border-0 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl bg-white ring-1 ring-slate-100 ${isAlternative ? 'ring-amber-100 bg-amber-50/10' : ''}`}>
            {/* Hover Effect Background */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none bg-gradient-to-tr ${isAlternative ? 'from-amber-50/50' : 'from-emerald-50/50'} to-transparent`} />

            <div className="p-5 flex flex-col gap-4 relative z-10">
                {/* Header: Name & Price */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            {isAlternative && (
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-amber-200 text-amber-600 bg-amber-50">
                                    Alternatif
                                </Badge>
                            )}
                            <Badge variant="secondary" className="text-[10px] px-2 h-5 bg-slate-100 text-slate-500 hover:bg-slate-200">
                                {product.kategori || 'Umum'}
                            </Badge>
                        </div>
                        <h3 className="font-bold text-slate-800 text-lg leading-tight group-hover:text-emerald-700 transition-colors">
                            {product.nama}
                        </h3>
                    </div>
                </div>

                {/* Price & Action Row */}
                <div className="flex items-end justify-between mt-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">Harga Satuan</span>
                        <div className={`text-xl font-bold ${isAlternative ? 'text-amber-600' : 'text-emerald-600'}`}>
                            {formatRupiah(product.harga)}
                            <span className="text-xs text-slate-400 font-medium ml-1">/{product.satuan || 'pcs'}</span>
                        </div>
                    </div>

                    <Button
                        size="icon"
                        onClick={() => onAdd(product)}
                        className={`h-10 w-10 rounded-full shadow-lg hover:scale-110 active:scale-95 transition-all duration-300 ${isAlternative ? 'bg-amber-500 hover:bg-amber-600' : 'bg-slate-900 hover:bg-emerald-600'}`}
                    >
                        <Plus className="w-5 h-5 text-white" />
                    </Button>
                </div>

                {/* Location Info Footer */}
                <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100/50">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-xs font-semibold">{product.lokasi}</span>
                    </div>

                    {product.detail && product.detail !== 'undefined' && (
                        <div className="flex items-center gap-1.5 text-slate-400 text-xs italic truncate flex-1">
                            <Info className="w-3.5 h-3.5" />
                            <span className="truncate">{product.detail}</span>
                        </div>
                    )}
                </div>
            </div>
        </Card>
    )
}
