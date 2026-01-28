'use client'

import { useAuth } from '@/components/providers/AuthProvider'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, PanInfo } from 'framer-motion'
import {
    Search, Store, ChevronUp, ChevronDown,
    Coffee, Utensils, Scissors, Clock, Users, Gift, MapPin,
    Plus, QrCode, Wallet, X
} from 'lucide-react'
import { NaverMap, useCurrentLocation } from '@/components/map/NaverMap'
import { Badge } from '@/components/ui/badge'
import { getActiveCampaigns, type CampaignListItem } from './campaigns/actions'
import { getOwnerStoresWithStatus } from '@/app/owner/actions'
// 카테고리 목록
const CATEGORIES = ['전체', '맛집', '카페', '뷰티', '문화', '기타']

// 카테고리별 아이콘 매핑
const getCategoryIcon = (category: string | null) => {
    switch (category) {
        case '카페': return Coffee
        case '맛집': return Utensils
        case '뷰티': return Scissors
        case '문화': return Gift
        default: return Store
    }
}

export default function HomePage() {
    const router = useRouter()
    const { location } = useCurrentLocation()
    const [isOpen, setIsOpen] = useState(false)
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { isOwner } = useAuth()

    const handleCreateCampaign = async () => {
        setIsMenuOpen(false)

        // 1. 매장 및 캠페인 상태 확인
        const { data, error } = await getOwnerStoresWithStatus()
        if (error || !data) {
            return alert('매장 정보를 불러오는데 실패했습니다.')
        }

        // 2. 캠페인 생성 가능한 매장(활성 캠페인이 없는 매장) 확인
        const availableStores = data.stores.filter(store => !store.active_campaign)

        if (availableStores.length === 0) {
            // 모든 매장이 캠페인 진행 중
            return alert('모든 매장에서 현재 캠페인을 진행 중입니다.\n기존 캠페인이 종료된 후 새 캠페인을 등록할 수 있습니다.')
        }

        // 3. 이동 (매장 목록 페이지에서 캠페인 생성 시작)
        router.push('/owner/stores')
    }

    // 캠페인 데이터 상태
    const [campaigns, setCampaigns] = useState<CampaignListItem[]>([])
    const [filteredCampaigns, setFilteredCampaigns] = useState<CampaignListItem[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('전체')
    const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number } | null>(null)
    const [bounds, setBounds] = useState<{ south: number, west: number, north: number, east: number } | null>(null)

    // 데이터 로드 (지도 영역 변경 시 서버 요청)
    useEffect(() => {
        if (!bounds) return

        setIsLoading(true)
        const timer = setTimeout(async () => {
            try {
                console.log('Fetching campaigns for bounds:', bounds)
                const { campaigns: newCampaigns, error } = await getActiveCampaigns({ bounds })
                if (!error) {
                    setCampaigns(newCampaigns)
                }
            } catch (err) {
                console.error('Failed to load campaigns', err)
            } finally {
                setIsLoading(false)
            }
        }, 300) // 300ms 디바운스

        return () => clearTimeout(timer)
    }, [bounds])

    // 검색 및 필터링 로직
    useEffect(() => {
        let result = campaigns

        // 1. 카테고리 필터링
        if (selectedCategory !== '전체') {
            result = result.filter(c => (c.store.category || '기타') === selectedCategory)
        }

        // 2. 지도 영역 필터링은 이제 서버에서 처리됨
        // (client-side 필터링 코드 제거)

        setFilteredCampaigns(result)
    }, [selectedCategory, campaigns])

    // 주소 검색 핸들러
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()

        if (typeof window === 'undefined' || !window.naver?.maps?.Service) {
            alert('지도를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
            return
        }

        const query = searchQuery.trim()
        if (!query) return

        // 검색어 후보군 생성
        const candidates: string[] = []

        // 1. '역'으로 끝나는 경우 (예: "강남역")
        if (query.endsWith('역')) {
            candidates.push(query)                 // "강남역"
            candidates.push(query.replace(/역$/, '')) // "강남" (혹시 역 이름이 검색 안될 경우 대비)
        }
        // 2. 공백이 있는 경우 (주소일 가능성 높음)
        else if (query.includes(' ')) {
            candidates.push(query) // "서울시 강남구 ..."
        }
        // 3. 그 외 단일 검색어 (지역명일 가능성 높음)
        else {
            candidates.push(query + '역') // "철산역" (역 우선)
            candidates.push(query)        // "철산" (지역명 후순위)
        }

        console.log('Search candidates:', candidates)

        // 재귀적으로 후보군 검색
        const trySearch = (index: number) => {
            if (index >= candidates.length) {
                return alert('검색 결과를 찾을 수 없습니다.')
            }

            const currentQuery = candidates[index]
            console.log(`Attempt ${index + 1}: ${currentQuery}`)

            naver.maps.Service.geocode({
                query: currentQuery
            }, (status, response) => {
                // 검색 실패 시 다음 후보 시도
                if (status !== naver.maps.Service.Status.OK || response.v2.meta.totalCount === 0) {
                    trySearch(index + 1)
                    return
                }

                // 성공
                const result = response.v2.addresses[0]
                if (result) {
                    const lat = parseFloat(result.y)
                    const lng = parseFloat(result.x)
                    console.log('Search success:', { query: currentQuery, lat, lng })
                    setMapCenter({ lat, lng })
                }
            })
        }

        trySearch(0)
    }

    // 지도 마커 데이터 변환
    const mapMarkers = filteredCampaigns.map(camp => ({
        id: camp.id,
        lat: camp.store.lat,
        lng: camp.store.lng,
        title: camp.store.name,
        onClick: () => router.push(`/campaigns/${camp.id}`)
    }))

    // 바텀시트 드래그 핸들러
    const handleDragEnd = (event: any, info: PanInfo) => {
        if (info.offset.y < -50) {
            setIsOpen(true)
        } else if (info.offset.y > 50) {
            setIsOpen(false)
        }
    }

    return (
        <div className="relative w-full h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            {/* 상단 UI */}
            <div className="absolute top-0 left-0 right-0 z-20 pt-4 pb-4 bg-gradient-to-b from-slate-50/90 via-slate-50/50 to-transparent dark:from-slate-950/90 dark:via-slate-950/50 pointer-events-none">
                <div className="px-4 flex gap-3 items-center pointer-events-auto">
                    {/* 검색바 */}
                    <form onSubmit={handleSearch} className="flex-1 bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none rounded-2xl flex items-center px-4 h-[52px] transition-all active:scale-[0.99] border border-slate-100 dark:border-slate-800">

                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="지역, 지하철역, 주소 검색"
                            className="w-full bg-transparent text-[15px] focus:outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-slate-100 h-full"
                        />
                        <button type="submit">
                            <Search className="h-5 w-5 text-violet-500 shrink-0 ml-2" />
                        </button>
                    </form>

                    {/* 사장님 퀵 메뉴 (OWNER만 노출) */}
                    {isOwner && (
                        <div className="relative">
                            <button
                                onClick={() => setIsMenuOpen(!isMenuOpen)}
                                className="h-[52px] w-[52px] bg-white dark:bg-slate-900 shadow-[0_2px_12px_rgba(0,0,0,0.06)] dark:shadow-none rounded-2xl flex items-center justify-center transition-all active:scale-95 border border-slate-100 dark:border-slate-800 z-30 relative"
                            >
                                {isMenuOpen ? (
                                    <X className="h-6 w-6 text-slate-900 dark:text-white" />
                                ) : (
                                    <Store className="h-6 w-6 text-violet-600 dark:text-violet-400" />
                                )}
                            </button>

                            {/* 퀵 메뉴 팝업 */}
                            {isMenuOpen && (
                                <>
                                    {/* 백그라운드 오버레이 (클릭 시 닫힘) */}
                                    <div
                                        className="fixed inset-0 z-20"
                                        onClick={() => setIsMenuOpen(false)}
                                    />

                                    <motion.div
                                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                        transition={{ duration: 0.2 }}
                                        className="absolute top-full right-0 mt-3 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-2 z-30 flex flex-col gap-1 overflow-hidden"
                                    >
                                        <button
                                            onClick={handleCreateCampaign}
                                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 dark:text-violet-400 group-hover:bg-violet-600 group-hover:text-white transition-colors">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">캠페인 만들기</span>
                                        </button>

                                        <Link
                                            href="/owner/checkin"
                                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                                <QrCode className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">QR 스캐너</span>
                                        </Link>

                                        <Link
                                            href="/owner/points/charge"
                                            className="flex items-center gap-3 w-full p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left group"
                                            onClick={() => setIsMenuOpen(false)}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                                                <Wallet className="h-4 w-4" />
                                            </div>
                                            <span className="text-sm font-bold text-slate-700 dark:text-slate-300">포인트 충전</span>
                                        </Link>
                                    </motion.div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 지도 영역 */}
            <div className="flex-1 w-full h-full bg-slate-100 dark:bg-slate-900 relative z-0">
                <NaverMap
                    className="w-full h-full"
                    center={mapCenter || location || undefined}
                    showCurrentLocation={true}
                    markers={mapMarkers}
                    onBoundsChange={setBounds}
                />
            </div>

            {/* Bottom Sheet */}
            <motion.div
                className="absolute -bottom-[1px] left-0 right-0 z-20 bg-white dark:bg-slate-900 rounded-t-[24px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] dark:shadow-[0_-5px_15px_rgba(0,0,0,0.3)] flex flex-col after:bg-white dark:after:bg-slate-900 after:absolute after:top-full after:left-0 after:right-0 after:h-[200px]"
                initial={false}
                animate={{
                    height: isOpen ? '85%' : '112px',
                    y: 0
                }}
                transition={{ type: "spring", damping: 30, stiffness: 250 }}
                drag="y"
                dragConstraints={{ top: 0, bottom: 0 }}
                dragElastic={0.1}
                onDragEnd={handleDragEnd}
            >
                {/* 핸들바 영역 */}
                <div
                    className="w-full pt-3 pb-2 flex justify-center cursor-grab active:cursor-grabbing hover:bg-slate-50/50 dark:hover:bg-slate-800/50 rounded-t-[24px] transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
                </div>

                {/* 요약 헤더 */}
                <div className="px-5 pb-5 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
                    <div className="flex justify-between items-end">
                        <div className="space-y-0.5">
                            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-1.5">
                                주변 혜택 <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 text-xs font-bold">{filteredCampaigns.length}</span>
                            </h2>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">내 주변 캠페인을 찾아보세요</p>
                        </div>

                        {/* 목록보기 버튼 */}
                        <button className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                            {isOpen ? (
                                <>지도보기 <ChevronDown className="h-3 w-3 stroke-[3px]" /></>
                            ) : (
                                <>목록보기 <ChevronUp className="h-3 w-3 stroke-[3px]" /></>
                            )}
                        </button>
                    </div>
                </div>

                {/* 리스트 (스크롤 영역) */}
                <div className="flex-1 overflow-y-auto bg-slate-50/50 dark:bg-slate-950/50 px-5 pt-4 pb-24 space-y-4 scrollbar-hide">

                    {/* 카테고리 필터 */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                        {CATEGORIES.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`
                                    px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors
                                    ${selectedCategory === cat
                                        ? 'bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-none'
                                        : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700'}
                                `}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    {isLoading ? (
                        <div className="text-center py-10 text-slate-400">
                            <div className="animate-spin h-6 w-6 border-2 border-violet-500 border-t-transparent rounded-full mx-auto mb-2" />
                            Loading...
                        </div>
                    ) : filteredCampaigns.length === 0 ? (
                        <div className="text-center py-10 text-slate-400">
                            조건에 맞는 캠페인이 없습니다.
                        </div>
                    ) : filteredCampaigns.map(camp => {
                        const category = camp.store.category || '기타'
                        const Icon = getCategoryIcon(category)

                        // 마감일 계산
                        const end = new Date(camp.end_at)
                        const now = new Date()
                        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
                        const deadlineText = diff <= 0 ? '오늘 마감' : `D-${diff}`

                        return (
                            <Link key={camp.id} href={`/campaigns/${camp.id}`} className="block group">
                                <div className="bg-white dark:bg-slate-900 rounded-[24px] p-5 border border-slate-100 dark:border-slate-800 shadow-sm group-active:scale-[0.98] transition-all duration-200 hover:shadow-lg hover:shadow-violet-100/50 dark:hover:shadow-none hover:border-violet-100 dark:hover:border-slate-700">
                                    <div className="flex gap-5">
                                        {/* 아이콘 */}
                                        <div className="w-[84px] h-[84px] rounded-[20px] bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 group-hover:text-violet-500 dark:group-hover:text-violet-400 group-hover:bg-violet-50 dark:group-hover:bg-slate-800 transition-colors shrink-0">
                                            <Icon className="h-8 w-8 stroke-[1.5px]" />
                                        </div>

                                        {/* 정보 */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                                            <div>
                                                <div className="flex justify-between items-start mb-1">
                                                    <div className="flex items-center gap-2">
                                                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-0 rounded-md font-medium text-[10px] px-2 h-5">
                                                            {category}
                                                        </Badge>
                                                        {/* 쿠폰 여부는 DB 컬럼에 없으므로 임시 제외하거나 필요한 경우 추가 */}
                                                        {camp.review_type && (
                                                            <Badge className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 border-0 rounded-md font-medium text-[10px] px-2 h-5">
                                                                {camp.review_type === 'INSTAGRAM_STORY' ? '스토리' : '피드'}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    {/* 거리 계산은 현재 위치가 있어야 가능하므로 임시 표시 */}
                                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 flex items-center gap-0.5">
                                                        {camp.store.name}
                                                    </span>
                                                </div>

                                                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-[17px] truncate leading-tight mb-1">{camp.title}</h3>

                                                <div className="flex items-center text-violet-600 dark:text-violet-400 font-bold text-[14px]">
                                                    <div className="min-w-[4px] h-[4px] bg-violet-600 dark:bg-violet-400 rounded-full mr-1.5" />
                                                    <span className="truncate">{camp.benefit_text}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-2">
                                                <div className="flex items-center gap-1">
                                                    <Users className="h-3.5 w-3.5" />
                                                    <span>{camp.current_confirmed}/{camp.capacity}명</span>
                                                </div>
                                                <div className="w-[1px] h-2.5 bg-slate-200 dark:bg-slate-700" />
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3.5 w-3.5" />
                                                    <span className={deadlineText === '오늘 마감' ? 'text-amber-500 dark:text-amber-400' : ''}>
                                                        {deadlineText}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}

                    <div className="h-12" /> {/* 최하단 안전 여백 */}
                </div>
            </motion.div>
        </div>
    )
}
