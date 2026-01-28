'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cancelApplicationById } from './actions'

interface CancelButtonProps {
    applicationId: string
}

export function CancelButton({ applicationId }: CancelButtonProps) {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()
    const [showConfirm, setShowConfirm] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleCancel = () => {
        setError(null)
        startTransition(async () => {
            const result = await cancelApplicationById(applicationId)
            if (result.error) {
                setError(result.error)
            } else if (result.success) {
                router.push('/')
                router.refresh()
            }
            setShowConfirm(false)
        })
    }

    if (showConfirm) {
        return (
            <div className="space-y-3">
                <p className="text-center text-sm text-slate-600 dark:text-slate-400">
                    정말 신청을 취소하시겠습니까?
                </p>
                {error && (
                    <p className="text-center text-sm text-red-500">{error}</p>
                )}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => setShowConfirm(false)}
                        disabled={isPending}
                    >
                        아니오
                    </Button>
                    <Button
                        variant="destructive"
                        className="flex-1"
                        onClick={handleCancel}
                        disabled={isPending}
                    >
                        {isPending ? '취소 중...' : '네, 취소합니다'}
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <Button
            variant="ghost"
            className="w-full text-slate-500 hover:text-red-500"
            onClick={() => setShowConfirm(true)}
        >
            <X className="h-4 w-4 mr-2" />
            신청 취소하기
        </Button>
    )
}
