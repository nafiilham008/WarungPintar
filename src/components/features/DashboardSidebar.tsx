'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, PackagePlus, LogOut, Store, Settings, Home, Menu, PackageSearch } from 'lucide-react'
import { logoutAction } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

export function DashboardSidebar() {
    const pathname = usePathname()
    const [open, setOpen] = useState(false)

    const navItems = [
        { href: '/', label: 'Lihat Toko', icon: Home, highlight: true },
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/dashboard/products', label: 'Daftar Barang', icon: PackageSearch },
        { href: '/dashboard/products/add', label: 'Tambah Barang', icon: PackagePlus },
        { href: '/dashboard/settings', label: 'Pengaturan', icon: Settings },
    ]

    const SidebarContent = () => (
        <div className="flex flex-col h-full bg-slate-900 text-white">
            <div className="p-6 border-b border-slate-800 flex items-center gap-3">
                <div className="bg-emerald-500 p-2 rounded-lg text-white">
                    <Store className="w-6 h-6" />
                </div>
                <div>
                    <h1 className="font-bold text-lg leading-none">Admin Warung</h1>
                    <p className="text-xs text-slate-400">Ibu Pintar</p>
                </div>
            </div>

            <nav className="flex-1 p-4 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setOpen(false)}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${item.highlight
                                    ? 'text-emerald-400 border-b border-slate-800 mb-4 pb-4 hover:bg-slate-800/50'
                                    : isActive
                                        ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/20'
                                        : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                }`}
                        >
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : item.highlight ? 'text-emerald-400' : ''}`} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-slate-800">
                <form action={logoutAction}>
                    <Button variant="ghost" className="w-full flex items-center gap-2 justify-start pl-4 text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-colors" type="submit">
                        <LogOut className="w-4 h-4" />
                        Keluar
                    </Button>
                </form>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="w-64 fixed h-full hidden md:block">
                <SidebarContent />
            </aside>

            {/* Mobile Header & Sidebar (Sheet) */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    <div className="bg-emerald-500 p-1.5 rounded-lg text-white">
                        <Store className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-white text-sm">Admin Warung</span>
                </div>

                <Sheet open={open} onOpenChange={setOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-white hover:bg-slate-800">
                            <Menu className="w-6 h-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="left" className="p-0 border-none w-72 bg-slate-900">
                        <SidebarContent />
                    </SheetContent>
                </Sheet>
            </div>
        </>
    )
}
