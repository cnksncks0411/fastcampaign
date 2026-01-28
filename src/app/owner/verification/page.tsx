'use client'

import { useActionState, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { submitVerification, type FormState } from './actions'
import { BackButton } from '@/components/common/BackButton'

export default function VerificationPage() {
    const [state, formAction, isPending] = useActionState<FormState, FormData>(submitVerification, {})
    const [fileName, setFileName] = useState<string | null>(null)

    // 이미 인증된 상태
    if (state.verificationStatus === 'APPROVED') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950">
                <Header />
                <div className="p-4 max-w-2xl mx-auto">
                    <Card className="border-emerald-200 bg-emerald-50/50 dark:bg-emerald-900/20">
                        <CardContent className="pt-6 text-center">
                            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                                인증이 완료되었습니다!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                이제 포인트를 충전하고 캠페인을 생성할 수 있습니다.
                            </p>
                            <div className="space-y-3">
                                <Button asChild className="w-full">
                                    <Link href="/owner/campaigns/create">캠페인 만들기</Link>
                                </Button>
                                <Button variant="outline" asChild className="w-full">
                                    <Link href="/owner">대시보드로 돌아가기</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // 인증 대기 중
    if (state.verificationStatus === 'PENDING') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950">
                <Header />
                <div className="p-4 max-w-2xl mx-auto">
                    <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-900/20">
                        <CardContent className="pt-6 text-center">
                            <Clock className="h-16 w-16 text-amber-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-amber-700 dark:text-amber-400 mb-2">
                                인증 검토 중입니다
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-6">
                                관리자가 제출하신 서류를 검토하고 있습니다.<br />
                                보통 1-2영업일 내에 처리됩니다.
                            </p>
                            <Button variant="outline" asChild className="w-full">
                                <Link href="/owner">대시보드로 돌아가기</Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    // 인증 거부됨
    if (state.verificationStatus === 'REJECTED') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950">
                <Header />
                <div className="p-4 max-w-2xl mx-auto">
                    <Card className="border-red-200 bg-red-50/50 dark:bg-red-900/20">
                        <CardContent className="pt-6 text-center">
                            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-red-700 dark:text-red-400 mb-2">
                                인증이 반려되었습니다
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-2">
                                사유: {state.rejectionReason || '제출된 서류가 부적합합니다.'}
                            </p>
                            <p className="text-sm text-slate-500 mb-6">
                                아래에서 다시 인증을 신청해주세요.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950">
            <Header />

            <form action={formAction} className="p-4 space-y-6 max-w-2xl mx-auto pb-32">
                {/* 에러 메시지 */}
                {state.error && (
                    <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400 flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
                        <span>{state.error}</span>
                    </div>
                )}

                {/* 안내 */}
                <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/20">
                    <CardContent className="p-4">
                        <h3 className="font-medium text-blue-700 dark:text-blue-400 mb-2">
                            📋 사업주 인증이 필요한 이유
                        </h3>
                        <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                            <li>• 캠페인을 생성하려면 사업주 인증이 필요합니다</li>
                            <li>• 인증 후 포인트 충전 및 캠페인 생성이 가능합니다</li>
                            <li>• 제출된 정보는 안전하게 보관됩니다</li>
                        </ul>
                    </CardContent>
                </Card>

                {/* 사업자 정보 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">사업자 정보</CardTitle>
                        <CardDescription>사업자등록증에 기재된 정보를 입력해주세요</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="business_number">사업자등록번호 *</Label>
                            <Input
                                id="business_number"
                                name="business_number"
                                placeholder="000-00-00000"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="business_name">상호명 *</Label>
                            <Input
                                id="business_name"
                                name="business_name"
                                placeholder="사업자등록증에 기재된 상호명"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="representative_name">대표자명 *</Label>
                            <Input
                                id="representative_name"
                                name="representative_name"
                                placeholder="대표자 성명"
                                required
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* 서류 업로드 */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <FileText className="h-5 w-5" />
                            사업자등록증 업로드
                        </CardTitle>
                        <CardDescription>
                            사업자등록증 사본을 업로드해주세요 (JPG, PNG, PDF)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center hover:border-violet-400 transition-colors">
                            <input
                                type="file"
                                id="document"
                                name="document"
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                                onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
                            />
                            <label htmlFor="document" className="cursor-pointer">
                                <Upload className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                                {fileName ? (
                                    <div>
                                        <Badge variant="secondary" className="mb-2">{fileName}</Badge>
                                        <p className="text-sm text-slate-500">클릭하여 다른 파일 선택</p>
                                    </div>
                                ) : (
                                    <div>
                                        <p className="text-slate-600 dark:text-slate-400 mb-1">
                                            클릭하여 파일 업로드
                                        </p>
                                        <p className="text-sm text-slate-500">최대 10MB</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </CardContent>
                </Card>

                {/* 제출 버튼 */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 dark:bg-slate-900/90 dark:border-slate-700/50">
                    <div className="max-w-2xl mx-auto">
                        <Button
                            type="submit"
                            className="w-full"
                            size="lg"
                            disabled={isPending}
                        >
                            {isPending ? (
                                <>
                                    <span className="animate-spin mr-2">⏳</span>
                                    제출 중...
                                </>
                            ) : (
                                '인증 신청하기'
                            )}
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    )
}

function Header() {
    return (
        <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-3 dark:border-slate-700/50 dark:bg-slate-900/80">
            <BackButton />
            <h1 className="text-lg font-bold ml-2">사업주 인증</h1>
        </div>
    )
}
