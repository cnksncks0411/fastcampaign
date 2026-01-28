
'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface StoreAddButtonProps {
    currentCount: number
    limit: number
    plan: string
}

export function StoreAddButton({ currentCount, limit, plan }: StoreAddButtonProps) {
    const router = useRouter()
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const handleAddClick = () => {
        if (currentCount >= limit) {
            setShowUpgradeModal(true)
        } else {
            router.push('/owner/register-store')
        }
    }

    // Portal Modal UI
    const modalContent = (
        <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/60 backdrop-blur-sm" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">

                {/* Modal Panel */}
                <div className="relative transform overflow-hidden rounded-2xl bg-white dark:bg-slate-900 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-5xl border border-slate-200 dark:border-slate-800">

                    {/* Close Button */}
                    <div className="absolute top-4 right-4 z-10">
                        <button
                            onClick={() => setShowUpgradeModal(false)}
                            className="rounded-full bg-slate-100 p-2 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-500" />
                        </button>
                    </div>

                    {/* Modal Header */}
                    <div className="bg-slate-50 dark:bg-slate-800/50 p-6 sm:p-8 text-center border-b border-slate-100 dark:border-slate-800">
                        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2" id="modal-title">
                            구독 플랜 안내
                        </h2>
                        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
                            현재 이용 중인 <span className="font-bold text-violet-600 px-1">{plan}</span> 플랜은 매장을 최대 <span className="font-bold text-slate-900 dark:text-white">{limit}개</span>까지 등록할 수 있습니다.
                        </p>
                    </div>

                    {/* Modal Body */}
                    <div className="p-6 sm:p-10 bg-white dark:bg-slate-900">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                            {/* Starter */}
                            <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-slate-300 transition-colors">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">STARTER</h3>
                                    <p className="mt-1 text-xs text-slate-500">소규모 사업장 운영 사장님</p>
                                </div>
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">29,800원</span>
                                    <span className="ml-1 text-sm font-semibold text-slate-500">/월</span>
                                </div>
                                <ul role="list" className="mb-6 space-y-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-slate-400">•</span>
                                        매장 최대 5개
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-slate-400">•</span>
                                        매장별 1 계정 연동
                                    </li>
                                </ul>
                                <Button variant="outline" className="w-full" disabled>준비 중</Button>
                            </div>

                            {/* Pro */}
                            <div className="relative flex flex-col rounded-2xl border-2 border-violet-600 bg-violet-50/10 p-6 shadow-xl z-10 md:-mt-4 md:mb-4">
                                <div className="absolute top-0 right-0 -mt-3 mr-3 px-3 py-1 text-xs font-semibold text-white bg-violet-600 rounded-full uppercase tracking-wide shadow-sm">
                                    Popular
                                </div>
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-violet-600 dark:text-violet-400">PRO</h3>
                                    <p className="mt-1 text-xs text-slate-500">본격적인 마케팅이 필요한 분</p>
                                </div>
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white">59,800원</span>
                                    <span className="ml-1 text-sm font-semibold text-slate-500">/월</span>
                                </div>
                                <ul role="list" className="mb-6 space-y-3 flex-1 text-sm font-medium text-slate-900 dark:text-slate-300">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-violet-500">•</span>
                                        매장 최대 20개
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-violet-500">•</span>
                                        매장별 계정 3개 연동 지원
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-violet-500">•</span>
                                        우선 노출 지원
                                    </li>
                                </ul>
                                <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 shadow-lg shadow-violet-200 dark:shadow-none" onClick={() => window.location.href = 'mailto:contact@fastcampaign.com?subject=PRO플랜 문의'}>문의하기</Button>
                            </div>

                            {/* Enterprise */}
                            <div className="flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:border-slate-300 transition-colors">
                                <div className="mb-4">
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">ENTERPRISE</h3>
                                    <p className="mt-1 text-xs text-slate-500">프렌차이즈 및 대형 기업</p>
                                </div>
                                <div className="mb-6 flex items-baseline">
                                    <span className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">문의</span>
                                    <span className="ml-1 text-sm font-semibold text-slate-500">/협의</span>
                                </div>
                                <ul role="list" className="mb-6 space-y-3 flex-1 text-sm text-slate-600 dark:text-slate-400">
                                    <li className="flex items-start">
                                        <span className="mr-2 text-slate-400">•</span>
                                        매장/계정 무제한 연동
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-slate-400">•</span>
                                        분석 리포트 제공
                                    </li>
                                    <li className="flex items-start">
                                        <span className="mr-2 text-slate-400">•</span>
                                        별도 노출 등 지원
                                    </li>
                                </ul>
                                <Button variant="outline" className="w-full" onClick={() => window.location.href = 'mailto:contact@fastcampaign.com?subject=Enterprise 문의'}>제휴 문의</Button>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    )

    return (
        <>
            <Button onClick={handleAddClick} className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-lg shadow-slate-200 dark:shadow-none transition-transform hover:scale-105 active:scale-95">
                <Plus className="w-4 h-4 mr-2" /> 매장 추가
            </Button>

            {/* Render Modal via Portal */}
            {mounted && showUpgradeModal && createPortal(modalContent, document.body)}
        </>
    )
}
