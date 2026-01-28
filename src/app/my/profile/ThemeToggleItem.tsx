'use client'

import React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { Switch } from '@/components/ui/switch'

export function ThemeToggleItem() {
    const { theme, toggleTheme, mounted } = useTheme()

    // Hydration mismatch 방지
    if (!mounted) {
        return (
            <div className="flex items-center gap-4 p-4 border-b border-slate-50">
                <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center">
                    <Moon className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                    <span className="font-medium text-slate-900 dark:text-slate-100">다크 모드</span>
                </div>
                <div className="w-10 h-6 bg-slate-200 rounded-full" />
            </div>
        )
    }

    const isDark = theme === 'dark'

    return (
        <div className="flex items-center gap-4 p-4 border-b border-slate-50 dark:border-slate-800">
            <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isDark ? 'bg-slate-800' : 'bg-slate-100'}`}>
                {isDark ? (
                    <Moon className="h-5 w-5 text-violet-400" />
                ) : (
                    <Sun className="h-5 w-5 text-amber-500" />
                )}
            </div>
            <div className="flex-1">
                <span className="font-medium text-slate-900 dark:text-slate-100">다크 모드</span>
            </div>
            <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                className="data-[state=checked]:bg-violet-600"
            />
        </div>
    )
}
