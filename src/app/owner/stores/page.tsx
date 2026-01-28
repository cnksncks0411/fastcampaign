
import Link from 'next/link'
import {
    ArrowLeft,
    Store,
    Megaphone,
    MapPin,
    Settings,
    AlertCircle,
    Clock,
    Plus,
    Users
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/common/BackButton'
import { getOwnerStoresWithStatus, getOwnerSubscriptionStats } from '../actions'
import { StoreAddButton } from '@/components/owner/StoreAddButton'

export default async function OwnerStoresPage() {
    const [storesResult, subscriptionResult] = await Promise.all([
        getOwnerStoresWithStatus(),
        getOwnerSubscriptionStats()
    ])

    if (storesResult.error || !storesResult.data) {
        return <div className="p-8 text-center text-red-500">데이터를 불러오지 못했습니다. 다시 시도해주세요.</div>
    }

    const { stores } = storesResult.data
    // Subscription stats (default values if failed)
    const subStats = 'error' in subscriptionResult ? { plan: 'BASIC', count: stores.length, limit: 1 } : subscriptionResult

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">매장 관리</h1>
                <div className="ml-auto">
                    <StoreAddButton
                        currentCount={subStats.count}
                        limit={subStats.limit}
                        plan={subStats.plan}
                    />
                </div>
            </header>

            <div className="p-5 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {stores.length === 0 ? (
                    // Empty State
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 mt-10">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                            <Store className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">등록된 매장이 없습니다</h3>
                        <p className="text-slate-500 text-sm mb-6">첫 매장을 등록하고 마케팅을 시작해보세요!</p>

                        <div className="flex justify-center">
                            <StoreAddButton
                                currentCount={subStats.count}
                                limit={subStats.limit}
                                plan={subStats.plan}
                            />
                        </div>
                    </div>
                ) : (
                    // List
                    <div className="grid gap-6">
                        {stores.map((store) => (
                            <Card key={store.id} className="border-0 shadow-lg shadow-slate-200/60 dark:shadow-none ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden bg-white dark:bg-slate-900 group">
                                {/* Store Image / Header */}
                                <div className="relative h-32 bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    {store.images && store.images.length > 0 ? (
                                        /* eslint-disable-next-line @next/next/no-img-element */
                                        <img
                                            src={store.images[0]}
                                            alt={store.name}
                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                                            <Store className="h-10 w-10 text-slate-300 dark:text-slate-600" />
                                        </div>
                                    )}
                                    <div className="absolute top-3 left-3 flex gap-2">
                                        <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-800 dark:text-slate-200 backdrop-blur-sm border-0 shadow-sm font-semibold">
                                            {store.category || '기타'}
                                        </Badge>
                                    </div>

                                    {/* Status Badges */}
                                    <div className="absolute top-3 right-3 flex flex-col gap-1.5 items-end">
                                        {store.active_campaign && (
                                            <Badge className="bg-violet-600 text-white border-0 shadow-sm animate-pulse font-bold">
                                                캠페인 진행중
                                            </Badge>
                                        )}
                                        {store.verification_status === 'PENDING' && (
                                            <Badge className="bg-orange-500 text-white border-0 shadow-sm gap-1">
                                                <Clock className="w-3 h-3" /> 심사중
                                            </Badge>
                                        )}
                                        {store.verification_status === 'REJECTED' && (
                                            <Badge className="bg-red-500 text-white border-0 shadow-sm gap-1">
                                                <AlertCircle className="w-3 h-3" /> 인증 반려
                                            </Badge>
                                        )}
                                    </div>
                                </div>

                                <CardContent className="p-5">
                                    <div className="mb-4">
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">{store.name}</h3>
                                        <div className="flex items-center text-slate-500 text-sm">
                                            <MapPin className="h-3.5 w-3.5 mr-1 shrink-0" />
                                            <span className="truncate">{store.address_text}</span>
                                        </div>
                                    </div>

                                    {/* Active Campaign Info Section */}
                                    {store.active_campaign ? (
                                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="font-semibold text-slate-900 dark:text-white text-sm line-clamp-1">
                                                    {store.active_campaign.title}
                                                </div>
                                                <Badge variant="outline" className="text-[10px] bg-white dark:bg-slate-900 h-5 shrink-0 ml-2">
                                                    D-Day
                                                </Badge>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center text-xs">
                                                    <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <Users className="w-3 h-3" /> 체크인 현황
                                                    </span>
                                                    <span className="font-bold text-violet-600 dark:text-violet-400">
                                                        {store.active_campaign.current_confirmed} / {store.active_campaign.capacity}명
                                                    </span>
                                                </div>

                                                <div className="h-1.5 w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-violet-600 rounded-full transition-all duration-500"
                                                        style={{ width: `${Math.min((store.active_campaign.current_confirmed / store.active_campaign.capacity) * 100, 100)}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mb-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center">
                                            <p className="text-xs text-slate-400 mb-2">진행 중인 캠페인이 없습니다</p>
                                            {store.verification_status === 'APPROVED' ? (
                                                <Button size="sm" variant="outline" className="h-8 text-xs w-full hover:bg-white dark:hover:bg-slate-800" asChild>
                                                    <Link href={`/owner/campaigns/create?storeId=${store.id}`}>
                                                        <Plus className="w-3 h-3 mr-1" />
                                                        새 캠페인 시작
                                                    </Link>
                                                </Button>
                                            ) : (
                                                <p className="text-xs text-orange-500 font-medium bg-orange-50 dark:bg-orange-900/20 py-1.5 rounded-lg">
                                                    {store.verification_status === 'PENDING' ? '심사가 완료되면 캠페인을 시작할 수 있습니다' : '사업자 인증이 필요합니다'}
                                                </p>
                                            )}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button variant="outline" className="h-11 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold" asChild>
                                            <Link href={`/owner/stores/${store.id}`}>
                                                <Settings className="h-4 w-4 mr-2" />
                                                정보 관리
                                            </Link>
                                        </Button>
                                        <Button
                                            className="h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-slate-200 dark:text-slate-900 text-white font-semibold disabled:bg-slate-300 dark:disabled:bg-slate-700 disabled:text-slate-500"
                                            asChild={store.verification_status === 'APPROVED'}
                                            disabled={store.verification_status !== 'APPROVED'}
                                        >
                                            {store.verification_status === 'APPROVED' ? (
                                                <Link href={`/owner/campaigns?store_id=${store.id}`}>
                                                    <Megaphone className="h-4 w-4 mr-2" />
                                                    캠페인 관리
                                                </Link>
                                            ) : (
                                                <span className="flex items-center justify-center">
                                                    <Megaphone className="h-4 w-4 mr-2 opacity-50" />
                                                    캠페인 관리
                                                </span>
                                            )}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
