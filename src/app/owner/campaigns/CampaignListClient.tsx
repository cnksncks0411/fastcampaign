'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from '@/components/ui/input'
import { Megaphone, Calendar, Users, Store, ArrowRight, ArrowLeft, ChevronDown, Check, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { BackButton } from '@/components/common/BackButton'

type Campaign = {
    id: string
    title: string
    status: 'ACTIVE' | 'FULL' | 'ENDED'
    current_confirmed: number
    capacity: number
    end_at: string
    store_id: string
    stores?: {
        name: string
    }
}

export default function CampaignListClient({
    campaigns,
    stores,
    initialStoreId
}: {
    campaigns: Campaign[]
    stores: { id: string; name: string }[]
    initialStoreId?: string
}) {
    const router = useRouter()
    const [tab, setTab] = useState<'ACTIVE' | 'ENDED'>('ACTIVE')
    const [selectedStoreId, setSelectedStoreId] = useState<string>(initialStoreId || 'ALL')
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
    const [storeSearch, setStoreSearch] = useState('')

    const filteredCampaigns = campaigns.filter(c => {
        // Store Filter
        if (selectedStoreId !== 'ALL' && c.store_id !== selectedStoreId) return false

        // Status Filter
        if (tab === 'ACTIVE') return c.status === 'ACTIVE' || c.status === 'FULL'
        if (tab === 'ENDED') return c.status !== 'ACTIVE' && c.status !== 'FULL'
        return true
    })

    const selectedStoreName = selectedStoreId === 'ALL' ? '전체 매장' : stores.find(s => s.id === selectedStoreId)?.name || '매장 선택'
    const filteredStores = stores.filter(s => s.name.includes(storeSearch))

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-24">
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">
                    캠페인 목록
                </h1>
            </header>

            <div className="p-5 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">

                {/* Store Selector (Modal Trigger) */}
                {stores.length > 0 && (
                    <div
                        onClick={() => setIsStoreModalOpen(true)}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl h-11 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <span className={cn("font-bold text-sm", selectedStoreId === 'ALL' ? "text-slate-900 dark:text-white" : "text-violet-600 dark:text-violet-400")}>
                            {selectedStoreName}
                        </span>
                        <ChevronDown className="w-4 h-4 text-slate-400" />
                    </div>
                )}

                {/* Status Tabs */}
                <Tabs value={tab} onValueChange={(v) => setTab(v as any)} className="w-full">
                    <TabsList className="w-full bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-11">
                        <TabsTrigger value="ACTIVE" className="flex-1 rounded-lg text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">진행중</TabsTrigger>
                        <TabsTrigger value="ENDED" className="flex-1 rounded-lg text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none">완료됨</TabsTrigger>
                    </TabsList>
                </Tabs>

                {filteredCampaigns.length === 0 ? (
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 mt-4">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center mb-4">
                            <Megaphone className="h-8 w-8 text-slate-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">
                            {tab === 'ACTIVE' ? '진행 중인 캠페인이 없습니다' : '완료된 캠페인이 없습니다'}
                        </h3>
                        <p className="text-slate-500 text-sm mb-6">
                            {selectedStoreId !== 'ALL'
                                ? '이 매장에서 새로운 캠페인을 만들어보세요!'
                                : '매장을 등록하고 새로운 캠페인을 시작해보세요!'}
                        </p>
                        {tab === 'ACTIVE' && (
                            <Link
                                href={selectedStoreId !== 'ALL' ? `/owner/campaigns/create?storeId=${selectedStoreId}` : "/owner/stores"}
                                className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-sm"
                            >
                                {selectedStoreId !== 'ALL' ? '이 매장에서 캠페인 시작' : '새 캠페인 만들기'}
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredCampaigns.map((campaign) => (
                            <Link key={campaign.id} href={`/owner/campaigns/${campaign.id}`} className="block group">
                                <Card className="border-0 shadow-sm hover:shadow-md transition-all bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                                    <CardContent className="p-5">
                                        <div className="flex justify-between items-start mb-3">
                                            <div>
                                                <div className="flex items-center text-xs text-slate-500 mb-1">
                                                    <Store className="w-3 h-3 mr-1" />
                                                    {campaign.stores?.name}
                                                </div>
                                                <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-violet-600 transition-colors line-clamp-1">
                                                    {campaign.title}
                                                </h3>
                                            </div>
                                            <Badge variant={campaign.status === 'ACTIVE' || campaign.status === 'FULL' ? 'default' : 'secondary'} className={cn(
                                                campaign.status === 'ACTIVE' || campaign.status === 'FULL' ? 'bg-violet-600' : 'bg-slate-100 text-slate-500'
                                            )}>
                                                {campaign.status === 'ACTIVE' ? '진행중' : campaign.status === 'FULL' ? '마감임박' : '종료'}
                                            </Badge>
                                        </div>

                                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-4 h-4 text-slate-400" />
                                                <span>{campaign.current_confirmed} / {campaign.capacity}명</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-4 h-4 text-slate-400" />
                                                <span>~ {new Date(campaign.end_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                            <div
                                                className="bg-violet-500 h-full rounded-full transition-all duration-500"
                                                style={{ width: `${Math.min((campaign.current_confirmed / campaign.capacity) * 100, 100)}%` }}
                                            />
                                        </div>
                                    </CardContent>
                                    <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
                                        <span className="text-xs font-medium text-slate-500">리뷰어 관리하기</span>
                                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Store Selection Modal */}
            <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl z-[100]">
                    <DialogHeader className="p-5 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <DialogTitle>매장 필터</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm mt-1">
                            목록을 확인하고 싶은 매장을 선택해주세요.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900 sticky top-[80px] z-10">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                placeholder="매장 검색"
                                value={storeSearch}
                                onChange={e => setStoreSearch(e.target.value)}
                                className="pl-9 bg-slate-50 border-none h-10 ring-0 focus-visible:ring-0 text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 min-h-[300px] max-h-[50vh] bg-white dark:bg-slate-900">
                        {/* 'All' Option */}
                        <div
                            onClick={() => { setSelectedStoreId('ALL'); setIsStoreModalOpen(false); }}
                            className={cn(
                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 select-none",
                                selectedStoreId === 'ALL' ? "bg-violet-50 dark:bg-violet-900/20 box-border border border-violet-500" : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                            )}
                        >
                            <div className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 border",
                                selectedStoreId === 'ALL' ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 bg-white"
                            )}>
                                {selectedStoreId === 'ALL' && <div className="w-2 h-2 rounded-full bg-white" />}
                            </div>
                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200">전체 매장</div>
                        </div>

                        {filteredStores.map(store => {
                            const isSelected = selectedStoreId === store.id
                            return (
                                <div
                                    key={store.id}
                                    onClick={() => { setSelectedStoreId(store.id); setIsStoreModalOpen(false); }}
                                    className={cn(
                                        "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 select-none",
                                        isSelected ? "bg-violet-50 dark:bg-violet-900/20 box-border border border-violet-500" : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent"
                                    )}
                                >
                                    <div className={cn(
                                        "w-5 h-5 rounded-full flex items-center justify-center transition-colors shrink-0 border",
                                        isSelected ? "bg-violet-600 border-violet-600 text-white" : "border-slate-300 bg-white"
                                    )}>
                                        {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200">
                                        {store.name}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky bottom-0 z-10 w-full">
                        <Button onClick={() => setIsStoreModalOpen(false)} variant="outline" className="w-full h-11 rounded-xl font-bold text-base">
                            닫기
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
