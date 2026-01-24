import { useState, useRef, useEffect } from 'react'
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Search } from 'lucide-react'
import { toast } from "sonner"
import { Product } from './ProductCard'

interface CameraScannerProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    onScanResult: (name: string, recommendations?: Product[]) => void
}

export function CameraScanner({ isOpen, onOpenChange, onScanResult }: CameraScannerProps) {
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [aiLoading, setAiLoading] = useState(false)
    const videoRef = useRef<HTMLVideoElement>(null)

    // Camera Logic
    useEffect(() => {
        let stream: MediaStream | null = null;
        if (isOpen && !imagePreview) {
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
                .then(s => {
                    stream = s
                    if (videoRef.current) videoRef.current.srcObject = stream
                })
                .catch(err => {
                    console.error("Kamera error:", err)
                    toast.error("Gagal akses kamera", { description: "Pastikan izin kamera aktif." })
                })
        }
        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop())
        }
    }, [isOpen, imagePreview])

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
                // Success
                toast.success(`Ditemukan: ${data.identifiedName}`, {
                    description: data.recommendations?.length ? `Ada ${data.recommendations.length} alternatif.` : undefined
                })

                onScanResult(data.identifiedName, data.recommendations)
                onOpenChange(false)
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

    return (
        <Sheet open={isOpen} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[100dvh] p-0 z-[70] bg-black border-none">
                <SheetTitle className="hidden">Camera Vision AI</SheetTitle>
                <div className="relative h-full flex flex-col">
                    {/* Header Camera */}
                    <div className="absolute top-0 left-0 right-0 p-4 z-10 flex justify-between items-center bg-gradient-to-b from-black/60 to-transparent">
                        <button onClick={() => onOpenChange(false)} className="text-white bg-white/20 p-2 rounded-full backdrop-blur-md">
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
    )
}
