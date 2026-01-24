import { Card } from "@/components/ui/card"

export function ProductSkeleton() {
    return (
        <Card className="border-0 shadow-sm rounded-2xl bg-white overflow-hidden">
            <div className="p-5 flex flex-col gap-4">
                {/* Header Skeleton */}
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex gap-2">
                            <div className="h-5 w-16 bg-slate-100 rounded animate-pulse" />
                            <div className="h-5 w-20 bg-slate-100 rounded animate-pulse" />
                        </div>
                        <div className="h-6 w-3/4 bg-slate-100 rounded animate-pulse" />
                    </div>
                </div>

                {/* Price & Action Skeleton */}
                <div className="flex items-end justify-between mt-1">
                    <div className="space-y-1">
                        <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
                        <div className="h-7 w-32 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-10 w-10 rounded-full bg-slate-100 animate-pulse" />
                </div>

                {/* Footer Skeleton */}
                <div className="pt-3 border-t border-slate-50 flex items-center gap-3">
                    <div className="h-6 w-24 bg-slate-100 rounded animate-pulse" />
                    <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
                </div>
            </div>
        </Card>
    )
}
