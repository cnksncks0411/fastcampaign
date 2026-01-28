'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Map, Ticket, User, Home } from 'lucide-react'
import { cn } from '@/lib/utils'

export function BottomNav() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200/60 dark:border-slate-800 pb-safe shadow-[0_-5px_10px_rgba(0,0,0,0.02)]">
            <div className="flex h-14 items-end justify-around px-6 max-w-md mx-auto relative">

                {/* 이용권 */}
                <Link
                    href="/my/tickets"
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center pb-2 transition-colors",
                        pathname.startsWith('/my/tickets') ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-600"
                    )}
                >
                    <Ticket className="h-6 w-6 stroke-[1.5px] mb-1" />
                    <span className="text-[10px] font-medium">이용권</span>
                </Link>

                {/* 지도 (중앙 강조 - Floating 느낌) */}
                <div className="relative -top-5 pb-[7px]">
                    <Link
                        href="/"
                        className={cn(
                            "flex flex-col items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform active:scale-95",
                            pathname === '/'
                                ? "bg-slate-900 text-white shadow-slate-900/30 dark:bg-slate-100 dark:text-slate-900"
                                : "bg-white text-slate-400 border border-slate-100 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-500"
                        )}
                    >
                        <Map className="h-6 w-6 stroke-[2px]" />
                    </Link>
                    <span className="text-[10px] font-medium text-slate-900 dark:text-slate-100 absolute -bottom-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        지도
                    </span>
                </div>

                {/* 마이 */}
                <Link
                    href="/my/profile"
                    className={cn(
                        "flex flex-1 flex-col items-center justify-center pb-2 transition-colors",
                        pathname.startsWith('/my/profile') || pathname.startsWith('/my/settings')
                            ? "text-slate-900 dark:text-slate-100"
                            : "text-slate-400 dark:text-slate-600"
                    )}
                >
                    <User className="h-6 w-6 stroke-[1.5px] mb-1" />
                    <span className="text-[10px] font-medium">마이</span>
                </Link>
            </div>
        </nav>
    )
}
