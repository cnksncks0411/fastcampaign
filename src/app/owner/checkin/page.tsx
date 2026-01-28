'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Scan, CheckCircle, XCircle, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { verifyLastCheckin, verifyCheckinToken, type CheckinState } from './actions'
import { QRScanner } from '@/components/qrcode/QRScanner'
import { BackButton } from '@/components/common/BackButton'

export default function CheckinPage() {
    const [state, formAction, isPending] = useActionState<CheckinState, FormData>(verifyCheckinToken, {})
    const [activeTab, setActiveTab] = useState('manual')

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950">
            {/* 헤더 */}
            <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-3 dark:border-slate-700/50 dark:bg-slate-900/80">
                <BackButton />
                <h1 className="text-lg font-bold ml-2">QR 체크인</h1>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto pb-32">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="manual">토큰 입력</TabsTrigger>
                        <TabsTrigger value="scan">QR 스캔</TabsTrigger>
                    </TabsList>

                    {/* 토큰 수동 입력 탭 */}
                    <TabsContent value="manual" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg">체크인 코드 입력</CardTitle>
                                <CardDescription>
                                    손님의 이용권에 표시된 8자리 코드를 입력하세요
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form action={formAction} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="token" className="sr-only">체크인 코드</Label>
                                        <div className="flex gap-2">
                                            <Input
                                                id="token"
                                                name="token"
                                                placeholder="예: A1B2C3D4"
                                                className="text-lg font-mono tracking-widest uppercase text-center h-12"
                                                maxLength={8}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        type="submit"
                                        className="w-full h-12 text-lg"
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <>
                                                <span className="animate-spin mr-2">⏳</span>
                                                확인 중...
                                            </>
                                        ) : (
                                            '체크인 확인'
                                        )}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* QR 스캔 탭 */}
                    <TabsContent value="scan">
                        <Card>
                            <CardContent className="pt-6 text-center pb-6">
                                <div className="mb-4">
                                    <p className="font-bold text-lg text-slate-900 dark:text-white mb-1">
                                        QR 코드를 스캔해주세요
                                    </p>
                                    <p className="text-sm text-slate-500">
                                        카메라에 손님의 QR 코드를 비춰주세요
                                    </p>
                                </div>

                                <div className="mx-auto aspect-square max-w-[300px] overflow-hidden rounded-2xl bg-black mb-4">
                                    {activeTab === 'scan' && !state.success && (
                                        <QRScanner
                                            onScan={(decodedText) => {
                                                // 스캔 성공 시 폼 제출 트리거
                                                const form = document.getElementById('scan-form') as HTMLFormElement
                                                const input = document.getElementById('scan-token-input') as HTMLInputElement
                                                if (form && input) {
                                                    input.value = decodedText
                                                    // requestSubmit을 사용하여 useActionState와 연동
                                                    form.requestSubmit()
                                                }
                                            }}
                                        />
                                    )}
                                </div>

                                {/* 스캔용 숨겨진 폼 */}
                                <form id="scan-form" action={formAction}>
                                    <input type="hidden" name="token" id="scan-token-input" />
                                </form>

                                <p className="text-xs text-slate-400">
                                    인식이 잘 안되나요? 화면 밝기를 높이거나<br />코드를 조금 더 가까이 비춰보세요.
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* 결과 표시 화면 */}
                {state.success && state.data && (
                    <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20 animate-in fade-in zoom-in duration-300">
                        <CardContent className="pt-6 text-center">
                            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 mb-1">
                                체크인 완료!
                            </h2>
                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-4">
                                {state.data.userName}님
                            </p>

                            <div className="bg-white/60 dark:bg-black/20 rounded-xl p-4 text-left space-y-2 mb-4">
                                <div className="flex justify-between">
                                    <span className="text-slate-500">캠페인</span>
                                    <span className="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">
                                        {state.data.campaignTitle}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">혜택</span>
                                    <span className="font-bold text-violet-600 truncate max-w-[200px]">
                                        {state.data.benefit}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-slate-500">리뷰</span>
                                    <Badge variant="outline">{state.data.reviewType}</Badge>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setActiveTab('manual')}
                            >
                                다음 손님 체크인
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {/* 에러 표시 */}
                {state.error && (
                    <Card className="border-red-200 bg-red-50 dark:bg-red-900/20 animate-in shake duration-300">
                        <CardContent className="pt-6 text-center">
                            <XCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2">
                                체크인 실패
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-4">
                                {state.error}
                            </p>
                            <Button
                                variant="outline"
                                className="w-full border-red-200 hover:bg-red-100 text-red-700"
                                onClick={() => setActiveTab('manual')} // 재시도를 위해 탭 리셋 효과
                            >
                                다시 시도
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
