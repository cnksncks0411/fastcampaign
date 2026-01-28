import React from 'react'
import { Ticket, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getUserTickets } from '../actions'
import { TicketHistoryList } from '../TicketHistoryList'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { BackButton } from '@/components/common/BackButton'

export default async function TicketHistoryPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { tickets } = await getUserTickets()

    // 지난 티켓만 필터링 (완료, 취소, 노쇼 등)
    const pastTickets = tickets.filter(t => t.status !== 'CONFIRMED')

    return (
        <div className="h-full bg-slate-50 dark:bg-slate-950">
            {/* 헤더 */}
            <header className="sticky top-0 z-30 border-b border-slate-200 bg-white px-4 py-4 flex items-center gap-3 dark:bg-slate-900 dark:border-slate-800">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100">지난 이용권 내역</h1>
            </header>

            <div className="p-4">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-sm text-slate-500 dark:text-slate-400">
                        총 <span className="font-bold text-slate-900 dark:text-slate-100">{pastTickets.length}</span>건
                    </span>
                </div>

                <TicketHistoryList tickets={pastTickets} />
            </div>
        </div>
    )
}
