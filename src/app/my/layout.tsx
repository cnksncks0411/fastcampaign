import { BottomNav } from '@/components/layout/BottomNav'

export default function MyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950">
            <main className="h-full overflow-y-auto pb-bottom-nav scrollbar-hide">
                {children}
            </main>
            <BottomNav />
        </div>
    )
}
