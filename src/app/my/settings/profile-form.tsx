'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updateProfile, checkNicknameAvailability } from './actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useEffect, useState } from 'react'
import { Check, X, Loader2, AlertCircle } from 'lucide-react'

type FormState = {
    message: string
    error: string
    success: boolean
    newAvatarUrl: string | null
}

const initialState: FormState = {
    message: '',
    error: '',
    success: false,
    newAvatarUrl: null
}

function SubmitButton({ disabled }: { disabled: boolean }) {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold h-12 rounded-xl disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500"
            disabled={pending || disabled}
        >
            {pending ? '저장 중...' : '저장하기'}
        </Button>
    )
}

export function ProfileForm({
    initialData,
    email
}: {
    initialData: { nickname: string, avatarUrl?: string },
    email: string
}) {
    const [state, formAction] = useFormState(updateProfile, initialState)

    // 닉네임 중복 확인 상태 관리
    const [nickname, setNickname] = useState(initialData.nickname)
    const [isChecking, setIsChecking] = useState(false)
    const [checkStatus, setCheckStatus] = useState<'idle' | 'available' | 'unavailable' | 'error'>('idle')
    const [checkMessage, setCheckMessage] = useState('')

    // 초기 닉네임과 같다면 이미 검증된 것으로 간주 (단, 변경 시 초기화)
    const isInitialNickname = nickname === initialData.nickname

    useEffect(() => {
        if (state.success) {
            // 성공 시 상태 업데이트 (필요하다면)
        }
    }, [state.success])

    const handleNicknameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setNickname(value)

        if (value === initialData.nickname) {
            setCheckStatus('idle')
            setCheckMessage('')
        } else {
            setCheckStatus('idle')
            setCheckMessage('')
        }
    }

    const handleCheckNickname = async () => {
        if (!nickname || nickname.length < 2) {
            setCheckStatus('error')
            setCheckMessage('닉네임은 2자 이상이어야 합니다.')
            return
        }

        setIsChecking(true)
        setCheckMessage('')

        try {
            const result = await checkNicknameAvailability(nickname)
            if (result.available) {
                setCheckStatus('available')
                setCheckMessage(result.message || '사용 가능한 닉네임입니다.')
            } else {
                setCheckStatus('unavailable')
                setCheckMessage(result.message || result.error || '사용할 수 없는 닉네임입니다.')
            }
        } catch (error) {
            setCheckStatus('error')
            setCheckMessage('확인 중 오류가 발생했습니다.')
        } finally {
            setIsChecking(false)
        }
    }

    // 저장 버튼 활성화 조건:
    // 1. 초기 닉네임과 같거나 (변경 안 함)
    // 2. 닉네임이 변경되었고 && 중복 확인 결과 'available' 상태여야 함
    const canSubmit = isInitialNickname || checkStatus === 'available'

    return (
        <form action={formAction} className="space-y-6">
            <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-500 font-medium text-sm">이메일</Label>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-500 text-sm font-medium border border-slate-200 dark:border-slate-700">
                    {email}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="nickname" className="text-slate-900 dark:text-slate-100 font-bold">닉네임</Label>
                <div className="flex gap-2">
                    <Input
                        id="nickname"
                        name="nickname"
                        value={nickname}
                        onChange={handleNicknameChange}
                        placeholder="활동할 닉네임을 입력하세요"
                        className={`h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-violet-500 flex-1 ${checkStatus === 'unavailable' || checkStatus === 'error' ? 'border-red-300 focus:border-red-500' : ''
                            }`}
                        required
                    />
                    <Button
                        type="button"
                        variant="outline"
                        onClick={handleCheckNickname}
                        disabled={isChecking || !nickname || nickname === initialData.nickname || checkStatus === 'available'}
                        className="h-12 px-4 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 whitespace-nowrap"
                    >
                        {isChecking ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : checkStatus === 'available' ? (
                            <span className="text-green-600 font-bold text-xs">확인 완료</span>
                        ) : (
                            '중복확인'
                        )}
                    </Button>
                </div>

                {/* 상태 메시지 */}
                <div className="min-h-[20px] px-1">
                    {checkStatus === 'available' && (
                        <p className="text-xs text-green-600 flex items-center gap-1">
                            <Check className="h-3 w-3" />
                            {checkMessage}
                        </p>
                    )}
                    {(checkStatus === 'unavailable' || checkStatus === 'error') && (
                        <p className="text-xs text-red-500 flex items-center gap-1">
                            <X className="h-3 w-3" />
                            {checkMessage}
                        </p>
                    )}
                    {checkStatus === 'idle' && !isInitialNickname && nickname.length > 0 && (
                        <p className="text-xs text-slate-400 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            닉네임 중복 확인이 필요합니다
                        </p>
                    )}
                </div>
            </div>

            {state.error && (
                <p className="text-sm text-red-500 font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                    {state.error}
                </p>
            )}

            {state.success && (
                <p className="text-sm text-green-600 font-medium text-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg animate-in fade-in slide-in-from-top-1">
                    {state.message}
                </p>
            )}

            <div className="pt-4">
                <SubmitButton disabled={!canSubmit} />
            </div>
        </form>
    )
}
