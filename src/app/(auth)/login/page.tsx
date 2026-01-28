'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Megaphone, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { signIn, type AuthState } from '../actions'

const initialState: AuthState = {}

export default function LoginPage() {
    const [state, formAction, isPending] = useActionState(signIn, initialState)

    return (
        <div className="min-h-dvh flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-5 py-8">
            <div className="w-full max-w-[400px] animate-fade-in space-y-8">
                {/* 로고 영역 */}
                <div className="text-center space-y-2">
                    <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white dark:bg-slate-900 shadow-xl shadow-violet-500/10 mb-2 ring-1 ring-slate-100 dark:ring-slate-800">
                        <Megaphone className="h-7 w-7 text-violet-600 dark:text-violet-400 transform -rotate-12" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                        다시 오셨군요! 👋
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        패스트캠페인에 로그인하고 체험단을 시작하세요
                    </p>
                </div>

                {/* 메인 카드 */}
                <Card className="border-0 shadow-2xl shadow-slate-200/50 dark:shadow-none dark:bg-slate-900 bg-white ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden rounded-3xl">
                    <CardHeader className="sr-only">
                        <CardTitle>로그인</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 sm:p-8">
                        <form action={formAction} className="space-y-5">
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
                                <div className="space-y-1.5">
                                    <label htmlFor="email" className="text-xs font-bold text-slate-500 ml-1">이메일</label>
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="hello@example.com"
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <label htmlFor="password" className="text-xs font-bold text-slate-500">비밀번호</label>
                                        <Link href="/forgot-password" className="text-xs text-violet-600 hover:text-violet-700 font-semibold hover:underline">
                                            비밀번호를 잊으셨나요?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700/50 focus:bg-white dark:focus:bg-slate-800 transition-all font-medium"
                                        required
                                        disabled={isPending}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl bg-violet-600 hover:bg-violet-700 text-white font-bold shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                                        로그인 중...
                                    </>
                                ) : (
                                    '이메일로 로그인'
                                )}
                            </Button>

                            {/* 구분선 */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-100 dark:border-slate-800" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-medium">Or continue with</span>
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

                {/* 하단 링크 */}
                <div className="text-center space-y-4">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        계정이 없으신가요?{' '}
                        <Link href="/signup" className="text-violet-600 font-bold hover:text-violet-700 hover:underline transition-colors">
                            회원가입하기
                        </Link>
                    </p>

                    <Link href="/" className="inline-block text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                        © 2026 FastCampaign. All rights reserved.
                    </Link>
                </div>
            </div>
        </div>
    )
}
