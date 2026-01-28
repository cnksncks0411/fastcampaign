import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, MapPin, Clock, CheckCircle, Tag, Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getTicketDetail } from '../actions'
import { QRCodeDisplay } from './QRCodeDisplay'
import { CancelButton } from './CancelButton'
import { BackButton } from '@/components/common/BackButton'

const reviewTypeLabels: Record<string, string> = {
    INSTAGRAM_STORY: '인스타그램 스토리',
    INSTAGRAM_FEED: '인스타그램 피드',
    NAVER_BLOG: '네이버 블로그',
    NAVER_PLACE: '네이버 플레이스',
    GOOGLE_REVIEW: '구글 리뷰',
}

export default async function TicketDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { ticket, error } = await getTicketDetail(id)

    if (error || !ticket) {
        notFound()
    }

    const isActive = ticket.status === 'CONFIRMED'
    const isCheckedIn = ticket.status === 'CHECKED_IN'

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-violet-50 dark:from-slate-950 dark:to-violet-950 pb-32">
            {/* 헤더 */}
            <div className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-3 dark:border-slate-700/50 dark:bg-slate-900/80">
                <BackButton />
                <h1 className="text-lg font-bold">이용권 상세</h1>
            </div>

            <div className="p-4 space-y-6 max-w-lg mx-auto">
                {/* 상태 배지 */}
                <div className="text-center">
                    {isCheckedIn ? (
                        <Badge className="bg-emerald-100 text-emerald-700 text-lg px-4 py-2">
                            <CheckCircle className="h-5 w-5 mr-2" />
                            체크인 완료!
                        </Badge>
                    ) : isActive ? (
                        <Badge className="bg-violet-100 text-violet-700 text-lg px-4 py-2">
                            <Clock className="h-5 w-5 mr-2" />
                            방문 대기중
                        </Badge>
                    ) : (
                        <Badge variant="secondary" className="text-lg px-4 py-2">
                            {ticket.status === 'CANCELLED_BY_USER' ? '취소됨' : '노쇼'}
                        </Badge>
                    )}
                </div>

                {/* QR 코드 (활성 상태일 때만) */}
                {isActive && ticket.checkin_token && (
                    <Card className="border-violet-300 overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-500 to-indigo-600 text-white p-4 text-center">
                            <h2 className="font-bold text-lg">체크인 QR 코드</h2>
                            <p className="text-sm text-violet-100">매장에서 이 QR을 보여주세요</p>
                        </div>
                        <CardContent className="p-6 flex flex-col items-center">
                            <QRCodeDisplay token={ticket.checkin_token} />
                            <p className="mt-4 text-2xl font-mono font-bold tracking-wider text-slate-700">
                                {ticket.checkin_token}
                            </p>
                            <p className="text-sm text-slate-500 mt-2">
                                1회용 코드 (24시간 유효)
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 체크인 완료 메시지 */}
                {isCheckedIn && (
                    <Card className="border-emerald-200 bg-emerald-50 dark:bg-emerald-900/20">
                        <CardContent className="p-6 text-center">
                            <CheckCircle className="h-16 w-16 text-emerald-500 mx-auto mb-4" />
                            <h2 className="text-xl font-bold text-emerald-700 dark:text-emerald-400">
                                체크인이 완료되었습니다!
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">
                                혜택을 즐기시고, 리뷰를 작성해주세요 💚
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 매장 정보 */}
                <Card>
                    <CardContent className="p-4">
                        <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                            {ticket.campaign.store.name}
                        </h3>
                        <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                            <MapPin className="h-4 w-4" />
                            {ticket.campaign.store.address_text}
                        </p>

                        <div className="mt-4 p-3 rounded-lg bg-violet-50 dark:bg-violet-900/20">
                            <p className="text-sm text-slate-600 dark:text-slate-400">제공 혜택</p>
                            <p className="text-lg font-bold text-violet-600 dark:text-violet-400">
                                🎁 {ticket.campaign.benefit_text}
                            </p>
                        </div>

                        <div className="mt-4 flex items-center gap-2">
                            <Badge variant="secondary">
                                {reviewTypeLabels[ticket.campaign.review_type]}
                            </Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* 필수 태그 */}
                {ticket.campaign.required_tags && ticket.campaign.required_tags.length > 0 && (
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Tag className="h-4 w-4 text-violet-600" />
                                <span className="font-medium">리뷰 필수 태그</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {ticket.campaign.required_tags.map((tag) => (
                                    <Badge
                                        key={tag}
                                        variant="outline"
                                        className="text-violet-600 border-violet-300 cursor-pointer hover:bg-violet-50"
                                    >
                                        {tag}
                                        <Copy className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                            <p className="text-xs text-slate-500 mt-3">
                                태그를 클릭하면 복사됩니다
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* 길찾기 버튼 */}
                <Button variant="outline" className="w-full" asChild>
                    <a
                        href={`https://map.naver.com/v5/search/${encodeURIComponent(ticket.campaign.store.address_text)}`}
                        target="_blank"
                    >
                        <MapPin className="h-5 w-5 mr-2" />
                        길찾기
                    </a>
                </Button>

                {/* 취소 버튼 (활성 상태일 때만) */}
                {isActive && (
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-xl border-t border-slate-200/50 dark:bg-slate-900/90 dark:border-slate-700/50">
                        <div className="max-w-lg mx-auto">
                            <CancelButton applicationId={ticket.id} />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
