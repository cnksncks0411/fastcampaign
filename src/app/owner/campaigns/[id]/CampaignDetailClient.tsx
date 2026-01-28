'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, QrCode, Calendar, Users, MapPin, Instagram, Settings, Edit, CheckCircle } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'

export default function CampaignDetailClient({ campaign }: { campaign: any }) {
    const router = useRouter()
    const isEdittable = campaign.current_confirmed === 0 && campaign.status === 'ACTIVE'
    const [isScanning, setIsScanning] = useState(false)
    const checkedInUsers = campaign.applications?.filter((app: any) => app.status === 'CHECKED_IN') || []

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">캠페인 상세</h1>

                {isEdittable && (
                    <Button variant="ghost" size="icon" className="ml-auto rounded-full hover:bg-slate-100" asChild>
                        <Link href={`/owner/campaigns/${campaign.id}/edit`}>
                            <Edit className="w-5 h-5 text-slate-600" />
                        </Link>
                    </Button>
                )}
            </header>

            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Campaign Info */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                    <div className="flex items-start gap-4 mb-4">
                        {campaign.stores?.images?.[0] ? (
                            <img src={campaign.stores.images[0]} alt="store" className="w-16 h-16 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center">
                                <MapPin className="w-6 h-6 text-slate-300" />
                            </div>
                        )}
                        <div>
                            <div className="text-sm text-slate-500 font-medium mb-1">{campaign.stores?.name}</div>
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white leading-tight mb-2">
                                {campaign.title}
                            </h2>
                            <Badge variant={campaign.status === 'ACTIVE' ? 'default' : 'secondary'} className="bg-violet-600">
                                {campaign.status === 'ACTIVE' ? '진행중' : '종료됨'}
                            </Badge>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 py-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex flex-col gap-1">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Users className="w-3 h-3" /> 모집 현황
                            </div>
                            <div className="font-bold text-lg">
                                {campaign.current_confirmed} <span className="text-sm font-normal text-slate-400">/ {campaign.capacity}명</span>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                                <Calendar className="w-3 h-3" /> 마감일
                            </div>
                            <div className="font-bold text-lg">
                                {new Date(campaign.end_at).toLocaleDateString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* QR Scanner Section (Placeholder for now) */}
                <div className="bg-violet-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-200 dark:shadow-none text-center">
                    <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <QrCode className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-lg font-bold mb-2">방문자 QR 체크인</h3>
                    <p className="text-violet-100 text-sm mb-6">
                        리뷰어가 제시하는 QR코드를 스캔하여<br />방문 확인 및 리뷰 인증을 완료하세요.
                    </p>
                    <Button
                        size="lg"
                        className="w-full bg-white text-violet-700 hover:bg-white/90 font-bold h-12 rounded-xl text-base"
                        onClick={() => setIsScanning(!isScanning)}
                    >
                        {isScanning ? '카메라 닫기' : 'QR코드 스캔하기'}
                    </Button>

                    {isScanning && (
                        <div className="mt-4 h-64 bg-black rounded-xl flex items-center justify-center relative overflow-hidden">
                            <div className="absolute inset-0 border-2 border-green-400 opacity-50 animate-pulse m-8 rounded-lg"></div>
                            <span className="text-slate-400 text-sm">카메라 권한을 허용해주세요</span>
                        </div>
                    )}
                </div>

                {/* Checked-in Users List */}
                {checkedInUsers.length > 0 && (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800">
                        <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                            방문 완료한 리뷰어 ({checkedInUsers.length}명)
                        </h3>
                        <div className="space-y-3">
                            {checkedInUsers.map((app: any, idx: number) => (
                                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                                    <div className="font-bold text-sm text-slate-900 dark:text-white">{app.profiles?.name || '익명'}</div>
                                    <div className="text-xs text-slate-500">
                                        {new Date(app.checked_in_at).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Additional Info */}
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">상세 정보</h3>
                    <div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                        <div>
                            <div className="text-xs text-slate-500 mb-1">제공 서비스</div>
                            <div className="font-medium text-sm">{campaign.benefit_text}</div>
                        </div>
                        {campaign.description && (
                            <div>
                                <div className="text-xs text-slate-500 mb-1">상세 설명</div>
                                <div className="font-medium text-sm">{campaign.description}</div>
                            </div>
                        )}
                        <div>
                            <div className="text-xs text-slate-500 mb-1">필수 태그</div>
                            <div className="flex flex-wrap gap-2">
                                {campaign.required_tags?.map((tag: string) => (
                                    <Badge key={tag} variant="secondary" className="bg-white border text-slate-600">#{tag}</Badge>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
