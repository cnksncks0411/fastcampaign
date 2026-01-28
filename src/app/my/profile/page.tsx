
import Link from 'next/link'
import {
    Settings,
    ChevronRight,
    AlertTriangle,
    Megaphone,
    HelpCircle,
    Store,
    Coins,
    BarChart3,
    PlusCircle,
    MapPin,
    ArrowRight,
    Bell,
    CreditCard
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ThemeToggleItem } from './ThemeToggleItem'
import { SignOutButton } from './SignOutButton'
import { NotificationToggle } from './NotificationToggle'
import { Button } from '@/components/ui/button'

export default async function ProfilePage() {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // 1. 프로필 정보 조회
    const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url, role, no_show_count, restricted_until, is_notification_on')
        .eq('id', user.id)
        .single()

    const isRestricted = profile?.restricted_until && new Date(profile.restricted_until) > new Date()
    const isOwner = profile?.role === 'OWNER'

    // 2. OWNER일 경우 추가 데이터 조회
    let stats = {
        storeCount: 0,
        activeCampaigns: 0,
        points: 0
    }

    if (isOwner) {
        const [storesRes, campaignsRes, walletRes] = await Promise.all([
            // 매장 수
            supabase.from('stores').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('status', 'ACTIVE').eq('is_deleted', false),
            // 활성 캠페인 수
            supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('created_by', user.id).in('status', ['ACTIVE', 'FULL']),
            // 포인트 잔액
            supabase.from('points_wallets').select('balance').eq('owner_id', user.id).single()
        ])

        stats = {
            storeCount: storesRes.count || 0,
            activeCampaigns: campaignsRes.count || 0,
            points: walletRes.data?.balance || 0
        }
    }

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            {/* 상단 프로필 & 대시보드 영역 */}
            <div className="bg-white dark:bg-slate-900 rounded-b-[2.5rem] shadow-sm border-b border-slate-100 dark:border-slate-800 overflow-hidden relative">
                {/* 배경 장식 */}
                <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-violet-50/50 via-slate-50/50 to-transparent dark:from-violet-900/10 dark:via-slate-900/0" />

                <div className="px-6 pt-12 pb-8 relative z-10">
                    {/* 프로필 헤더 */}
                    <div className="flex flex-col items-center text-center mb-8">
                        <div className="flex items-center justify-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                                {profile?.nickname || '사용자'}님
                            </h1>
                            {isOwner && (
                                <Badge className="bg-violet-600 hover:bg-violet-700 border-0 text-white px-2 py-0.5 text-[10px] font-bold shadow-sm shadow-violet-200 dark:shadow-none translate-y-0.5">
                                    PARTNER
                                </Badge>
                            )}
                        </div>
                        <p className="text-sm text-slate-400 dark:text-slate-500 font-mono">
                            {user.email}
                        </p>
                    </div>

                    {/* OWNER 대시보드 (통계 & 퀵메뉴) */}
                    {isOwner ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-700">
                            {/* Dashboard Stats */}
                            <section className="space-y-3">
                                {/* Row 1: Points (Full Width) */}
                                <Link href="/owner/points" className="block group">
                                    <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-slate-800 flex items-center justify-between transition-all group-active:scale-[0.99] group-hover:border-slate-200 dark:group-hover:border-slate-700">
                                        <div>
                                            <div className="text-xs text-slate-500 font-medium mb-1">보유 포인트</div>
                                            <div className={`font-bold text-slate-900 dark:text-white leading-none ${stats.points > 999999 ? 'text-2xl tracking-tight' : 'text-3xl'}`}>
                                                {stats.points.toLocaleString()}<span className="text-sm font-normal ml-0.5 text-slate-400">P</span>
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform shadow-sm shadow-amber-100 dark:shadow-none">
                                            <Coins className="h-5 w-5" />
                                        </div>
                                    </div>
                                </Link>

                                {/* Row 2: Grid */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* 등록 매장 */}
                                    <Link href="/owner/stores" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[100px] transition-all active:scale-[0.98] hover:border-slate-200 dark:hover:border-slate-700 group">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-500 mb-2 group-hover:scale-110 transition-transform">
                                            <Store className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-slate-500 font-medium flex items-center">
                                                등록 매장 <ChevronRight className="w-3 h-3 ml-0.5 text-slate-300" />
                                            </div>
                                            <div className="font-bold text-xl text-slate-900 dark:text-white leading-tight">
                                                {stats.storeCount}<span className="text-xs font-normal ml-0.5 text-slate-400">개</span>
                                            </div>
                                        </div>
                                    </Link>

                                    {/* 진행 캠페인 */}
                                    <Link href="/owner/campaigns" className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col justify-between h-[100px] transition-all active:scale-[0.98] hover:border-slate-200 dark:hover:border-slate-700 group">
                                        <div className="w-8 h-8 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-500 mb-2 group-hover:scale-110 transition-transform">
                                            <Megaphone className="h-4 w-4" />
                                        </div>
                                        <div>
                                            <div className="text-[11px] text-slate-500 font-medium flex items-center">
                                                진행 캠페인 <ChevronRight className="w-3 h-3 ml-0.5 text-slate-300" />
                                            </div>
                                            <div className="font-bold text-xl text-slate-900 dark:text-white leading-tight">
                                                {stats.activeCampaigns}<span className="text-xs font-normal ml-0.5 text-slate-400">개</span>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </section>
                        </div>
                    ) : (
                        // USER 상태일 때: 매장 등록 유도
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <Link href="/owner/register-store" className="block group">
                                <div className="bg-slate-900 dark:bg-slate-800 rounded-2xl p-5 text-white shadow-xl shadow-slate-200 dark:shadow-none flex items-center justify-between group-active:scale-[0.98] transition-transform relative overflow-hidden">
                                    {/* Shine effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />

                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <Store className="h-4 w-4 text-orange-300" />
                                            <span className="text-orange-300 text-xs font-bold">PARTNER CENTER</span>
                                        </div>
                                        <h3 className="font-bold text-lg">
                                            사장님이신가요?
                                        </h3>
                                        <p className="text-slate-400 text-xs mt-1">
                                            매장을 등록하고 무료로 홍보하세요
                                        </p>
                                    </div>
                                    <div className="h-10 w-10 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm group-hover:bg-white/20 transition-colors">
                                        <ArrowRight className="h-5 w-5 text-white" />
                                    </div>
                                </div>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            <div className="px-5 mt-6 space-y-6">
                {/* 경고 메시지 */}
                {isRestricted && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50 rounded-2xl p-4 flex items-start gap-3">
                        <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="font-bold text-red-700 dark:text-red-400 text-sm">서비스 이용 제한</h3>
                            <p className="text-xs text-red-600 dark:text-red-500 mt-1 leading-relaxed">
                                잦은 노쇼로 인해 {new Date(profile.restricted_until!).toLocaleDateString()}까지
                                캠페인 신청이 제한됩니다.
                            </p>
                        </div>
                    </div>
                )}

                {/* 앱 설정 */}
                <section>
                    <h2 className="text-xs font-bold text-slate-400 mb-3 ml-1">설정</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <ThemeToggleItem />

                        <Link href="/my/settings" className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-full bg-slate-50 dark:bg-slate-800 flex items-center justify-center">
                                <Settings className="h-5 w-5 text-slate-500" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100">계정 설정</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </Link>

                        {isOwner && (
                            <>
                                <NotificationToggle initialValue={profile.is_notification_on ?? true} user_id={user.id} />
                                <Link href="/my/payment" className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                        <CreditCard className="h-5 w-5 text-indigo-500" />
                                    </div>
                                    <div className="flex-1">
                                        <span className="font-medium text-slate-900 dark:text-slate-100">결제 정보</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-slate-300" />
                                </Link>
                            </>
                        )}
                    </div>
                </section>

                {/* 고객 지원 */}
                <section>
                    <h2 className="text-xs font-bold text-slate-400 mb-3 ml-1">고객 지원</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <Link href="/support/notices" className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                            <div className="h-10 w-10 rounded-full bg-amber-50 dark:bg-amber-900/30 flex items-center justify-center">
                                <Megaphone className="h-5 w-5 text-amber-600 dark:text-amber-500" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100 block">공지사항</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </Link>
                        <Link href="/support/faq" className="flex items-center gap-4 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                            <div className="h-10 w-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center">
                                <HelpCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                            </div>
                            <div className="flex-1">
                                <span className="font-medium text-slate-900 dark:text-slate-100 block">자주 묻는 질문</span>
                            </div>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </Link>
                    </div>
                </section>

                {/* 약관 및 정보 */}
                <section>
                    <h2 className="text-xs font-bold text-slate-400 mb-3 ml-1">약관 및 정책</h2>
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden">
                        <Link href="/legal/terms" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                            <span className="text-sm text-slate-600 dark:text-slate-400">서비스 이용약관</span>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </Link>
                        <Link href="/legal/privacy" className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors border-b border-slate-50 dark:border-slate-800">
                            <span className="text-sm text-slate-600 dark:text-slate-400">개인정보 처리방침</span>
                            <ChevronRight className="h-4 w-4 text-slate-300" />
                        </Link>
                        <div className="flex items-center justify-between p-4">
                            <span className="text-sm text-slate-600 dark:text-slate-400">앱 버전</span>
                            <span className="text-xs font-bold text-slate-400">v1.0.0</span>
                        </div>
                    </div>
                </section>

                {/* 로그아웃 버튼 */}
                <div className="pb-8">
                    <SignOutButton />
                </div>
            </div>
        </div >
    )
}
