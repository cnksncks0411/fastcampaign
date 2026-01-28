'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, AppWindow, ChevronLeft, Wallet } from 'lucide-react'
import { getPaymentMethods, chargePoint } from '@/app/my/payment/actions'
import AddPaymentForm from './AddPaymentForm'
import { cn } from '@/lib/utils'
import Link from 'next/link'

const AMOUNTS = [
    { value: 10000, label: '10,000원', bonus: 0 },
    { value: 30000, label: '30,000원', bonus: 0 },
    { value: 50000, label: '50,000원', bonus: 5000 },
    { value: 100000, label: '100,000원', bonus: 15000 },
]

export function PointChargeModal({
    isOpen,
    onClose,
    onSuccess
}: {
    isOpen: boolean,
    onClose: () => void,
    onSuccess?: (newBalance: number) => void
}) {
    const [step, setStep] = useState<'SELECT' | 'ADD_CARD'>('SELECT')
    const [paymentMethods, setPaymentMethods] = useState<any[]>([])
    const [selectedMethodId, setSelectedMethodId] = useState<string>('')
    const [selectedAmount, setSelectedAmount] = useState<number>(30000)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (isOpen && step === 'SELECT') {
            loadMethods()
        }
    }, [isOpen, step])

    async function loadMethods() {
        // 이미 로딩 중이면 스킵? 아니면 리프레시 필요.
        const methods = await getPaymentMethods()
        setPaymentMethods(methods)
        if (methods.length > 0 && !selectedMethodId) {
            // 기본 결제 수단이 있으면 선택 (is_default가 order by로 맨 위에 옴)
            setSelectedMethodId(methods[0].id)
        }
    }

    async function handleCharge() {
        if (!selectedMethodId) return alert('결제 수단을 선택해주세요.')

        const confirmMsg = `${selectedAmount.toLocaleString()}원을 결제하시겠습니까?`
        if (!confirm(confirmMsg)) return

        setIsLoading(true)
        try {
            const result = await chargePoint(selectedAmount)
            if (result.error) {
                alert(result.error)
            } else if (result.success) {
                alert('충전이 완료되었습니다.')
                if (onSuccess) onSuccess(result.newBalance)
                onClose()
            }
        } catch (e) {
            console.error(e)
            alert('충전 중 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
            <DialogContent className="max-w-md p-0 gap-0 bg-slate-50 dark:bg-slate-950 overflow-hidden border-none shadow-2xl z-[200]">
                {step === 'SELECT' ? (
                    <>
                        <DialogHeader className="p-5 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
                            <DialogTitle className="text-lg font-bold">포인트 충전</DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto max-h-[70vh] p-5 space-y-8">
                            {/* Payment Methods */}
                            <div className="space-y-3">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
                                        <CreditCard className="w-4 h-4 text-violet-500" /> 결제 수단
                                    </h3>
                                    <Link href="/my/payment" target="_blank" className="text-xs text-slate-400 hover:text-slate-800 transition-colors">관리 &gt;</Link>
                                </div>

                                <div className="space-y-2">
                                    {paymentMethods.length > 0 ? (
                                        paymentMethods.map(method => (
                                            <div
                                                key={method.id}
                                                onClick={() => setSelectedMethodId(method.id)}
                                                className={cn(
                                                    "p-4 rounded-xl border cursor-pointer flex items-center justify-between transition-all",
                                                    selectedMethodId === method.id
                                                        ? "bg-white border-violet-500 ring-1 ring-violet-500 shadow-sm"
                                                        : "bg-white border-slate-200 opacity-60 hover:opacity-100 hover:border-slate-300"
                                                )}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={cn("w-5 h-5 rounded-full border flex items-center justify-center transition-colors", selectedMethodId === method.id ? "border-violet-600 bg-violet-600" : "border-slate-300 bg-white")}>
                                                        {selectedMethodId === method.id && <div className="w-2 h-2 bg-white rounded-full" />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-sm text-slate-900 dark:text-slate-100">{method.card_alias}</div>
                                                        <div className="text-xs text-slate-400 font-mono mt-0.5">{method.card_number_last4 !== '----' ? `**** ${method.card_number_last4}` : '간편결제 연결됨'}</div>
                                                    </div>
                                                </div>
                                                {method.card_company === 'KAKAO' || method.card_company === 'NAVER' || method.card_company === 'TOSS' ? (
                                                    <span className="text-xs font-bold text-slate-400">{method.card_company}</span>
                                                ) : (
                                                    <CreditCard className="text-slate-300 w-5 h-5" />
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-4 text-sm text-slate-400 bg-white rounded-xl border border-dashed border-slate-200">
                                            등록된 결제 수단이 없습니다.
                                        </div>
                                    )}

                                    <button
                                        onClick={() => setStep('ADD_CARD')}
                                        className="w-full py-3 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-100 transition-colors flex items-center justify-center gap-2 group"
                                    >
                                        <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" /> 새 결제 수단 등록하기
                                    </button>
                                </div>
                            </div>

                            {/* Charge Amount */}
                            <div className="space-y-3">
                                <h3 className="font-bold text-slate-900 dark:text-white px-1 flex items-center gap-2 text-sm">
                                    <Wallet className="w-4 h-4 text-violet-500" /> 충전 금액
                                </h3>
                                <div className="grid grid-cols-2 gap-3">
                                    {AMOUNTS.map(amt => (
                                        <div
                                            key={amt.value}
                                            onClick={() => setSelectedAmount(amt.value)}
                                            className={cn(
                                                "p-4 rounded-xl border cursor-pointer text-center relative transition-all group hover:border-violet-300",
                                                selectedAmount === amt.value
                                                    ? "bg-white border-violet-500 ring-1 ring-violet-500 shadow-md transform scale-[1.02]"
                                                    : "bg-white border-slate-200"
                                            )}
                                        >
                                            {amt.bonus > 0 && <span className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm whitespace-nowrap">+{amt.bonus.toLocaleString()} 보너스</span>}
                                            <div className="font-bold text-slate-900 text-lg">{amt.value.toLocaleString()}원</div>
                                            <div className="text-xs text-slate-400 mt-1 font-medium group-hover:text-violet-500 transition-colors">{(amt.value + amt.bonus).toLocaleString()}P 충전</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-4 bg-white border-t border-slate-100 sticky bottom-0">
                            <Button onClick={handleCharge} disabled={isLoading || !selectedMethodId} className="w-full h-12 text-base font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg shadow-violet-200 dark:shadow-none transition-all active:scale-[0.98]">
                                {isLoading ? '충전 처리 중...' : `${selectedAmount.toLocaleString()}원 결제하기`}
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <DialogHeader className="p-4 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center gap-2 space-y-0 sticky top-0 z-10">
                            <Button variant="ghost" size="icon" onClick={() => setStep('SELECT')} className="-ml-2 hover:bg-slate-100 rounded-full w-8 h-8">
                                <ChevronLeft className="w-5 h-5" />
                            </Button>
                            <DialogTitle className="text-base font-bold">결제 수단 등록</DialogTitle>
                        </DialogHeader>
                        <div className="p-0 overflow-y-auto max-h-[70vh]">
                            <div className="p-4">
                                <AddPaymentForm onSuccess={() => { setStep('SELECT'); loadMethods(); }} />
                            </div>
                        </div>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}
