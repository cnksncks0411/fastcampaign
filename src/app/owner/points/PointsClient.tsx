'use client'

import { useState } from 'react'
import { ArrowLeft, CreditCard, Download, ExternalLink, Filter, History, Plus, Wallet } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { BackButton } from '@/components/common/BackButton'
import { cn } from '@/lib/utils'

type Transaction = {
    id: string
    transaction_type: string // 'CHARGE', 'CAMPAIGN_CREATE_DEBIT', etc
    amount: number
    balance_after: number
    description: string
    created_at: string
}

export default function PointsClient({
    balance,
    history
}: {
    balance: number
    history: Transaction[]
}) {
    const router = useRouter()
    const [filter, setFilter] = useState<'ALL' | 'CHARGE' | 'USE'>('ALL')

    const filteredHistory = history.filter(item => {
        if (filter === 'ALL') return true
        if (filter === 'CHARGE') return item.amount > 0
        if (filter === 'USE') return item.amount < 0
        return true
    })

    // Group by date
    const groupedHistory = filteredHistory.reduce((acc, item) => {
        const date = new Date(item.created_at).toLocaleDateString()
        if (!acc[date]) acc[date] = []
        acc[date].push(item)
        return acc
    }, {} as Record<string, Transaction[]>)

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">포인트 관리</h1>
            </header>

            <div className="p-5 max-w-lg mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Balance Card */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-600 to-indigo-700 p-6 shadow-xl shadow-violet-200 dark:shadow-none text-white">
                    <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                    <div className="absolute bottom-0 left-0 -ml-10 -mb-10 w-40 h-40 bg-black/10 rounded-full blur-2xl pointer-events-none" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-2 text-violet-100 text-sm font-medium">
                            <Wallet className="w-4 h-4" />
                            보유 포인트
                        </div>
                        <div className="text-4xl font-extrabold tracking-tight mb-6">
                            {balance.toLocaleString()} P
                        </div>

                        <div className="flex gap-3">
                            <Button className="flex-1 bg-white text-violet-700 hover:bg-violet-50 font-bold border-0 h-12 rounded-xl text-base shadow-lg" asChild>
                                <Link href="/owner/points/charge">
                                    <Plus className="w-4 h-4 mr-2" />
                                    충전하기
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold text-lg">
                            <History className="w-5 h-5 text-slate-500" />
                            이용 내역
                        </div>
                    </div>

                    <Tabs defaultValue="ALL" onValueChange={(v) => setFilter(v as any)} className="w-full">
                        <TabsList className="w-full bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-12 mb-4">
                            <TabsTrigger value="ALL" className="flex-1 rounded-lg h-10 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-none">전체</TabsTrigger>
                            <TabsTrigger value="CHARGE" className="flex-1 rounded-lg h-10 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-none">충전</TabsTrigger>
                            <TabsTrigger value="USE" className="flex-1 rounded-lg h-10 text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white shadow-none">사용</TabsTrigger>
                        </TabsList>
                    </Tabs>

                    {Object.keys(groupedHistory).length === 0 ? (
                        <div className="text-center py-20 text-slate-400">
                            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-900 rounded-full flex items-center justify-center mx-auto mb-4">
                                <History className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="text-sm">거래 내역이 없습니다.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.entries(groupedHistory).map(([date, items]) => (
                                <div key={date} className="space-y-3">
                                    <h3 className="text-xs font-bold text-slate-500 px-1">{date}</h3>
                                    <div className="space-y-2">
                                        {items.map((item) => (
                                            <div key={item.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                                                        item.amount > 0 ? "bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400" : "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400"
                                                    )}>
                                                        {item.amount > 0 ? <Download className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 dark:text-white text-sm mb-0.5 line-clamp-1 break-all">
                                                            {item.description}
                                                        </div>
                                                        <div className="text-xs text-slate-500">
                                                            {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="text-right shrink-0 ml-2">
                                                    <div className={cn(
                                                        "font-bold text-base mb-0.5",
                                                        item.amount > 0 ? "text-blue-600 dark:text-blue-400" : "text-slate-900 dark:text-white"
                                                    )}>
                                                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()} P
                                                    </div>
                                                    <div className="text-xs text-slate-400 font-medium">
                                                        {item.balance_after.toLocaleString()} P
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
