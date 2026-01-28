'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Megaphone, Loader2, ArrowLeft, Mail, Smartphone, Lock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { verifyUserAndResetPassword, sendVerificationCode as sendCodeAction } from '../actions' // 액션 필요
import { useRouter } from 'next/navigation'

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [step, setStep] = useState<1 | 2>(1) // 1: 본인확인, 2: 비밀번호 변경
    const [isLoading, setIsLoading] = useState(false)

    // 본인확인 State
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isCodeSent, setIsCodeSent] = useState(false) // 인증번호 발송 여부
    const [isVerified, setIsVerified] = useState(false) // 인증 완료 여부

    // 비밀번호 변경 State
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // 유효성 검사
    const isPasswordMatch = password && confirmPassword && password === confirmPassword
    const isPasswordMismatch = password && confirmPassword && password !== confirmPassword

    // 1. 인증번호 전송 (Mock) - 회원가입 로직 재사용
    const handleSendCode = async () => {
        if (!phone || phone.length < 10) {
            alert('휴대폰 번호를 올바르게 입력해주세요')
            return
        }
        setIsLoading(true)
        try {
            // 이메일도 함께 전달하여 매칭 확인
            const res = await import('../actions').then(mod => mod.sendVerificationCode(phone, email))
            if (res.success) {
                setIsCodeSent(true)
                alert('인증번호가 발송되었습니다. (테스트용: 123456)')
            } else {
                alert(res.error || '인증번호 발송 실패')
            }
        } catch (e) {
            alert('인증번호 발송 오류')
        } finally {
            setIsLoading(false)
        }
    }

    // 2. 인증번호 확인 (Mock)
    const handleVerifyCode = async () => {
        setIsLoading(true)
        try {
            const res = await import('../actions').then(mod => mod.verifyPhoneCode(phone, verificationCode))
            if (res.success) {
                setIsVerified(true)
                alert('인증되었습니다.')
            } else {
                alert('인증번호가 올바르지 않습니다.')
            }
        } catch (e) {
            alert('인증 오류')
        } finally {
            setIsLoading(false)
        }
    }

    // 3. 비밀번호 변경 요청 (최종 제출)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isVerified) {
            alert('휴대폰 인증을 완료해주세요.')
            return
        }
        if (!isPasswordMatch) {
            alert('비밀번호가 일치하지 않습니다.')
            return
        }

        setIsLoading(true)
        try {
            // 서버 액션 호출 (이메일, 폰번호, 새 비밀번호 전달)
            const res = await verifyUserAndResetPassword({ email, phone, password })

            if (res.success) {
                alert('비밀번호가 성공적으로 변경되었습니다. 로그인 페이지로 이동합니다.')
                router.push('/login')
            } else {
                alert(res.error || '비밀번호 변경 실패')
            }
        } catch (e) {
            alert('서버 오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-8">
            <div className="w-full max-w-[400px] animate-fade-in space-y-8">
                {/* 로고 영역 */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-violet-500/10 mb-2 ring-1 ring-slate-100 dark:ring-slate-800">
                        <Lock className="h-7 w-7 text-violet-600 dark:text-violet-400" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        비밀번호 재설정
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {step === 1 ? '본인 확인을 위해 정보를 입력해주세요' : '새로운 비밀번호를 입력해주세요'}
                    </p>
                </div>

                <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 bg-white ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden rounded-3xl">
                    <CardHeader className="sr-only">
                        <CardTitle>비밀번호 변경</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Step 1: 본인 확인 */}
                            {step === 1 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="email" className="text-xs font-bold text-slate-500 ml-1">이메일</Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="가입한 이메일 입력"
                                            className="h-12 rounded-xl"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="phone" className="text-xs font-bold text-slate-500 ml-1">휴대폰 번호</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="phone"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="01012345678"
                                                className="h-12 rounded-xl"
                                                required
                                                readOnly={isVerified}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleSendCode}
                                                className="h-12 w-24 rounded-xl whitespace-nowrap"
                                                disabled={isVerified || isCodeSent || !phone}
                                            >
                                                인증요청
                                            </Button>
                                        </div>
                                    </div>
                                    {isCodeSent && !isVerified && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                                            <Label htmlFor="code" className="text-xs font-bold text-slate-500 ml-1">인증번호</Label>
                                            <div className="flex gap-2">
                                                <Input
                                                    id="code"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="123456"
                                                    className="h-12 rounded-xl"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyCode}
                                                    className="h-12 w-24 rounded-xl"
                                                    variant="outline"
                                                >
                                                    확인
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                    {isVerified && (
                                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2">
                                            <Check className="h-4 w-4" />
                                            본인 인증 완료
                                        </div>
                                    )}

                                    <Button
                                        type="button"
                                        className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white mt-4"
                                        disabled={!isVerified}
                                        onClick={() => setStep(2)}
                                    >
                                        다음 단계로
                                    </Button>
                                </div>
                            )}

                            {/* Step 2: 비밀번호 변경 */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in slide-in-from-right-4">
                                    <div className="space-y-1.5">
                                        <Label htmlFor="password" className="text-xs font-bold text-slate-500 ml-1">새 비밀번호</Label>
                                        <Input
                                            id="password"
                                            type="password"
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                            className="h-12 rounded-xl"
                                            required
                                            minLength={8}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label htmlFor="confirmPassword" className="text-xs font-bold text-slate-500 ml-1">비밀번호 확인</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="비밀번호 확인"
                                            className={`h-12 rounded-xl ${isPasswordMatch ? 'border-emerald-500 ring-1 ring-emerald-500' :
                                                isPasswordMismatch ? 'border-red-500 ring-1 ring-red-500' : ''
                                                }`}
                                            required
                                            minLength={8}
                                        />
                                        <div className="text-xs text-right h-4">
                                            {isPasswordMatch && <span className="text-emerald-600 font-medium flex items-center justify-end gap-1"><Check className="h-3 w-3" /> 일치합니다</span>}
                                            {isPasswordMismatch && <span className="text-red-500 font-medium">일치하지 않습니다</span>}
                                        </div>
                                    </div>

                                    <Button
                                        type="submit"
                                        className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 font-bold text-white shadow-lg shadow-violet-500/30"
                                        disabled={isLoading || !isPasswordMatch}
                                    >
                                        {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : '비밀번호 변경하기'}
                                    </Button>

                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="w-full text-xs text-slate-400 hover:text-slate-600 mt-2"
                                    >
                                        이전 단계로
                                    </button>
                                </div>
                            )}
                        </form>
                    </CardContent>
                </Card>

                {/* 하단 링크 */}
                <div className="text-center">
                    <Link href="/login" className="inline-flex items-center text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 font-medium transition-colors">
                        <ArrowLeft className="h-4 w-4 mr-1" />
                        로그인 페이지로 돌아가기
                    </Link>
                </div>
            </div>
        </div>
    )
}
