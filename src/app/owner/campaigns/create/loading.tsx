export default function Loading() {
    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header Skeleton */}
            <div className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <div className="w-6 h-6 rounded bg-slate-200 dark:bg-slate-800 animate-pulse mr-2" />
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-5 animate-pulse">
                {/* Store Selection Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="h-16 w-full bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                </div>

                {/* Review Type Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="grid grid-cols-2 gap-3 h-24">
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                        <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl" />
                    </div>
                </div>

                {/* Details Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-48" />
                </div>

                {/* Schedule Skeleton */}
                <div className="space-y-2">
                    <div className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
                    <div className="bg-slate-200 dark:bg-slate-800 rounded-2xl h-64" />
                </div>
            </div>

            {/* Footer Skeleton */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 z-[90]">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col gap-1">
                        <div className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
                    </div>
                    <div className="flex-1 h-12 bg-slate-200 dark:bg-slate-800 rounded-xl animate-pulse" />
                </div>
            </div>
        </div>
    )
}
