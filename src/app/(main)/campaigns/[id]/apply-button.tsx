'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Users, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { applyToCampaign } from '../actions'

interface ApplyButtonProps {
    campaignId: string
    spotsLeft: number
    isFull: boolean
    isApplied: boolean
}

export function ApplyButton({ campaignId, spotsLeft, isFull, isApplied }: ApplyButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const handleApply = () => {
        setError(null)
        startTransition(async () => {
            const result = await applyToCampaign(campaignId)
            if (result.error) {
                setError(result.error)
            } else if (result.success) {
                setSuccess(true)
                router.refresh()
                // 슬라이드(페이지) 닫기 효과를 위해 뒤로가기
                setTimeout(() => {
                    router.back()
                }, 500)
            }
        })
    }

    if (success || isApplied) {
        return (
            <Button size="lg" className="w-full h-14 text-lg font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400" disabled>
                ✓ 이미 신청한 캠페인입니다
            </Button>
        )
    }

    return (
        <div className="flex-1 space-y-2">
            {error && (
                <p className="text-sm text-red-500 text-center">{error}</p>
            )}
            <Button
                size="lg"
                className="w-full h-14 text-lg font-bold rounded-xl bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500 shadow-lg shadow-violet-200 dark:shadow-none transition-all duration-200 active:scale-95"
                onClick={handleApply}
                disabled={isPending || isFull}
            >
                {isPending ? (
                    <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        신청 중...
                    </>
                ) : isFull ? (
                    '마감되었습니다'
                ) : (
                    <>
                        <Users className="h-5 w-5 mr-2" />
                        신청하기 ({spotsLeft}자리 남음)
                    </>
                )}
            </Button>
        </div>
    )
}
