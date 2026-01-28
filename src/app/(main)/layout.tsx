import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'

export default function MainLayout({
    children,
    modal
}: {
    children: React.ReactNode
    modal: React.ReactNode
}) {
    return (
        <div className="flex flex-col h-[100dvh] bg-slate-50 dark:bg-slate-950 overflow-hidden relative">
            {/* 메인 콘텐츠 영역 (스크롤 가능) */}
            <main className="flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide pb-24">
                {children}
            </main>

            {/* 모달 영역 */}
            {modal}

            {/* 하단 네비게이션 (고정) */}
            <BottomNav />
        </div>
    )
}
