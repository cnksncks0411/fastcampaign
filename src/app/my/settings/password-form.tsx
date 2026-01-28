'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { updatePassword } from './password-action'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Lock, Check } from 'lucide-react'

type FormState = {
    message: string
    error: string
    success: boolean
}

const initialState: FormState = {
    message: '',
    error: '',
    success: false
}

function SubmitButton() {
    const { pending } = useFormStatus()

    return (
        <Button
            type="submit"
            className="w-full bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-bold h-12 rounded-xl"
            disabled={pending}
        >
            {pending ? '변경 중...' : '비밀번호 변경하기'}
        </Button>
    )
}

export function PasswordForm() {
    const [state, formAction] = useFormState(updatePassword, initialState)
    const [isOpen, setIsOpen] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const isPasswordMatch = password && confirmPassword && password === confirmPassword
    const isPasswordMismatch = password && confirmPassword && password !== confirmPassword

    useEffect(() => {
        if (state.success) {
            setIsOpen(false) // 성공하면 닫기
            alert('비밀번호가 변경되었습니다.')
        }
    }, [state.success])

    return (
        <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between text-left group"
            >
                <div className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                    <span className="font-bold text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-slate-100 transition-colors">비밀번호 변경</span>
                </div>
                {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-slate-400" />
                ) : (
                    <ChevronDown className="h-4 w-4 text-slate-400" />
                )}
            </button>

            {isOpen && (
                <form action={formAction} className="mt-4 space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-slate-900 dark:text-slate-100 text-sm font-bold">새 비밀번호</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="8자 이상, 영문/숫자/특수문자 포함"
                            className="h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-violet-500"
                            required
                            minLength={8}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="confirmPassword" className="text-slate-900 dark:text-slate-100 text-sm font-bold">비밀번호 확인</Label>
                        <Input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="비밀번호 확인"
                            className={`h-12 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:border-violet-500 ${isPasswordMatch ? 'border-emerald-500 ring-1 ring-emerald-500' :
                                isPasswordMismatch ? 'border-red-500 ring-1 ring-red-500' : ''
                                }`}
                            required
                            minLength={8}
                        />
                        {/* 비밀번호 일치 메시지 */}
                        <div className="text-xs text-right h-4">
                            {isPasswordMatch && <span className="text-emerald-600 font-medium flex items-center justify-end gap-1"><Check className="h-3 w-3" /> 비밀번호가 일치합니다</span>}
                            {isPasswordMismatch && <span className="text-red-500 font-medium">비밀번호가 일치하지 않습니다</span>}
                        </div>
                    </div>

                    {state.error && (
                        <p className="text-sm text-red-500 font-medium text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
                            {state.error}
                        </p>
                    )}

                    <div className="pt-2">
                        <SubmitButton />
                    </div>
                </form>
            )}
        </div>
    )
}
