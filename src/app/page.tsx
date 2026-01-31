'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Search, Tag, ShoppingBag, Clock, Lightbulb, Pill, Home, ArrowLeft, Plus, Minus, Trash2, Calculator, ChevronRight, RefreshCcw, CheckCircle2, Copy, Camera, Coffee, LayoutDashboard } from 'lucide-react'
import { toast } from "sonner"
import { ProductCard, Product } from "@/components/features/ProductCard"
import { CartSheet, CartItem } from "@/components/features/CartSheet"
import { CameraScanner } from "@/components/features/CameraScanner"
import { ProductSkeleton } from "@/components/features/ProductSkeleton"
import { VoiceMicrophone } from "@/components/features/VoiceMicrophone"
import { formatRupiah } from "@/lib/utils"

interface Category {
  name: string
  count: number
}

// CartItem is now imported

export default function HomePage() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Product[]>([])
  const [recommendations, setRecommendations] = useState<Product[]>([]) // AI Recommendations
  const [loading, setLoading] = useState(false)
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [time, setTime] = useState(new Date())
  const [cart, setCart] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)

  // Camera States
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  // Logic Moved to CameraScanner Component

  // Greeting Logic
  const getGreeting = () => {
    const hour = time.getHours()
    if (hour < 10) return 'Selamat Pagi ☀️'
    if (hour < 15) return 'Selamat Siang 🌤️'
    if (hour < 18) return 'Selamat Sore 🌥️'
    return 'Selamat Malam 🌙'
  }

  // Clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // Fetch Categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error("Gagal load kategori", err))
  }, [])

  // Debounce Search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 400)
    return () => clearTimeout(timer)
  }, [query])

  // Search Action
  useEffect(() => {
    async function search() {
      if (!debouncedQuery) {
        setResults([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(debouncedQuery)}`)
        const data = await res.json()
        setResults(data.products || [])
      } catch (err) {
        console.error("Gagal search", err)
      } finally {
        setLoading(false)
      }
    }

    search()
  }, [debouncedQuery])

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart(prev => {
      const exist = prev.find(p => p.id === product.id)
      if (exist) {
        return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + 1 } : p)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setIsCartOpen(true)
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(p => p.id !== id))
  }

  const updateQty = (id: number, delta: number) => {
    setCart(prev => prev.map(p => {
      if (p.id === id) {
        const newQty = Math.max(0, p.qty + delta)
        return { ...p, qty: newQty }
      }
      return p
    }).filter(p => p.qty > 0))
  }

  const clearCart = () => {
    setCart([])
    setIsCartOpen(false)
  }

  const handleCategoryClick = (catName: string) => {
    setQuery(catName)
    setLoading(true) // Prevent flicker "Not Found"
    setDebouncedQuery(catName) // Bypass debounce timer
  }

  const handleHome = () => {
    setQuery('')
    setResults([])
  }

  const handleVoiceCommand = async (cmd: any) => {
    console.log("Voice Command:", cmd)

    // DEBUG: Show what the AI decided
    // if (cmd.action) {
    //   toast.info(`Action: ${cmd.action}`, { description: JSON.stringify(cmd.params) })
    // } else {
    //   toast.error("AI tidak mengerti maksudnya.")
    // }

    if (cmd.action === 'search') {
      setQuery(cmd.params.query)
      setDebouncedQuery(cmd.params.query) // Force immediate search
    }
    else if (cmd.action === 'add_to_cart') {
      // 1. Coba cari barangnya dulu
      const productName = cmd.params.product
      const qty = cmd.params.quantity || 1

      toast.info(`Mencari "${productName}"...`)

      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(productName)}`)
        const data = await res.json()
        const foundProducts = data.products || []

        if (foundProducts.length > 0) {
          // Ambil hasil pertama yang paling relevan
          const product = foundProducts[0]

          // Tambahkan ke keranjang
          setCart(prev => {
            const exist = prev.find(p => p.id === product.id)
            if (exist) {
              return prev.map(p => p.id === product.id ? { ...p, qty: p.qty + qty } : p)
            }
            return [...prev, { ...product, qty: qty }]
          })

          setIsCartOpen(true)
          toast.success(`Berhasil menambahkan ${qty} ${product.nama}`)
        } else {
          toast.warning(`Maaf, stok "${productName}" tidak ditemukan.`)
        }
      } catch (err) {
        console.error(err)
        toast.error("Gagal memproses pesanan suara.")
      }
    }
  }

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  // Icon Mapper

  // Icon Mapper
  const getCategoryIcon = (cat: string) => {
    const lower = cat.toLowerCase()
    if (lower.includes('obat')) return <Pill className="w-5 h-5" />
    if (lower.includes('minum')) return <Coffee className="w-5 h-5" />
    if (lower.includes('rokok')) return <ShoppingBag className="w-5 h-5" />
    if (lower.includes('lampu') || lower.includes('alat')) return <Lightbulb className="w-5 h-5" />
    return <Tag className="w-5 h-5" />
  }

  return (
    <main className="min-h-screen bg-slate-50 font-sans pb-32">
      {/* Top Bar / Header */}
      <div className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm transition-all duration-300">
        <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={handleHome}>
            {query ? (
              <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                <ArrowLeft className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-white font-bold shadow-emerald-200 shadow-lg">
                <Home className="w-5 h-5" />
              </div>
            )}

            <div>
              <h1 className="text-lg font-bold text-slate-800 leading-none">
                {query ? 'Kembali' : 'Warung Ibu'}
              </h1>
              {!query && <p className="text-[10px] text-slate-500 font-medium tracking-wide">ASISTEN PINTAR</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!query && (
              <Link href="/dashboard" className="flex items-center gap-2 text-emerald-600 bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 px-3 py-1.5 rounded-full transition-colors mr-1">
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span className="text-xs font-bold">Admin</span>
              </Link>
            )}
            <div className="flex items-center gap-2 text-slate-700 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-sm font-mono font-medium">
                {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-6">

        {/* Welcome Section */}
        {!query && (
          <div className="space-y-1 mb-2 animate-in fade-in slide-in-from-top-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-800">{getGreeting()}</h2>
            <p className="text-slate-500">Siap melayani pelanggan hari ini.</p>
          </div>
        )}

        {/* Search Input Floating */}
        {/* Search Input Floating */}
        <div className="relative group z-30">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 transition-colors duration-300 ${query ? 'text-emerald-500' : 'text-slate-400'}`} />
          </div>
          <Input
            className="pl-12 pr-12 h-14 text-lg bg-white border-slate-200 shadow-sm rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
            placeholder="Cari barang disini..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
            {query ? (
              <button
                onClick={handleHome}
                className="p-2 text-slate-400 hover:text-red-500 transition-colors bg-slate-100 rounded-full"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsCameraOpen(true)}
                className="p-2 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors bg-emerald-50/50 rounded-full border border-emerald-100"
                title="Scan Barang dengan AI"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Camera Dialog Removed (Used Component) */}
        <CameraScanner
          isOpen={isCameraOpen}
          onOpenChange={setIsCameraOpen}
          onScanResult={(name, recs) => {
            setQuery(name)
            setDebouncedQuery(name)
            if (recs) setRecommendations(recs)
          }}
        />

        {/* Quick Categories Layout */}
        {!query && categories.length > 0 && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-500 delay-100">
            <div className="flex justify-between items-center px-1">
              <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Tag className="w-4 h-4 text-emerald-500" />
                Kategori Cepat
              </h3>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {categories.slice(0, 9).map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all active:scale-95 flex items-center gap-3 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-600 group-hover:bg-emerald-500 group-hover:text-white transition-colors shrink-0">
                    {getCategoryIcon(cat.name)}
                  </div>
                  <div>
                    <p className="font-bold text-slate-700 text-sm group-hover:text-emerald-700 transition-colors line-clamp-1">{cat.name}</p>
                    <p className="text-[10px] text-slate-400 font-medium">{cat.count} Produk</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        <div className="space-y-4">
          {loading ? (
            <div className="pt-4 grid grid-cols-1 gap-4">
              {[1, 2, 3].map(i => (
                <ProductSkeleton key={i} />
              ))}
            </div>
          ) : (
            <div className="pb-20 space-y-8">
              {/* Hasil Utama */}
              {results.length > 0 ? (
                <div className="space-y-3 animate-in slide-in-from-bottom-5 duration-500">
                  <div className="flex justify-between items-center px-1 pb-1">
                    <p className="text-sm text-slate-500 font-medium">Hasil Pencarian: <strong className="text-emerald-600">{results.length}</strong> barang</p>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                    {results.map((item) => (
                      <ProductCard key={item.id} product={item} onAdd={addToCart} />
                    ))}
                  </div>
                </div>
              ) : (query || debouncedQuery) && !loading && recommendations.length === 0 && (
                <div className="text-center py-16 animate-in fade-in zoom-in-95">
                  <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold text-lg">Barang tidak ditemukan</h3>
                  <p className="text-slate-500 text-sm mt-1 max-w-[200px] mx-auto leading-relaxed">Cek ejaan atau coba kata kunci lain.</p>
                  <Button variant="outline" className="mt-6 rounded-full" onClick={handleHome}>Kembali ke Menu Utama</Button>
                </div>
              )}

              {/* AI Recommendations Section */}
              {recommendations.length > 0 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
                  <div className="flex items-center gap-2 px-1 py-1 rounded-xl bg-amber-50/50 border border-amber-100/50">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Lightbulb className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm">Saran Alternatif (AI)</h4>
                      <p className="text-xs text-slate-500 font-medium">Mungkin barang ini yang Anda cari?</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {recommendations.map((item) => (
                      <ProductCard key={`rec-${item.id}`} product={item} onAdd={addToCart} isAlternative={true} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Gap before floating cart */}
        <div className="h-10" />
      </div>

      {/* Floating Cart Summary (Sticky Bottom) */}
      {cart.length > 0 && (
        <CartSheet
          cart={cart}
          isOpen={isCartOpen}
          onOpenChange={setIsCartOpen}
          onUpdateQty={updateQty}
          onRemove={removeFromCart}
          onClear={clearCart}
        />
      )}

      <VoiceMicrophone onCommand={handleVoiceCommand} />
    </main >
  )
}
