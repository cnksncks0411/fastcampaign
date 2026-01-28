import { notFound } from 'next/navigation'

export default function Page() {
    notFound()
}

/*
import Link from 'next/link'
import { Filter, MapPin, Clock, Users, Star } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getActiveCampaigns, CampaignListItem } from '../campaigns/actions'

const reviewTypeLabels: Record<string, string> = {
    INSTAGRAM_STORY: '인스타 스토리',
    INSTAGRAM_FEED: '인스타 피드',
    NAVER_BLOG: '네이버 블로그',
    NAVER_PLACE: '네이버 플레이스',
    GOOGLE_REVIEW: '구글 리뷰',
}

const categoryEmojis: Record<string, string> = {
    카페: '☕',
    일식: '🍣',
    미용: '💇',
    양식: '🍕',
    꽃집: '💐',
    한식: '🍚',
    중식: '🥢',
    기타: '🏪',
}

function formatTimeRemaining(endAt: string): string {
    const end = new Date(endAt)
    const now = new Date()
    const diff = end.getTime() - now.getTime()

    if (diff <= 0) return '마감됨'

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (days > 0) return `${days}일 후`
    if (hours > 0) return `${hours}시간 후`
    return '곧 마감'
}

export default async function ListPage() {
    const { campaigns, error } = await getActiveCampaigns()

    return (
        <div className="animate-fade-in">
            {/* 필터 영역 }
<div className="sticky top-14 z-20 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 py-3 dark:border-slate-700/50 dark:bg-slate-900/80">
    <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        <Button variant="outline" size="sm" className="shrink-0 gap-1.5">
            <Filter className="h-4 w-4" />
            필터
        </Button>
        <Badge variant="default" className="shrink-0 cursor-pointer">전체</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">인스타</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">네이버</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">구글</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">카페</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">맛집</Badge>
        <Badge variant="outline" className="shrink-0 cursor-pointer hover:bg-slate-100">뷰티</Badge>
    </div>
</div>

{/* 에러 메시지 }
{
    error && (
        <div className="px-4 py-8 text-center">
            <p className="text-red-500">{error}</p>
        </div>
    )
}

{/* 결과 요약 }
<div className="px-4 py-3">
    <p className="text-sm text-slate-500">
        내 주변 <span className="font-semibold text-violet-600">{campaigns.length}개</span>의 캠페인
    </p>
</div>

{/* 캠페인 없음 }
{
    campaigns.length === 0 && !error && (
        <div className="px-4 py-16 text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">
                진행 중인 캠페인이 없습니다
            </h3>
            <p className="text-slate-500">
                새로운 캠페인이 등록되면 알려드릴게요!
            </p>
        </div>
    )
}

{/* 캠페인 리스트 }
<div className="px-4 pb-4 space-y-3">
    {campaigns.map((campaign, index) => (
        <CampaignCard
            key={campaign.id}
            campaign={campaign}
            index={index}
        />
    ))}
</div>
        </div >
    )
}

function CampaignCard({ campaign, index }: { campaign: CampaignListItem; index: number }) {
    const timeRemaining = formatTimeRemaining(campaign.end_at)
    const isUrgent = timeRemaining.includes('시간')
    const category = campaign.store?.category || '기타'

    return (
        <Link
            href={`/campaigns/${campaign.id}`}
            className="block"
        >
            <Card
                className="overflow-hidden transition-all hover:scale-[1.01] active:scale-[0.99]"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <CardContent className="p-0">
                    <div className="flex">
                        {/* 썸네일}
                        <div className="relative h-32 w-32 shrink-0 bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 flex items-center justify-center">
                            <span className="text-4xl">
                                {categoryEmojis[category] || '🏪'}
                            </span>
                            {/* 마감 임박 표시}
                            {isUrgent && (
                                <div className="absolute top-2 left-2">
                                    <Badge variant="destructive" className="text-[10px] px-1.5 py-0.5">
                                        마감임박
                                    </Badge>
                                </div>
                            )}
                        </div>

                        {/* 정보}
                        <div className="flex-1 p-4 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                                <Badge variant="secondary" className="text-[10px] shrink-0">
                                    {reviewTypeLabels[campaign.review_type] || campaign.review_type}
                                </Badge>
                                <div className="flex items-center gap-0.5 text-amber-500">
                                    <Star className="h-3.5 w-3.5 fill-current" />
                                    <span className="text-xs font-medium">4.8</span>
                                </div>
                            </div>

                            <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                                {campaign.store?.name || '매장명'}
                            </h3>

                            <p className="mt-1 text-sm text-violet-600 font-medium truncate">
                                🎁 {campaign.benefit_text}
                            </p>

                            <div className="mt-3 flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                    <MapPin className="h-3.5 w-3.5" />
                                    근처
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {campaign.current_confirmed}/{campaign.capacity}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {timeRemaining}
                                </span>
                            </div>

                            {/* 정원 진행 바}
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
                                    style={{ width: `${(campaign.current_confirmed / campaign.capacity) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
*/
