import { useState, useEffect } from 'react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingBag, Calculator, CheckCircle2, Minus, Plus, Trash2, RefreshCcw, Copy } from 'lucide-react'
import { formatRupiah } from "@/lib/utils"
import { Product } from './ProductCard'

export interface CartItem extends Product {
    qty: number
}

interface CartSheetProps {
    cart: CartItem[]
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onUpdateQty: (id: number, delta: number) => void
    onRemove: (id: number) => void
    onClear: () => void
}

export function CartSheet({ cart, isOpen, onOpenChange, onUpdateQty, onRemove, onClear }: CartSheetProps) {
    const [paymentAmount, setPaymentAmount] = useState<string>('')
    const [isTransactionDone, setIsTransactionDone] = useState(false)

    // Reset payment state when cart changes
    useEffect(() => {
        setIsTransactionDone(false)
    }, [cart])

    const totalCart = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)
    const paymentValue = parseInt(paymentAmount.replace(/\D/g, '') || '0')
    const change = paymentValue - totalCart

    const quickMoneyButtons = [10000, 20000, 50000, 100000]

    const finishTransaction = () => {
        setIsTransactionDone(true)
    }

    const copyReceipt = () => {
        let text = `*WARUNG IBU PINTAR*\n`
        text += `${new Date().toLocaleString('id-ID')}\n`
        text += `--------------------------------\n`
        cart.forEach(item => {
            text += `${item.nama}\n`
            text += `${item.qty} x ${item.harga} = ${item.qty * item.harga}\n`
        })
        text += `--------------------------------\n`
        text += `Total: ${formatRupiah(totalCart)}\n`
        if (paymentValue > 0) {
            text += `Bayar: ${formatRupiah(paymentValue)}\n`
            text += `Kembali: ${formatRupiah(change)}\n`
        }
        text += `\nTerima Kasih!\n`
        navigator.clipboard.writeText(text)
        alert("Struk berhasil disalin!")
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
            <Sheet open={isOpen} onOpenChange={onOpenChange}>
                <SheetTrigger asChild>
                    <div className="bg-slate-900 text-white p-4 rounded-2xl shadow-xl shadow-slate-900/20 flex justify-between items-center cursor-pointer hover:bg-slate-800 transition-transform active:scale-95 border border-slate-700/50 backdrop-blur-md">
                        <div className="flex items-center gap-3">
                            <div className="bg-emerald-500 text-white w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-emerald-500/30">
                                {cart.reduce((a, b) => a + b.qty, 0)}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Total Belanja</span>
                                <span className="font-bold text-xl">{formatRupiah(totalCart)}</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm font-semibold bg-white/10 px-4 py-2 rounded-xl">
                            <ShoppingBag className="w-4 h-4" />
                            {isTransactionDone ? 'Struk Transaksi' : 'Buka Kasir'}
                        </div>
                    </div>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[92vh] sm:max-w-lg sm:mx-auto rounded-t-[32px] flex flex-col p-0 z-[60]">
                    {/* Header Sheet */}
                    <div className="p-6 border-b border-slate-100 pb-4">
                        <SheetHeader>
                            <SheetTitle className="flex items-center gap-2 text-xl">
                                {isTransactionDone ? (
                                    <div className="flex items-center gap-2 text-emerald-600">
                                        <CheckCircle2 className="w-6 h-6" />
                                        Transaksi Selesai
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Calculator className="w-6 h-6 text-emerald-500" />
                                        Hitung Belanjaan
                                    </div>
                                )}
                            </SheetTitle>
                        </SheetHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto px-6">
                        <div className="space-y-4 py-6">
                            {cart.map((item) => (
                                <div key={item.id} className="flex justify-between items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-slate-800 truncate">{item.nama}</h4>
                                        <p className="text-emerald-600 text-sm font-semibold">{formatRupiah(item.harga)}</p>
                                    </div>
                                    {!isTransactionDone && (
                                        <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 p-1">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md hover:bg-red-50 hover:text-red-500"
                                                onClick={() => item.qty > 1 ? onUpdateQty(item.id, -1) : onRemove(item.id)}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </Button>
                                            <span className="w-6 text-center font-bold text-slate-700">{item.qty}</span>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 rounded-md hover:bg-emerald-50 hover:text-emerald-500"
                                                onClick={() => onUpdateQty(item.id, 1)}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    )}
                                    {isTransactionDone && (
                                        <div className="font-bold text-slate-700">x{item.qty}</div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Calculation Area */}
                        <div className={`space-y-4 bg-slate-50 p-6 rounded-2xl border ${isTransactionDone ? 'border-emerald-200 bg-emerald-50/50' : 'border-slate-100'} mt-4 mb-32`}>
                            <div className="space-y-2">
                                <div className="flex justify-between text-lg font-bold text-slate-800">
                                    <span>Total Tagihan</span>
                                    <span className="text-emerald-600 text-2xl">{formatRupiah(totalCart)}</span>
                                </div>

                                {/* Uang Diterima Input */}
                                <div className="pt-4 border-t border-slate-200/50">
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">Uang Diterima</label>

                                    <div className="grid grid-cols-4 gap-2 mb-3">
                                        <button className="col-span-1 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-lg py-2 text-xs font-bold hover:bg-emerald-100 transition-colors" onClick={() => setPaymentAmount(totalCart.toString())}>
                                            Uang Pas
                                        </button>
                                        {quickMoneyButtons.map(m => (
                                            <button key={m} className="col-span-1 border border-slate-200 bg-white text-slate-600 rounded-lg py-2 text-xs font-semibold hover:bg-slate-50 transition-colors" onClick={() => setPaymentAmount(m.toString())}>
                                                {m / 1000}k
                                            </button>
                                        ))}
                                    </div>

                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                                        <Input
                                            type="number"
                                            placeholder="0"
                                            className="pl-10 text-right text-lg font-mono font-bold tracking-wider"
                                            value={paymentAmount}
                                            onChange={(e) => setPaymentAmount(e.target.value)}
                                            disabled={isTransactionDone}
                                        />
                                    </div>
                                </div>

                                {/* Kembalian Display */}
                                {paymentValue > 0 && (
                                    <div className={`flex justify-between items-center p-3 rounded-xl mt-4 border ${change >= 0 ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-red-50 border-red-100 text-red-600'}`}>
                                        <span className="font-semibold text-sm">Kembalian</span>
                                        <span className="font-bold text-xl">{formatRupiah(change)}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 space-y-3">
                        {!isTransactionDone ? (
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 border-slate-300 text-slate-600" onClick={onClear}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Batal
                                </Button>
                                <Button
                                    className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12"
                                    disabled={paymentValue < totalCart}
                                    onClick={finishTransaction}
                                >
                                    Selesaikan & Cetak Struk
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 border-slate-300 text-slate-600" onClick={onClear}>
                                    <RefreshCcw className="w-4 h-4 mr-2" />
                                    Transaksi Baru
                                </Button>
                                <Button
                                    className="flex-[2] bg-slate-800 hover:bg-slate-900 text-white font-bold h-12"
                                    onClick={copyReceipt}
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Salin Struk
                                </Button>
                            </div>
                        )}
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    )
}
