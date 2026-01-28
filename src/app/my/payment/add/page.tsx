'use client'

import { useState } from 'react'
import { ChevronLeft } from 'lucide-react'
import Link from 'next/link'
import AddPaymentForm from '@/components/payment/AddPaymentForm'
import { useRouter } from 'next/navigation'
import { BackButton } from '@/components/common/BackButton'

export default function AddPaymentPage() {
    const router = useRouter()

    return (
        <div className="bg-slate-50 dark:bg-slate-950 min-h-full">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center h-14 px-4 max-w-2xl mx-auto">
                    <BackButton />
                    <h1 className="font-bold text-lg text-slate-900 dark:text-white ml-2">결제 수단 등록</h1>
                </div>
            </header>

            <div className="max-w-2xl mx-auto p-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <AddPaymentForm onSuccess={() => {
                    // 성공 시 결제 목록 페이지로 이동
                    router.push('/my/payment')
                    router.refresh()
                }} />
            </div>
        </div>
    )
}
