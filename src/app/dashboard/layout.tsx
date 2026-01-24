
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PackagePlus, LogOut, Store } from 'lucide-react'
import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = (await cookies()).get('admin_session')

    if (!session) {
        redirect('/login')
    }

    return (
        <div className="flex min-h-screen bg-slate-50">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-white fixed h-full hidden md:flex flex-col">
                <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                    <div className="bg-emerald-500 p-2 rounded-lg">
                        <Store className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-lg leading-none">Admin Warung</h1>
                        <p className="text-xs text-slate-400">Ibu Pintar</p>
                    </div>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <LayoutDashboard className="w-5 h-5" />
                        <span className="font-medium">Dashboard</span>
                    </Link>
                    <Link href="/dashboard/products/add" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-slate-800 transition-colors text-slate-300 hover:text-white">
                        <PackagePlus className="w-5 h-5" />
                        <span className="font-medium">Tambah Barang</span>
                    </Link>
                </nav>

                <div className="p-4 border-t border-slate-800">
                    <form action={logoutAction}>
                        <Button variant="destructive" className="w-full flex items-center gap-2 justify-start pl-4" type="submit">
                            <LogOut className="w-4 h-4" />
                            Keluar
                        </Button>
                    </form>
                </div>
            </aside>

            {/* Content Area */}
            <main className="flex-1 md:ml-64 p-8">
                {children}
            </main>
        </div>
    )
}
