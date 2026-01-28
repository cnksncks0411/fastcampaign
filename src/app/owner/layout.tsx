
import React from 'react'

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="fixed inset-0 z-[100] bg-slate-50 dark:bg-slate-950 overflow-y-auto scrollbar-hide">
            <div className="min-h-full">
                {children}
            </div>
        </div>
    )
}
