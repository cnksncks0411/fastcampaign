'use client'

import { useRouter } from 'next/navigation'
import { Share2, X } from 'lucide-react'

export function CampaignDetailHeader() {
    const router = useRouter()

    return (
        <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-3 dark:border-slate-800/50 dark:bg-slate-900/80">
            <button
                onClick={() => router.back()}
                className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                aria-label="뒤로가기"
            >
                <X className="h-6 w-6 text-slate-900 dark:text-slate-100" />
            </button>
            <div className="flex items-center gap-2">
                <button className="rounded-full p-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <Share2 className="h-5 w-5 text-slate-900 dark:text-slate-100" />
                </button>
            </div>
        </div>
    )
}
