import React from 'react'
import { getUserTickets } from './actions'
import { ActiveTicketView } from './ActiveTicketView'
import { TicketHistoryList } from './TicketHistoryList'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Ticket, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function TicketsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { tickets, error } = await getUserTickets()

    if (error) {
        return (
            <div className="min-h-dvh flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-red-500 mb-2">데이터를 불러오는데 실패했습니다.</p>
                    <p className="text-sm text-slate-500">{error}</p>
                </div>
            </div>
        )
    }

    // 활성 티켓 (CONFIRMED) 찾기 - 하나만 존재해야 함
    const activeTicket = tickets.find(t => t.status === 'CONFIRMED')

    // 지난 티켓 (나머지)
    const pastTickets = tickets.filter(t => t.status !== 'CONFIRMED')

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950 flex flex-col">
            {/* 헤더 */}
            <header className="sticky top-0 z-20 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-4 flex items-center justify-between dark:border-slate-800/50 dark:bg-slate-900/80">
                <div className="flex items-center gap-2">
                    <Ticket className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                    <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">내 이용권</h1>
                </div>
                <Link href="/my/tickets/history" className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1">
                    지난 내역 <ChevronRight className="h-3 w-3" />
                </Link>
            </header>

            <div className="px-4 py-4 flex-1 flex flex-col">
                {activeTicket ? (
                    // 활성 티켓이 있으면 바로 상세 화면(QR) 보여줌
                    <ActiveTicketView ticket={activeTicket} />
                ) : (
                    // 활성 티켓이 없으면 빈 상태
                    <div className="animate-fade-in flex-1 flex items-center justify-center">
                        <div className="w-full py-16 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 shadow-sm mx-auto max-w-sm">
                            <div className="flex justify-center mb-4">
                                <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
                                    <Ticket className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                                </div>
                            </div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-2">
                                현재 사용 가능한 이용권이 없어요
                            </h3>
                            <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 px-10 leading-relaxed">
                                마음 드는 캠페인을 찾아<br />
                                지금 바로 혜택을 신청해보세요!
                            </p>
                            <Button asChild className="bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-slate-300 rounded-xl px-6 h-11 shadow-lg shadow-slate-200 dark:shadow-none">
                                <Link href="/">주변 캠페인 둘러보기</Link>
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
