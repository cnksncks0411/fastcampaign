'use client'

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export function ModalWrapper({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    // Disable body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden'
        return () => {
            document.body.style.overflow = 'unset'
        }
    }, [])

    return (
        <div className="fixed inset-0 z-[100] flex justify-center items-end sm:items-center">
            {/* Backdrop */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => router.back()}
            />

            {/* Content Container */}
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="relative w-full h-[92dvh] sm:h-[85vh] sm:max-w-xl bg-white dark:bg-slate-950 sm:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl isolate transform-gpu"
            >
                <div className="h-full overflow-y-auto scrollbar-hide [&>div]:!bg-transparent [&>div]:!min-h-0">
                    {children}
                </div>
            </motion.div>
        </div>
    )
}
