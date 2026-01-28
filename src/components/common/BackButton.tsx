'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function BackButton() {
    const router = useRouter()

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="mr-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors"
        >
            <ArrowLeft className="h-5 w-5" />
        </Button>
    )
}
