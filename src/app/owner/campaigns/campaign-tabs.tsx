
'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

export function CampaignTabs() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // URL 파라미터가 없으면 기본값 'ACTIVE'
    const currentStatus = searchParams.get('status') === 'ENDED' ? 'ENDED' : 'ACTIVE'

    const handleTabClick = (status: 'ACTIVE' | 'ENDED') => {
        // 현재 상태와 다를 때만 이동 (불필요한 리프레시 방지)
        // router.replace를 사용하여 히스토리에 남기지 않음 (뒤로가기 시 이전 페이지로 이동)
        if (currentStatus !== status) {
            router.replace(`/owner/campaigns?status=${status}`, { scroll: false })
        }
    }

    return (
        <div className="bg-slate-100 dark:bg-slate-900/50 p-1 rounded-xl flex">
            <button
                onClick={() => handleTabClick('ACTIVE')}
                className={cn(
                    "flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all",
                    currentStatus === 'ACTIVE'
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                )}
            >
                진행중
            </button>
            <button
                onClick={() => handleTabClick('ENDED')}
                className={cn(
                    "flex-1 py-2.5 text-sm font-bold text-center rounded-lg transition-all",
                    currentStatus === 'ENDED'
                        ? "bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200 dark:ring-slate-700"
                        : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800/50"
                )}
            >
                종료됨
            </button>
        </div>
    )
}
