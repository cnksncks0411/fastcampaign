'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { History, Loader2 } from 'lucide-react'
import { getPaymentHistory } from './actions'

interface PaymentHistoryItem {
    id: string
    transaction_type: string
    amount: number
    created_at: string
}

export default function PaymentHistory({ initialData, initialHasMore }: { initialData: PaymentHistoryItem[], initialHasMore: boolean }) {
    const [history, setHistory] = useState<PaymentHistoryItem[]>(initialData)
    const [hasMore, setHasMore] = useState(initialHasMore)
    const [page, setPage] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const loadMore = async () => {
        setIsLoading(true)
        const nextPage = page + 1
        const { data, hasMore: nextHasMore } = await getPaymentHistory(nextPage)

        setHistory(prev => [...prev, ...data])
        setHasMore(nextHasMore)
        setPage(nextPage)
        setIsLoading(false)
    }

    return (
        <section>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4 px-1 flex items-center gap-2">
                <History className="w-5 h-5 text-slate-500" />
                최근 결제 내역
            </h2>
            <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden bg-white dark:bg-slate-900">
                <CardContent className="p-0 divide-y divide-slate-100 dark:divide-slate-800">
                    {history.length === 0 ? (
                        <div className="p-8 text-center text-sm text-slate-500">
                            결제 내역이 없습니다.
                        </div>
                    ) : (
                        history.map((item) => (
                            <div key={item.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="font-medium text-slate-900 dark:text-slate-100">
                                        {item.transaction_type === 'CHARGE' ? '포인트 충전' : '결제'}
                                    </div>
                                    <div className="font-bold text-slate-900 dark:text-slate-100">
                                        {Math.abs(item.amount).toLocaleString()}원
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500">
                                    <span>{new Date(item.created_at).toLocaleString()}</span>
                                    <span className="text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded text-[10px]">
                                        결제 완료
                                    </span>
                                </div>
                            </div>
                        ))
                    )}

                    {hasMore && (
                        <div className="p-3 text-center">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 w-full h-auto py-2"
                                onClick={loadMore}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                ) : (
                                    '내역 더보기'
                                )}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </section>
    )
}
