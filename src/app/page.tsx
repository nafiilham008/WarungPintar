'use client'

import { useState, useEffect, useRef } from 'react'
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { Search, MapPin, Tag, ShoppingBag, Clock, Coffee, Lightbulb, Pill, Home, ArrowLeft, Plus, Minus, Trash2, Calculator, ChevronRight, RefreshCcw, CheckCircle2, Copy, Camera } from 'lucide-react'
import { toast } from "sonner"

// Tipe data produk
interface Product {
  id: number
  nama: string
  harga: number
  satuan: string | null
  lokasi: string
  detail: string | null
  kategori: string | null
}

interface Category {
  name: string
  count: number
}

interface CartItem extends Product {
  qty: number
}

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
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Cashier States
  const [paymentAmount, setPaymentAmount] = useState<string>('')
  const [isTransactionDone, setIsTransactionDone] = useState(false)

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
        setResults(data)
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
    setIsTransactionDone(false) // Reset state kalau nambah barang baru
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
    setIsTransactionDone(false)
  }

  const clearCart = () => {
    setCart([])
    setPaymentAmount('')
    setIsTransactionDone(false)
    setIsCartOpen(false)
  }

  // Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    if (isCameraOpen && !imagePreview) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(s => {
          stream = s
          if (videoRef.current) videoRef.current.srcObject = stream
        })
        .catch(err => console.error("Kamera error:", err))
    }
    return () => {
      if (stream) stream.getTracks().forEach(track => track.stop())
    }
  }, [isCameraOpen, imagePreview])

  const captureImage = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas")
      canvas.width = videoRef.current.videoWidth
      canvas.height = videoRef.current.videoHeight
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0)
      const dataUrl = canvas.toDataURL("image/jpeg")
      setImagePreview(dataUrl)
    }
  }

  const processImageWithAI = async () => {
    if (!imagePreview) return
    setAiLoading(true)
    try {
      const res = await fetch('/api/scan-ai', {
        method: 'POST',
        body: JSON.stringify({ image: imagePreview })
      })
      const data = await res.json()

      if (data.identifiedName) {
        setQuery(data.identifiedName)
        setLoading(true)
        setDebouncedQuery(data.identifiedName) // Trigger search

        // Simpan rekomendasi alternatif dari AI
        if (data.recommendations && data.recommendations.length > 0) {
          setRecommendations(data.recommendations)
          toast.success(`Ditemukan: ${data.identifiedName}`, {
            description: `Ada ${data.recommendations.length} alternatif barang mirip.`
          })
        } else {
          setRecommendations([])
          toast.success(`Barang ditemukan: ${data.identifiedName}`)
        }

        setIsCameraOpen(false) // Close camera
        setImagePreview(null)
      } else {
        console.log("AI Response:", data)
        toast.error("AI Bingung", {
          description: data.error || "Coba foto bagian merek lebih jelas lagi."
        })
        setImagePreview(null)
      }
    } catch (e) {
      console.error(e)
      toast.error("Gagal koneksi server AI")
    } finally {
      setAiLoading(false)
    }
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

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(num)
  }

  // Cashier Logic
  const totalCart = cart.reduce((acc, item) => acc + (item.harga * item.qty), 0)
  const paymentValue = parseInt(paymentAmount.replace(/\D/g, '') || '0')
  const change = paymentValue - totalCart

  const quickMoneyButtons = [10000, 20000, 50000, 100000]

  const finishTransaction = () => {
    setIsTransactionDone(true)
  }

  const copyReceipt = () => {
    let text = `*WARUNG IBU PINTAR*\n`
    text += `${time.toLocaleString('id-ID')}\n`
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

          <div className="text-right">
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

        {/* Camera Dialog */}
        <Sheet open={isCameraOpen} onOpenChange={setIsCameraOpen}>
          <SheetContent side="bottom" className="h-[100dvh] p-0 z-[70] bg-black border-none">
            <SheetTitle className="hidden">Camera Vision AI</SheetTitle>
            <div className="relative h-full flex flex-col">
              {/* Header Camera */}
              <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                <button onClick={() => setIsCameraOpen(false)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md">
                  <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="text-white font-medium text-sm bg-black/40 px-3 py-1 rounded-full backdrop-blur-md">
                  Warung Vision AI 🤖
                </div>
                <div className="w-10"></div>
              </div>

              {/* Video Stream */}
              <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden">
                {!imagePreview ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    className="absolute min-h-full min-w-full object-cover"
                  />
                ) : (
                  <img src={imagePreview} className="absolute h-full w-full object-contain" alt="Captured" />
                )}

                {/* AI Analysis Overlay */}
                {aiLoading && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20 animate-in fade-in">
                    <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <h3 className="text-xl font-bold animate-pulse">Gemini sedang melihat...</h3>
                    <p className="text-sm text-slate-300 mt-2">Menganalisa gambar produk</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="absolute bottom-0 left-0 right-0 p-8 pb-12 bg-gradient-to-t from-black/90 via-black/50 to-transparent flex justify-center items-center gap-8">
                {!imagePreview ? (
                  <button
                    onClick={captureImage}
                    className="w-20 h-20 rounded-full bg-white border-4 border-slate-300 shadow-lg shadow-white/20 active:scale-95 transition-transform flex items-center justify-center"
                  >
                    <div className="w-16 h-16 rounded-full bg-white border-2 border-slate-900"></div>
                  </button>
                ) : (
                  !aiLoading && (
                    <div className="flex gap-4 w-full">
                      <Button variant="secondary" className="flex-1 py-6 text-lg rounded-2xl" onClick={() => setImagePreview(null)}>
                        Ulangi
                      </Button>
                      <Button className="flex-1 py-6 text-lg rounded-2xl bg-emerald-500 hover:bg-emerald-600 font-bold" onClick={processImageWithAI}>
                        <Search className="w-5 h-5 mr-2" />
                        Cari Barang
                      </Button>
                    </div>
                  )
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>

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
            <div className="space-y-3 pt-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-28 bg-white rounded-2xl animate-pulse border border-slate-100 shadow-sm"></div>
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
                  {results.map((item) => (
                    <Card key={item.id} className="border-0 shadow-sm hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden bg-white group ring-1 ring-slate-100/80">
                      <div className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg leading-snug">{item.nama}</h3>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2">
                                {item.kategori}
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-100/50">
                              <p className="text-emerald-700 font-bold text-lg">{formatRupiah(item.harga)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-8 bg-slate-800 hover:bg-emerald-600 text-white rounded-full transition-colors font-medium text-xs px-4"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Tambah
                            </Button>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-3 flex items-start gap-3 border border-slate-100 group-hover:border-emerald-100/50 transition-colors">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <MapPin className="w-4 h-4 text-red-500 animate-pulse" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">LOKASI RAK</p>
                            <p className="text-slate-800 font-semibold text-sm">{item.lokasi}</p>
                            {item.detail && item.detail !== 'undefined' && (
                              <p className="text-xs text-slate-500 mt-1 italic">
                                "{item.detail}"
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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

                  {recommendations.map((item) => (
                    <Card key={`rec-${item.id}`} className="border-0 shadow-sm hover:shadow-md transition-all duration-300 rounded-2xl overflow-hidden bg-white ring-1 ring-amber-100/50">
                      <div className="p-4 flex flex-col gap-4">
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-800 text-lg leading-snug">{item.nama}</h3>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="outline" className="text-[10px] font-medium text-amber-600 border-amber-200 bg-amber-50 px-2">
                                Alternatif AI
                              </Badge>
                            </div>
                          </div>
                          <div className="text-right flex flex-col items-end gap-2">
                            <div className="bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100/30">
                              <p className="text-amber-700 font-bold text-lg">{formatRupiah(item.harga)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addToCart(item)}
                              className="h-8 bg-amber-600 hover:bg-amber-700 text-white rounded-full transition-colors font-medium text-xs px-4"
                            >
                              <Plus className="w-3.5 h-3.5 mr-1" />
                              Tambah
                            </Button>
                          </div>
                        </div>

                        <div className="bg-amber-50/30 rounded-xl p-3 flex items-start gap-3 border border-amber-100/20">
                          <div className="bg-white p-1.5 rounded-lg shadow-sm">
                            <MapPin className="w-4 h-4 text-amber-500" />
                          </div>
                          <div className="flex-1">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">LOKASI RAK</p>
                            <p className="text-slate-800 font-semibold text-sm">{item.lokasi}</p>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
        <div className="fixed bottom-4 left-4 right-4 z-50 max-w-2xl mx-auto animate-in slide-in-from-bottom-10 duration-500">
          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
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

              <ScrollArea className="flex-1 px-6">
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
                            onClick={() => item.qty > 1 ? updateQty(item.id, -1) : removeFromCart(item.id)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <span className="w-6 text-center font-bold text-slate-700">{item.qty}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-emerald-50 hover:text-emerald-500"
                            onClick={() => updateQty(item.id, 1)}
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
              </ScrollArea>

              <div className="p-6 border-t border-slate-100 bg-white sticky bottom-0 z-10 space-y-3">
                {!isTransactionDone ? (
                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 border-slate-300 text-slate-600" onClick={clearCart}>
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
                    <Button variant="outline" className="flex-1 border-slate-300 text-slate-600" onClick={clearCart}>
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
      )}

    </main>
  )
}
