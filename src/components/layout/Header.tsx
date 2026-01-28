'use client'

import Link from 'next/link'
import { MapPin, Bell } from 'lucide-react'

interface HeaderProps {
    title?: string
    showLocation?: boolean
    showNotification?: boolean
}

export function Header({ title, showLocation = true, showNotification = true }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl dark:border-slate-700/50 dark:bg-slate-900/80">
            <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
                {/* Left: Location or Title */}
                {title ? (
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
                ) : showLocation ? (
                    <button className="flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300">
                        <MapPin className="h-4 w-4 text-violet-500" />
                        <span>서울시 강남구</span>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </button>
                ) : (
                    <div />
                )}

                {/* Right: Notification */}
                {showNotification && (
                    <Link
                        href="/notifications"
                        className="relative rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                        <Bell className="h-5 w-5" />
                        {/* Notification Badge */}
                        <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
                    </Link>
                )}
            </div>
        </header>
    )
}
