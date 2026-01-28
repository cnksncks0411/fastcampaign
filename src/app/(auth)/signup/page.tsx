'use client'

import { useActionState, useState, useRef } from 'react'
import Link from 'next/link'
import { Megaphone, Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { signUp, type AuthState } from '../actions'

const initialState: AuthState = {}

export default function SignupPage() {
    const [state, formAction, isPending] = useActionState(signUp, initialState)
    const nameRef = useRef<HTMLInputElement>(null)
    const emailRef = useRef<HTMLInputElement>(null)
    const phoneRef = useRef<HTMLInputElement>(null)
    const codeRef = useRef<HTMLInputElement>(null)
    const passwordRef = useRef<HTMLInputElement>(null)
    const confirmRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // 휴대폰 인증 상태
    const [phone, setPhone] = useState('')
    const [verificationCode, setVerificationCode] = useState('')
    const [isCodeSent, setIsCodeSent] = useState(false)
    const [isVerified, setIsVerified] = useState(false)
    const [verifying, setVerifying] = useState(false)

    // 이메일 및 비밀번호 상태
    const [email, setEmail] = useState('')
    const [isEmailChecked, setIsEmailChecked] = useState(false)
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [checkingEmail, setCheckingEmail] = useState(false)

    const handleSendCode = async () => {
        if (!phone || phone.length < 10) {
            alert('휴대폰 번호를 올바르게 입력해주세요')
            return
        }
        setVerifying(true)
        try {
            await import('../actions').then(mod => mod.sendVerificationCode(phone))
            setIsCodeSent(true)
            alert('인증번호(123456)가 발송되었습니다.')
        } catch (e) {
            alert('인증번호 발송 실패')
        } finally {
            setVerifying(false)
        }
    }

    const handleVerifyCode = async () => {
        if (!verificationCode) return
        setVerifying(true)
        try {
            const result = await import('../actions').then(mod => mod.verifyPhoneCode(phone, verificationCode))
            if (result.success) {
                setIsVerified(true)
                setIsCodeSent(false)
                alert('인증되었습니다.')
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('인증 확인 중 오류가 발생했습니다.')
        } finally {
            setVerifying(false)
        }
    }

    const handleCheckEmail = async () => {
        if (!email || !email.includes('@')) {
            alert('이메일을 올바르게 입력해주세요')
            return
        }
        setCheckingEmail(true)
        try {
            const result = await import('../actions').then(mod => mod.checkEmailDuplicate(email))

            if (result.available) {
                setIsEmailChecked(true)
                alert('사용 가능한 이메일입니다.')
            } else {
                setIsEmailChecked(false)
                alert(result.message || '이미 사용 중인 이메일입니다.')
            }
        } catch (e) {
            alert('중복 확인 중 오류가 발생했습니다.')
            setIsEmailChecked(false)
        } finally {
            setCheckingEmail(false)
        }
    }

    const handleSubmit = () => {
        if (!nameRef.current?.value) {
            alert('이름을 입력해주세요')
            nameRef.current?.focus()
            return
        }
        if (!isVerified) {
            alert('휴대폰 인증을 완료해주세요')
            phoneRef.current?.focus()
            return
        }
        if (!isEmailChecked) {
            alert('이메일 중복 확인을 해주세요')
            emailRef.current?.focus()
            return
        }
        if (!password || password.length < 8) {
            alert('비밀번호 규칙을 확인해주세요 (8자 이상, 특수문자 포함)')
            passwordRef.current?.focus()
            return
        }
        if (!isPasswordMatch) {
            alert('비밀번호가 일치하지 않습니다')
            confirmRef.current?.focus()
            return
        }

        // 유효성 검사 통과 시 폼 제출
        formRef.current?.requestSubmit()
    }

    // 비밀번호 일치 여부
    const isPasswordMatch = password && confirmPassword && password === confirmPassword
    const isPasswordMismatch = password && confirmPassword && password !== confirmPassword

    return (
        <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-8">
            <div className="w-full max-w-[400px] animate-fade-in space-y-8">
                {/* 로고 영역 */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-violet-500/10 mb-2 ring-1 ring-slate-100 dark:ring-slate-800">
                        <Megaphone className="h-7 w-7 text-violet-600 dark:text-violet-400 transform -rotate-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        환영합니다! 🎉
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        30초만에 가입하고 무료 체험단을 시작하세요
                    </p>
                </div>

                {/* 성공 메시지 */}
                {state.success && (
                    <Card className="mb-6 border-emerald-100 bg-white ring-1 ring-emerald-100 dark:ring-emerald-900 dark:bg-slate-900 shadow-xl shadow-emerald-500/10 rounded-3xl overflow-hidden">
                        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 animate-in zoom-in spin-in-12 duration-500">
                                <Check className="h-8 w-8" strokeWidth={3} />
                            </div>
                            <div className="space-y-2">
                                <p className="text-xl font-bold text-slate-900 dark:text-slate-100">
                                    가입을 축하합니다!
                                </p>
                                <p className="text-slate-500 dark:text-slate-400">
                                    {state.message}
                                </p>
                            </div>
                            <Link href="/login" className="w-full">
                                <Button className="w-full h-12 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-lg shadow-emerald-500/30 mt-2">
                                    로그인하러 가기
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}

                {/* 회원가입 폼 */}
                {!state.success && (
                    <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 bg-white ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden rounded-3xl">
                        <CardHeader className="sr-only">
                            <CardTitle>회원가입</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 sm:p-8">
                            <form action={formAction} ref={formRef} className="space-y-5">
                                {/* Hidden Input: 휴대폰 번호 전송용 */}
                                <input type="hidden" name="phone" value={phone} />

                                {/* 에러 메시지 */}
                                {state.error && (
                                    <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2 animate-in slide-in-from-top-2">
                                        <svg className="h-5 w-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {state.error}
                                    </div>
                                )}

                                <div className="space-y-4">
                                    {/* 이름 */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="name" className="text-xs font-bold text-slate-500 ml-1">이름</label>
                                        <Input
                                            ref={nameRef}
                                            id="name"
                                            name="name"
                                            type="text"
                                            placeholder="홍길동"
                                            className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                                            required
                                            disabled={isPending}
                                        />
                                    </div>

                                    {/* 휴대폰 인증 */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="phone" className="text-xs font-bold text-slate-500 ml-1">휴대폰 번호</label>
                                        <div className="flex gap-2">
                                            <Input
                                                ref={phoneRef}
                                                id="phone_display"
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="01012345678"
                                                className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium flex-1 ${isVerified ? 'text-slate-500 bg-slate-100' : ''}`}
                                                required
                                                disabled={isPending || isVerified || isCodeSent}
                                            />
                                            {!isVerified && !isCodeSent && (
                                                <Button
                                                    type="button"
                                                    onClick={handleSendCode}
                                                    disabled={verifying || !phone || phone.length < 10}
                                                    className="h-12 w-24 rounded-xl whitespace-nowrap"
                                                >
                                                    인증요청
                                                </Button>
                                            )}
                                            {isVerified && (
                                                <Button type="button" variant="ghost" className="h-12 px-3 text-emerald-600 pointer-events-none font-bold">
                                                    인증됨
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {/* 인증번호 입력 */}
                                    {isCodeSent && !isVerified && (
                                        <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                            <div className="flex gap-2">
                                                <Input
                                                    ref={codeRef}
                                                    type="text"
                                                    value={verificationCode}
                                                    onChange={(e) => setVerificationCode(e.target.value)}
                                                    placeholder="인증번호 6자리"
                                                    className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium flex-1"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={handleVerifyCode}
                                                    disabled={verifying || !verificationCode}
                                                    className="h-12 w-24 rounded-xl"
                                                >
                                                    확인
                                                </Button>
                                            </div>
                                            <p className="text-xs text-slate-500 ml-1">인증번호 123456을 입력하세요</p>
                                        </div>
                                    )}

                                    {/* 이메일 */}
                                    <div className="space-y-1.5">
                                        <label htmlFor="email" className="text-xs font-bold text-slate-500 ml-1">이메일</label>
                                        <div className="flex gap-2">
                                            <Input
                                                ref={emailRef}
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={email}
                                                onChange={(e) => {
                                                    setEmail(e.target.value)
                                                    setIsEmailChecked(false)
                                                }}
                                                placeholder="hello@example.com"
                                                className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium flex-1 ${isEmailChecked ? 'border-emerald-500 ring-1 ring-emerald-500' : ''}`}
                                                required
                                                disabled={isPending}
                                            />
                                            <Button
                                                type="button"
                                                onClick={handleCheckEmail}
                                                disabled={isPending || checkingEmail || !email || isEmailChecked}
                                                className={`h-12 w-24 rounded-xl whitespace-nowrap ${isEmailChecked ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-emerald-200 shadow-none' : ''}`}
                                                variant={isEmailChecked ? 'outline' : 'default'}
                                            >
                                                {isEmailChecked ? (
                                                    <><Check className="h-4 w-4 mr-1" />확인됨</>
                                                ) : (
                                                    '중복확인'
                                                )}
                                            </Button>
                                        </div>
                                    </div>

                                    {/* 비밀번호 */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <label htmlFor="password" className="text-xs font-bold text-slate-500 ml-1">비밀번호</label>
                                            <Input
                                                ref={passwordRef}
                                                id="password"
                                                name="password"
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="8자 이상, 영문/숫자/특수문자 포함"
                                                className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder:text-slate-400"
                                                required
                                                minLength={8}
                                                disabled={isPending}
                                            />
                                        </div>
                                        <div className="space-y-1.5 col-span-2 sm:col-span-1">
                                            <label htmlFor="passwordConfirm" className="text-xs font-bold text-slate-500 ml-1">한번 더</label>
                                            <Input
                                                ref={confirmRef}
                                                id="passwordConfirm"
                                                name="passwordConfirm"
                                                type="password"
                                                value={confirmPassword}
                                                onChange={(e) => setConfirmPassword(e.target.value)}
                                                placeholder="비밀번호 확인"
                                                className={`h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium placeholder:text-slate-400 ${isPasswordMatch ? 'border-emerald-500 ring-1 ring-emerald-500' :
                                                    isPasswordMismatch ? 'border-red-500 ring-1 ring-red-500' : ''
                                                    }`}
                                                required
                                                disabled={isPending}
                                            />
                                        </div>
                                        {/* 비밀번호 일치 메시지 */}
                                        <div className="col-span-2 text-xs text-right h-4">
                                            {isPasswordMatch && <span className="text-emerald-600 font-medium flex items-center justify-end gap-1"><Check className="h-3 w-3" /> 비밀번호가 일치합니다</span>}
                                            {isPasswordMismatch && <span className="text-red-500 font-medium">비밀번호가 일치하지 않습니다</span>}
                                        </div>
                                    </div>
                                </div>

                                {/* 약관 동의 */}
                                <div className="space-y-3 pt-2 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="terms"
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-violet-600 checked:bg-violet-600 dark:border-slate-600 dark:bg-slate-800"
                                                required
                                                disabled={isPending}
                                            />
                                            <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-0.5">
                                            <span className="font-bold text-violet-600">[필수]</span>{' '}
                                            <Link href="/legal/terms" className="underline hover:text-violet-600" target="_blank">서비스 이용약관</Link> 및{' '}
                                            <Link href="/legal/privacy" className="underline hover:text-violet-600" target="_blank">개인정보처리방침</Link>에 동의합니다
                                        </div>
                                    </label>
                                    <label className="flex items-start gap-3 cursor-pointer group">
                                        <div className="relative flex items-center">
                                            <input
                                                type="checkbox"
                                                name="marketing"
                                                className="peer h-5 w-5 cursor-pointer appearance-none rounded-md border border-slate-300 transition-all checked:border-slate-500 checked:bg-slate-500 dark:border-slate-600 dark:bg-slate-800"
                                                disabled={isPending}
                                            />
                                            <Check className="pointer-events-none absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-white opacity-0 transition-opacity peer-checked:opacity-100" strokeWidth={3} />
                                        </div>
                                        <div className="text-xs text-slate-600 dark:text-slate-400 leading-snug pt-0.5">
                                            <span className="font-bold text-slate-400">[선택]</span> 마케팅 정보 수신에 동의합니다
                                        </div>
                                    </label>
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleSubmit}
                                    className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-300 disabled:shadow-none"
                                    disabled={isPending || !isVerified}
                                >
                                    {isPending ? (
                                        <>
                                            <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                            가입 중...
                                        </>
                                    ) : (
                                        '무료로 가입하기'
                                    )}
                                </Button>

                                {/* 구분선 */}
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                                    </div>
                                    <div className="relative flex justify-center text-xs uppercase">
                                        <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">Or join with</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-[#FEE500] hover:border-[#FEE500] hover:text-black transition-colors"
                                        disabled={isPending}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M12 3C6.48 3 2 6.64 2 11.11c0 2.84 1.89 5.33 4.73 6.76l-.97 3.6c-.08.31.27.57.54.4l4.42-2.94c.42.04.85.07 1.28.07 5.52 0 10-3.64 10-8.11S17.52 3 12 3z"
                                            />
                                        </svg>
                                        <span className="sr-only">Kakao</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-[#03C75A] hover:border-[#03C75A] hover:text-white transition-colors"
                                        disabled={isPending}
                                    >
                                        <svg className="h-4 w-4" viewBox="0 0 24 24">
                                            <path fill="currentColor" d="M16.273 12.845L7.376 0H0v24h7.726V11.156L16.624 24H24V0h-7.727v12.845z" />
                                        </svg>
                                        <span className="sr-only">Naver</span>
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="h-12 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                                        disabled={isPending}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                        </svg>
                                        <span className="sr-only">Google</span>
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* 하단 링크 - 가입 성공 시 숨김 */}
                {!state.success && (
                    <div className="text-center space-y-6">
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                            이미 계정이 있으신가요?{' '}
                            <Link href="/login" className="text-violet-600 font-bold hover:text-violet-700 hover:underline transition-colors">
                                로그인하기
                            </Link>
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
