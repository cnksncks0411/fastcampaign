'use client'

import { useState } from 'react'
import { Switch } from '@/components/ui/switch'
import { Bell } from 'lucide-react'
import { toggleNotification } from './actions'

export function NotificationToggle({
    initialValue, user_id
}: {
    initialValue: boolean, user_id: string
}) {
    const [isOn, setIsOn] = useState(initialValue)
    const [isLoading, setIsLoading] = useState(false)

    const handleToggle = async (checked: boolean) => {
        setIsLoading(true)

        if (checked) {
            if (typeof window !== 'undefined' && 'Notification' in window) {
                if (Notification.permission !== 'granted') {
                    try {
                        const permission = await Notification.requestPermission()
                        if (permission !== 'granted') {
                            alert('알림을 받으려면 브라우저 설정에서 알림 권한을 허용해야 합니다.')
                            setIsLoading(false)
                            return
                        }
                    } catch (e) {
                        console.error('Notification permission request failed', e)
                    }
                }
            }
        }

        // Optimistic UI
        const nextState = checked
        setIsOn(nextState)

        try {
            const result = await toggleNotification(user_id)
            if (result?.error) {
                // Rollback
                setIsOn(!nextState)
                alert(`설정 변경 실패: ${result.error}`)
            } else if (result?.success) {
                setIsOn(result.newState)
            }
        } catch (e) {
            console.error(e)
            setIsOn(!nextState)
            alert('설정 변경에 실패했습니다.')
        } finally {
            setIsLoading(false)
        }
    }


    return (
        <div className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800 select-none">
            <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-colors ${isOn ? 'bg-violet-50 dark:bg-violet-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                    <Bell className={`h-5 w-5 transition-colors ${isOn ? 'text-violet-500' : 'text-slate-400'}`} />
                </div>
                <div className="flex flex-col">
                    <span className="font-medium text-slate-900 dark:text-slate-100">알림 설정</span>
                    <span className={`text-xs transition-colors ${isOn ? 'text-violet-600 dark:text-violet-400' : 'text-slate-500'}`}>
                        {isOn ? '중요한 알림을 받아요' : '알림이 꺼져있어요'}
                    </span>
                </div>
            </div>
            <div className="flex items-center gap-2">
                {isLoading && <span className="text-xs text-slate-400 animate-pulse">저장 중...</span>}
                <Switch
                    checked={isOn}
                    onCheckedChange={handleToggle}
                    disabled={isLoading}
                    className="data-[state=checked]:bg-violet-600 data-[state=unchecked]:bg-slate-200 dark:data-[state=unchecked]:bg-slate-700"
                />
            </div>
        </div>
    )
}
