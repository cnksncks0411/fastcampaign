'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
    LayoutDashboard,
    Store,
    ShieldCheck,
    Coins,
    Megaphone,
    History,
    Menu,
    X
} from 'lucide-react'
import { useState } from 'react'

const navItems = [
    {
        href: '/owner',
        label: '대시보드',
        icon: LayoutDashboard,
        exact: true,
    },
    {
        href: '/owner/stores',
        label: '매장 관리',
        icon: Store,
    },
    {
        href: '/owner/verification',
        label: '사업주 인증',
        icon: ShieldCheck,
    },
    {
        href: '/owner/points',
        label: '포인트',
        icon: Coins,
    },
    {
        href: '/owner/campaigns',
        label: '캠페인',
        icon: Megaphone,
    },
    {
        href: '/owner/history',
        label: '이력/정산',
        icon: History,
    },
]

export function OwnerSidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-50 rounded-xl bg-white/80 backdrop-blur-sm p-2.5 shadow-lg lg:hidden"
            >
                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    'fixed left-0 top-0 z-40 h-full w-72 transform bg-white/95 backdrop-blur-xl shadow-2xl transition-transform duration-300 ease-in-out',
                    'lg:translate-x-0 lg:shadow-lg',
                    isOpen ? 'translate-x-0' : '-translate-x-full',
                    'dark:bg-slate-900/95'
                )}
            >
                {/* Logo */}
                <div className="flex h-16 items-center gap-3 border-b border-slate-200/50 px-6 dark:border-slate-700/50">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600">
                        <Megaphone className="h-5 w-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-900 dark:text-white">FastCampaign</h1>
                        <p className="text-xs text-slate-500">사업주 대시보드</p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const isActive = item.exact
                                ? pathname === item.href
                                : pathname.startsWith(item.href)
                            const Icon = item.icon

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={cn(
                                            'flex items-center gap-3 rounded-xl px-4 py-3 transition-all duration-200',
                                            isActive
                                                ? 'bg-gradient-to-r from-violet-500 to-indigo-500 text-white shadow-lg shadow-violet-500/25'
                                                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="font-medium">{item.label}</span>
                                    </Link>
                                </li>
                            )
                        })}
                    </ul>
                </nav>
            </aside>
        </>
    )
}
