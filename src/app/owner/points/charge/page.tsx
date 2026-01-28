'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Check, CreditCard, ShieldCheck, Wallet, Plus, CreditCard as CardIcon, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { BackButton } from '@/components/common/BackButton'
import { cn } from '@/lib/utils'
import { chargePoints } from '../../actions'
import Link from 'next/link'

const CHARGE_OPTIONS = [
    { amount: 10000, bonus: 0 },
    { amount: 30000, bonus: 0 },
    { amount: 50000, bonus: 5000 },
    { amount: 100000, bonus: 15000 },
]

// Mock Payment Methods
const MOCK_PAYMENT_METHODS = [
    { id: 'card_1', name: '현대카드', number: '**** 1234', type: 'CARD' },
    { id: 'card_2', name: '신한카드', number: '**** 5678', type: 'CARD' },
]

export default function ChargePage() {
    const router = useRouter()
    const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
    const [selectedMethod, setSelectedMethod] = useState<string>(MOCK_PAYMENT_METHODS[0].id)
    const [isProcessing, setIsProcessing] = useState(false)

    const handleCharge = async () => {
        if (!selectedAmount || !selectedMethod) return

        setIsProcessing(true)
        try {
            // In a real app, this would trigger a PG payment with selectedMethod
            const res = await chargePoints(selectedAmount)
            if (res.error) {
                alert(res.error)
                setIsProcessing(false)
            } else {
                router.push('/owner/points')
            }
        } catch (e) {
            console.error(e)
            alert('충전 중 오류가 발생했습니다.')
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">포인트 충전</h1>
            </header>

            <div className="p-5 max-w-lg mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-6">

                {/* 1. Payment Method Selection */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-violet-600" />
                            결제 수단
                        </h2>
                        <Link href="/my/payment" className="text-xs text-slate-500 font-medium flex items-center hover:text-violet-600 transition-colors">
                            관리 <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {MOCK_PAYMENT_METHODS.map((method) => (
                            <div
                                key={method.id}
                                onClick={() => setSelectedMethod(method.id)}
                                className={cn(
                                    "flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all",
                                    selectedMethod === method.id
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/10"
                                        : "border-slate-100 dark:border-slate-800 hover:border-violet-100"
                                )}
                            >
                                <div className={cn(
                                    "w-5 h-5 rounded-full border flex items-center justify-center",
                                    selectedMethod === method.id ? "border-violet-600 bg-violet-600" : "border-slate-300"
                                )}>
                                    {selectedMethod === method.id && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{method.name}</div>
                                    <div className="text-xs text-slate-500">{method.number}</div>
                                </div>
                                <CardIcon className="w-5 h-5 text-slate-400" />
                            </div>
                        ))}

                        <Button variant="outline" className="w-full h-12 rounded-2xl border-dashed border-2 border-slate-200 text-slate-500 hover:border-violet-300 hover:text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/10 transition-colors" asChild>
                            <Link href="/my/payment/add">
                                <Plus className="w-4 h-4 mr-2" /> 새 카드 등록하기
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* 2. Amount Selection */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
                        <Wallet className="w-5 h-5 text-violet-600" />
                        충전 금액
                    </h2>

                    <div className="grid grid-cols-2 gap-x-3 gap-y-6 pt-2">
                        {CHARGE_OPTIONS.map((option) => (
                            <div
                                key={option.amount}
                                onClick={() => setSelectedAmount(option.amount)}
                                className={cn(
                                    "relative cursor-pointer rounded-2xl border-2 p-4 text-center transition-all duration-200",
                                    selectedAmount === option.amount
                                        ? "border-violet-600 bg-violet-50 dark:bg-violet-900/20"
                                        : "border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-violet-200"
                                )}
                            >
                                {option.bonus > 0 && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap z-10">
                                        +{option.bonus.toLocaleString()}P 보너스
                                    </div>
                                )}
                                <div className={cn(
                                    "text-lg font-bold mb-1",
                                    selectedAmount === option.amount ? "text-violet-700 dark:text-violet-300" : "text-slate-900 dark:text-white"
                                )}>
                                    {option.amount.toLocaleString()}원
                                </div>
                                <div className="text-xs text-slate-500">
                                    {(option.amount + option.bonus).toLocaleString()}P 충전
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-slate-100 dark:bg-slate-900 p-4 rounded-xl flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-slate-500 mt-0.5 shrink-0" />
                        <div className="text-xs text-slate-500 leading-relaxed">
                            <p className="font-bold text-slate-700 dark:text-slate-300 mb-1">안내사항</p>
                            • 포인트는 결제 즉시 충전되며 바로 사용 가능합니다.<br />
                            • 이벤트로 지급된 추가 포인트는 환불되지 않습니다.<br />
                            • 충전 후 7일 이내 사용하지 않은 포인트는 전액 환불 가능합니다.
                        </div>
                    </div>

                    <Button
                        size="lg"
                        className="w-full h-14 text-lg font-bold bg-violet-600 hover:bg-violet-700 rounded-xl shadow-xl shadow-violet-200 dark:shadow-none"
                        disabled={!selectedAmount || !selectedMethod || isProcessing}
                        onClick={handleCharge}
                    >
                        {isProcessing ? '처리중...' : selectedAmount ? `${selectedAmount.toLocaleString()}원 결제하기` : '금액을 선택해주세요'}
                    </Button>
                </div>
            </div>
        </div>
    )
}
