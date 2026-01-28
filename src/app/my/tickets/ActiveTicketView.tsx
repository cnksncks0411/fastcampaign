'use client'

import React from 'react'
import Link from 'next/link'
import { MapPin, Clock, Tag, Copy, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { QRCodeDisplay } from './[id]/QRCodeDisplay'
import { CancelButton } from './[id]/CancelButton'
import { UserTicket } from './actions'

const reviewTypeLabels: Record<string, string> = {
    INSTAGRAM_STORY: '인스타그램 스토리',
    INSTAGRAM_FEED: '인스타그램 피드',
    NAVER_BLOG: '네이버 블로그',
    NAVER_PLACE: '네이버 플레이스',
    GOOGLE_REVIEW: '구글 리뷰',
}

interface ActiveTicketViewProps {
    ticket: UserTicket
}

export function ActiveTicketView({ ticket }: ActiveTicketViewProps) {
    const isInstagram = ticket.campaign.review_type.includes('INSTAGRAM')
    const isNaver = ticket.campaign.review_type.includes('NAVER')

    return (
        <div className="space-y-6 pb-32">
            {/* 상태 배지 영역 */}
            <div className="text-center pt-2">
                <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-lg px-4 py-2 hover:bg-violet-100 dark:hover:bg-violet-900/30">
                    <Clock className="h-5 w-5 mr-2" />
                    방문 대기중
                </Badge>
                <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    매장에 방문하여 아래 QR코드를 보여주세요
                </div>
            </div>

            {/* QR 코드 카드 */}
            <Card className="border-violet-300 dark:border-violet-700 overflow-hidden shadow-lg shadow-violet-100/50 dark:shadow-none bg-white dark:bg-slate-900">
                <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-4 text-center">
                    <h2 className="font-bold text-lg">체크인 QR 코드</h2>
                </div>
                <CardContent className="p-8 flex flex-col items-center">
                    {ticket.checkin_token ? (
                        <>
                            <div className="p-4 bg-white rounded-2xl shadow-sm border border-slate-100">
                                {/* QR 코드는 항상 흰 배경이어야 인식이 잘 됨 */}
                                <QRCodeDisplay token={ticket.checkin_token || ''} />
                            </div>
                            <p className="mt-6 text-3xl font-mono font-bold tracking-wider text-slate-800 dark:text-slate-100">
                                {ticket.checkin_token}
                            </p>
                            <p className="text-sm text-slate-400 mt-2">
                                1회용 코드 (24시간 유효)
                            </p>
                        </>
                    ) : (
                        <div className="text-center py-8 text-slate-400">
                            QR 코드를 생성할 수 없습니다.
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* 매장 및 혜택 정보 */}
            <Card className="border-0 shadow-sm bg-slate-50 dark:bg-slate-900/50">
                <CardContent className="p-5">
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 mb-2">
                        {ticket.campaign.store.name}
                    </h3>
                    <p className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 mb-4">
                        <MapPin className="h-4 w-4" />
                        {ticket.campaign.store.address_text}
                    </p>

                    <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm">
                        <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">제공 혜택</p>
                        <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                            {ticket.campaign.benefit_text}
                        </p>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                        <Badge variant="secondary" className="bg-white border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                            {reviewTypeLabels[ticket.campaign.review_type] || ticket.campaign.review_type}
                        </Badge>
                        {ticket.campaign.required_tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="text-slate-600 bg-white dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
                                #{tag}
                            </Badge>
                        ))}
                    </div>

                    {/* 미션 수행 버튼 */}
                    <div className="mt-6">
                        {isInstagram && (
                            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold h-12 rounded-xl" asChild>
                                <a href="https://www.instagram.com/" target="_blank" rel="noopener noreferrer">
                                    인스타그램 스토리 올리기
                                </a>
                            </Button>
                        )}
                        {isNaver && (
                            <Button className="w-full bg-[#03C75A] hover:bg-[#02b351] text-white font-bold h-12 rounded-xl" asChild>
                                <a href={`https://m.place.naver.com/place/list?query=${encodeURIComponent(ticket.campaign.store.name)}`} target="_blank" rel="noopener noreferrer">
                                    네이버 리뷰 작성하기
                                </a>
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* 취소 버튼 (스크롤 최하단) */}
            <div className="pt-4">
                <CancelButton applicationId={ticket.id} />
                <p className="text-center text-xs text-slate-400 mt-2">
                    방문이 어려우시면 미리 취소해주세요
                </p>
            </div>
        </div>
    )
}
