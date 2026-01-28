import { notFound } from 'next/navigation'
import {
    MapPin,
    Clock,
    Coffee,
    Utensils,
    Scissors,
    Gift,
    Store,
    Image as ImageIcon,
    AlarmClock
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getCampaignById } from '../actions'
import { ApplyButton } from './apply-button'
import { CampaignDetailHeader } from './header'

// 카테고리별 아이콘 매핑 (메인과 동일)
const getCategoryIcon = (category: string | null) => {
    switch (category) {
        case '카페': return Coffee
        case '맛집': return Utensils
        case '뷰티': return Scissors
        case '문화': return Gift
        default: return Store
    }
}

const reviewTypeLabels: Record<string, string> = {
    INSTAGRAM_STORY: '인스타그램 스토리',
    INSTAGRAM_FEED: '인스타그램 피드',
    NAVER_BLOG: '네이버 블로그',
    NAVER_PLACE: '네이버 플레이스',
    GOOGLE_REVIEW: '구글 리뷰',
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

export default async function CampaignDetailPage({
    params
}: {
    params: Promise<{ id: string }>
}) {
    const { id } = await params
    const { campaign, error } = await getCampaignById(id)

    if (error || !campaign) {
        notFound()
    }

    // 로그인한 사용자의 경우 신청 여부 확인
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let hasApplied = false
    if (user) {
        const { data: existingApp } = await supabase
            .from('applications')
            .select('id')
            .eq('campaign_id', id)
            .eq('user_id', user.id)
            .single()

        hasApplied = !!existingApp
    }

    const spotsLeft = campaign.capacity - campaign.current_confirmed
    const timeRemaining = formatTimeRemaining(campaign.end_at)
    const isUrgent = timeRemaining.includes('시간')
    const category = campaign.store?.category || '기타'

    const CategoryIcon = getCategoryIcon(category)

    return (
        <div className="animate-fade-in pb-24 bg-white dark:bg-slate-950 min-h-screen">
            {/* 헤더 (Client Component) */}
            <CampaignDetailHeader />

            {/* 이미지 영역 (이미지가 없으므로 아이콘으로 대체) */}
            <div className="relative h-64 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-300 dark:text-slate-700">
                    <div className="p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-sm">
                        <CategoryIcon className="h-16 w-16 text-slate-400 dark:text-slate-500 stroke-[1.5px]" />
                    </div>
                </div>
                {/* 마감 임박 */}
                {isUrgent && (
                    <div className="absolute top-4 left-4">
                        <Badge variant="destructive" className="shadow-lg flex items-center gap-1.5 px-3 py-1.5">
                            <AlarmClock className="h-3.5 w-3.5" />
                            <span>마감 임박!</span>
                        </Badge>
                    </div>
                )}
            </div>

            {/* 메인 정보 */}
            <div className="px-5 py-6">
                <div className="mb-6">
                    <Badge variant="secondary" className="mb-2 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                        {reviewTypeLabels[campaign.review_type] || campaign.review_type}
                    </Badge>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                        {campaign.store?.name || '매장명'}
                    </h1>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                        <MapPin className="h-4 w-4 shrink-0" />
                        {campaign.store?.address_text || '주소 정보 없음'}
                    </p>
                </div>

                {/* 혜택 카드 */}
                <Card className="border-violet-100 bg-violet-50/50 dark:bg-violet-900/10 dark:border-violet-900/30">
                    <CardContent className="p-5">
                        <p className="text-sm font-medium text-violet-600/80 dark:text-violet-400/80 mb-1">제공 혜택</p>
                        <p className="text-xl font-bold text-violet-700 dark:text-violet-300">
                            {campaign.benefit_text}
                        </p>
                    </CardContent>
                </Card>

                {/* 캠페인 설명 */}
                {campaign.description && (
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">소개</h2>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                            {campaign.description}
                        </p>
                    </div>
                )}

                {/* 필수 태그 */}
                {campaign.required_tags && campaign.required_tags.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">필수 태그</h2>
                        <div className="flex flex-wrap gap-2">
                            {campaign.required_tags.map((tag) => (
                                <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-sm font-medium">
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 방문 가능 시간 */}
                {campaign.visit_time_windows && campaign.visit_time_windows.length > 0 && (
                    <div className="mt-8">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-3">방문 가능 시간</h2>
                        <div className="space-y-2">
                            {campaign.visit_time_windows.map((window, idx) => (
                                <div key={idx} className="flex items-center gap-3 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="font-medium text-slate-900 dark:text-slate-200">{window.day}</span>
                                    <span>{window.time}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* 신청 현황 */}
                <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-slate-900 dark:text-white">신청 현황</h2>
                        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">
                            {(campaign.current_confirmed / campaign.capacity * 100).toFixed(0)}% 달성
                        </span>
                    </div>

                    <div className="h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700 mb-2">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all duration-500"
                            style={{ width: `${(campaign.current_confirmed / campaign.capacity) * 100}%` }}
                        />
                    </div>

                    <div className="flex justify-between items-center text-sm">
                        <span className="text-slate-500 dark:text-slate-400">
                            {campaign.current_confirmed}명 신청중
                        </span>
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                            총 {campaign.capacity}명 모집
                        </span>
                    </div>
                </div>
            </div>

            {/* 하단 신청 버튼 (단독) */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-slate-200/50 bg-white/90 backdrop-blur-xl px-5 py-4 dark:border-slate-800/50 dark:bg-slate-900/90 z-20 pb-safe">
                <div className="mx-auto max-w-lg">
                    <ApplyButton
                        campaignId={campaign.id}
                        spotsLeft={spotsLeft}
                        isFull={campaign.status === 'FULL' || spotsLeft <= 0}
                        isApplied={hasApplied}
                    />
                </div>
            </div>
        </div>
    )
}
