
'use client'

import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

export default function BackButton({ className }: { className?: string }) {
    const router = useRouter()

    return (
        <button
            onClick={() => router.back()}
            className={`mr-4 p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors ${className}`}
            aria-label="Go back"
        >
            <ArrowLeft className="h-5 w-5" />
        </button>
    )
}
