import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { DashboardSidebar } from '@/components/features/DashboardSidebar'

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
            <DashboardSidebar />

            {/* Content Area */}
            <main className="flex-1 w-full overflow-x-hidden md:ml-64 p-4 md:p-8 pt-20 md:pt-8 bg-slate-50">
                {children}
            </main>
        </div>
    )
}
