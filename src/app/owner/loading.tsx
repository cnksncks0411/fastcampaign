import { Spinner } from "@/components/ui/spinner"

export default function Loading() {
    return (
        <div className="fixed inset-0 z-[50] flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950">
            <div className="flex flex-col items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                <Spinner size="lg" />
                <p className="text-slate-500 text-sm font-medium animate-pulse">로딩중...</p>
            </div>
        </div>
    )
}
