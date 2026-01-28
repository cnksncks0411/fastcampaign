'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Plus, Wallet, Loader2 } from 'lucide-react'
import { setDefaultPaymentMethod } from './actions'
import { useRouter } from 'next/navigation'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface PaymentMethod {
    id: string
    card_company: string
    card_alias: string
    card_number_last4: string
    is_default: boolean
}

export default function PaymentMethodList({ methods }: { methods: PaymentMethod[] }) {
    const router = useRouter()
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [isUpdating, setIsUpdating] = useState(false)

    const handleSelect = (id: string, isDefault: boolean) => {
        if (isDefault) return
        setSelectedId(id)
    }

    const handleConfirm = async () => {
        if (!selectedId) return
        setIsUpdating(true)
        try {
            await setDefaultPaymentMethod(selectedId)
            router.refresh()
        } catch (e) {
            alert('설정 변경 실패')
        } finally {
            setIsUpdating(false)
            setSelectedId(null)
        }
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-4 px-1">
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-indigo-500" />
                    등록된 결제 수단
                </h2>
                <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                    onClick={() => router.push('/my/payment/add')}
                >
                    <Plus className="w-4 h-4 mr-1" />
                    추가
                </Button>
            </div>

            <div className="space-y-3">
                {methods.length === 0 ? (
                    <div className="text-center py-8 bg-slate-50 dark:bg-slate-900 rounded-xl text-slate-500 text-sm border border-dashed border-slate-200 dark:border-slate-800">
                        등록된 결제 수단이 없습니다.
                    </div>
                ) : (
                    methods.map((method) => (
                        <div
                            key={method.id}
                            className={`
                                relative overflow-hidden rounded-xl border p-4 flex items-center gap-4 transition-all cursor-pointer group select-none
                                ${method.is_default
                                    ? 'bg-indigo-50/50 dark:bg-indigo-950/20 border-indigo-200 dark:border-indigo-900 ring-1 ring-indigo-500/10'
                                    : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-sm'}
                            `}
                            onClick={() => handleSelect(method.id, method.is_default)}
                        >
                            <div className={`w-12 h-8 rounded flex items-center justify-center text-[10px] font-bold shadow-inner shrink-0 ${method.is_default ? 'bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                                {method.card_company.slice(0, 4).toUpperCase()}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className={`font-medium truncate ${method.is_default ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-900 dark:text-slate-100'}`}>
                                    {method.card_alias}
                                </div>
                                <div className="text-xs text-slate-500 font-mono">
                                    **** **** **** {method.card_number_last4}
                                </div>
                            </div>

                            {method.is_default && (
                                <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 rounded-full border border-indigo-100 dark:border-indigo-800 shrink-0">
                                    기본
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <AlertDialog open={!!selectedId} onOpenChange={(o) => (!o && !isUpdating) && setSelectedId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>기본 결제 수단 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                            이 카드를 기본 결제 수단으로 설정하시겠습니까?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdating}>취소</AlertDialogCancel>
                        <AlertDialogAction onClick={(e) => { e.preventDefault(); handleConfirm(); }} disabled={isUpdating}>
                            {isUpdating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            확인
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </section>
    )
}
