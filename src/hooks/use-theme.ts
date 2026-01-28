'use client'

import { useEffect, useState } from 'react'

export function useTheme() {
    const [theme, setTheme] = useState<'light' | 'dark'>('light')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const savedTheme = localStorage.getItem('theme')
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

        if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
            setTheme('dark')
            document.documentElement.classList.add('dark')
        } else {
            setTheme('light')
            document.documentElement.classList.remove('dark')
        }
    }, [])

    const toggleTheme = () => {
        if (theme === 'light') {
            setTheme('dark')
            document.documentElement.classList.add('dark')
            localStorage.setItem('theme', 'dark')
        } else {
            setTheme('light')
            document.documentElement.classList.remove('dark')
            localStorage.setItem('theme', 'light')
        }
    }

    return { theme, toggleTheme, mounted }
}
