import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, Smartphone } from 'lucide-react'
import { prisma } from '@/lib/prisma'

export default async function DashboardPage() {
    const productCount = await prisma.product.count()

    // Get today's start and end
    const startOfDay = new Date()
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const scanCount = await prisma.scanLog.count({
        where: {
            timestamp: {
                gte: startOfDay,
                lte: endOfDay
            }
        }
    })

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-slate-800">Selamat Datang, Admin! 👋</h2>
                <p className="text-slate-500">Ringkasan warung hari ini.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm bg-white p-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Total Produk
                        </CardTitle>
                        <Package className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{productCount}</div>
                        <p className="text-xs text-slate-400">Barang terdaftar</p>
                    </CardContent>
                </Card>

                {/* Placeholder Stats */}
                <Card className="border-0 shadow-sm bg-white p-2">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">
                            Scan AI Hari Ini
                        </CardTitle>
                        <Smartphone className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-slate-800">{scanCount}</div>
                        <p className="text-xs text-slate-400">Scan berhasil hari ini</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
