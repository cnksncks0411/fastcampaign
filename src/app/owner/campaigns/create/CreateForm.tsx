'use client'

import { useState, useEffect, useActionState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Store, Megaphone, Minus, Plus, Search, X, ChevronDown, Calendar, Clock, MapPin, Instagram, ChevronUp, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { PointChargeModal } from '@/components/payment/PointChargeModal'
import { createCampaign } from '../../actions'
import { cn } from '@/lib/utils'
import type { StoreWithStatus } from '../../actions'

// 리뷰 타입
const reviewTypes = [
    { value: 'INSTAGRAM_STORY', label: '인스타그램 스토리', desc: '24시간 노출', icon: Instagram },
    { value: 'NAVER_PLACE', label: '네이버 플레이스', desc: '영수증/방문자 리뷰', icon: MapPin },
]

const COST_PER_PERSON = 1000

const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
    const min = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${min}`
})

// Custom Time Select Component
function TimeSelect({ value, onChange, options = timeOptions }: { value: string, onChange: (val: string) => void, options?: string[] }) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    return (
        <div className="relative flex-1" ref={containerRef}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="w-full h-11 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors"
            >
                <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{value === '00:00' && options[options.length - 1] === '00:00' && options.length === 1 ? '00:00 (익일)' : (value || '시간 선택')}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
            </div>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg max-h-48 overflow-y-auto z-50">
                    {options.map((t) => (
                        <div
                            key={t}
                            onClick={() => { onChange(t); setIsOpen(false); }}
                            className={cn(
                                "px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50 transition-colors",
                                value === t && "bg-violet-50 text-violet-600 font-bold"
                            )}
                        >
                            {t === '00:00' && options[options.length - 1] === '00:00' ? '00:00 (익일)' : t}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export function CreateForm({ storeData }: { storeData: StoreWithStatus }) {
    const router = useRouter()
    const [state, formAction] = useActionState(createCampaign, {})
    const dateInputRef = useRef<HTMLInputElement>(null)
    const formRef = useRef<HTMLFormElement>(null)

    // States
    const [isStoreModalOpen, setIsStoreModalOpen] = useState(false)
    const [isChargeModalOpen, setIsChargeModalOpen] = useState(false)
    const [selectedStoreIds, setSelectedStoreIds] = useState<string[]>([])
    const [storeSearch, setStoreSearch] = useState('')
    const [reviewType, setReviewType] = useState('INSTAGRAM_STORY')
    const [benefits, setBenefits] = useState<string[]>([])
    const [benefitInput, setBenefitInput] = useState('')
    const [tags, setTags] = useState<string[]>([])
    const [tagInput, setTagInput] = useState('')
    const [capacity, setCapacity] = useState(5)
    const [endDateType, setEndDateType] = useState<'DATE' | 'AUTO'>('DATE')
    const [endDate, setEndDate] = useState('')
    const [visitStartTime, setVisitStartTime] = useState('11:00')
    const [visitEndTime, setVisitEndTime] = useState('21:00')

    const filteredStores = storeData.stores.filter(s => s.name.includes(storeSearch))
    const totalCost = selectedStoreIds.length * capacity * COST_PER_PERSON
    const hasEnoughPoints = storeData.pointsBalance >= totalCost

    // Generate valid end time options
    // Logic: t > start. Special case: if start is 23:30, allow 00:00 (next day)
    let validEndTimeOptions = timeOptions.filter(t => t > visitStartTime)
    if (visitStartTime === '23:30') {
        validEndTimeOptions.push('00:00')
    }

    // Ensure end time is valid when start time changes
    useEffect(() => {
        // If current End Time is not in the valid list, reset it to the first valid option
        if (!validEndTimeOptions.includes(visitEndTime)) {
            if (validEndTimeOptions.length > 0) {
                setVisitEndTime(validEndTimeOptions[0])
            }
        }
    }, [visitStartTime, validEndTimeOptions, visitEndTime])

    // Auto-select store if only 1 available
    useEffect(() => {
        const availableStores = storeData.stores.filter(s => !s.active_campaign)
        if (availableStores.length === 1 && selectedStoreIds.length === 0) {
            setSelectedStoreIds([availableStores[0].id])
        }
    }, [storeData.stores, selectedStoreIds.length])

    useEffect(() => {
        if (state.success) {
            router.push('/owner/campaigns')
        }
    }, [state.success, router])

    const toggleStore = (id: string) => {
        setSelectedStoreIds(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        )
    }

    const toggleAllStores = () => {
        if (selectedStoreIds.length === filteredStores.length) {
            setSelectedStoreIds([])
        } else {
            setSelectedStoreIds(filteredStores.filter(s => !s.active_campaign).map(s => s.id))
        }
    }

    const addBenefit = () => {
        if (benefitInput.trim()) {
            setBenefits([...benefits, benefitInput.trim()])
            setBenefitInput('')
        }
    }

    const addTag = () => {
        if (tagInput.trim()) {
            const newTag = tagInput.trim().replace(/^#/, '')
            if (newTag && !tags.includes(newTag) && tags.length < 5) {
                setTags([...tags, newTag])
                setTagInput('')
            }
        }
    }

    const handleDateClick = () => {
        if (dateInputRef.current) {
            try {
                dateInputRef.current.showPicker()
            } catch (e) {
                dateInputRef.current.focus()
            }
        }
    }

    const handleSubmit = (formData: FormData) => {
        // Custom validation before action
        if (benefits.length === 0) {
            if (benefitInput.trim()) {
                alert("입력하신 '제공 서비스'의 추가 버튼을 눌러주세요.")
            } else {
                alert("'제공 서비스'를 최소 1개 이상 입력해주세요.")
            }
            return
        }
        formAction(formData)
    }

    return (
        <form action={handleSubmit} className="max-w-xl mx-auto space-y-5" ref={formRef}>

            {/* 1. Store Selection */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold px-1 text-sm">
                    <Store className="w-4 h-4 text-violet-500" />
                    진행할 매장
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    {selectedStoreIds.length === 0 ? (
                        <div
                            onClick={() => setIsStoreModalOpen(true)}
                            className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl h-11 flex items-center justify-between px-4 cursor-pointer hover:bg-slate-100 transition-colors text-slate-500 text-sm font-medium"
                        >
                            <span>매장을 선택해주세요</span>
                            <ChevronDown className="w-4 h-4 opacity-50" />
                        </div>
                    ) : (
                        <div
                            onClick={() => setIsStoreModalOpen(true)}
                            className="bg-violet-50 dark:bg-violet-900/20 border border-violet-100 dark:border-violet-900 rounded-xl p-3 cursor-pointer hover:border-violet-200 transition-colors relative group"
                        >
                            <div className="font-bold text-slate-900 dark:text-white mb-0.5 flex items-center gap-2 text-sm">
                                {storeData.stores.find(s => s.id === selectedStoreIds[0])?.name}
                                {selectedStoreIds.length > 1 && <Badge className="bg-violet-600 hover:bg-violet-700 h-5 text-[10px] px-1.5">외 {selectedStoreIds.length - 1}곳</Badge>}
                            </div>
                            <div className="text-xs text-slate-500">클릭하여 매장 변경</div>
                        </div>
                    )}
                    <input type="hidden" name="store_ids" value={JSON.stringify(selectedStoreIds)} />
                </div>
            </div>

            {/* Store Modal */}
            <Dialog open={isStoreModalOpen} onOpenChange={setIsStoreModalOpen}>
                <DialogContent className="max-w-md p-0 gap-0 overflow-hidden bg-white dark:bg-slate-900 rounded-2xl z-[100] border-2 border-slate-100 dark:border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]">
                    <DialogHeader className="p-5 pb-2 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 sticky top-0 z-10">
                        <DialogTitle>매장 선택</DialogTitle>
                        <DialogDescription className="text-slate-500 text-sm mt-1">
                            목록에서 캠페인을 진행할 매장을 선택해주세요.
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
                        <Button variant="outline" size="sm" onClick={toggleAllStores} className="shrink-0 h-10 px-3 text-xs">
                            {selectedStoreIds.length === filteredStores.length ? '해제' : '전체'}
                        </Button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 min-h-[300px] max-h-[50vh] bg-white dark:bg-slate-900">
                        {filteredStores.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-10 text-slate-400 text-sm">
                                <Store className="w-10 h-10 mb-2 opacity-20" />
                                등록된 매장이 없습니다.
                            </div>
                        ) : (
                            filteredStores.map(store => {
                                const isSelected = selectedStoreIds.includes(store.id)
                                const isDisabled = !!store.active_campaign
                                return (
                                    <div
                                        key={store.id}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            if (!isDisabled) toggleStore(store.id)
                                        }}
                                        className={cn(
                                            "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors mb-1 select-none",
                                            isSelected ? "bg-violet-50 dark:bg-violet-900/20 box-border border border-violet-500" : "hover:bg-slate-50 dark:hover:bg-slate-800 border border-transparent",
                                            isDisabled && "opacity-50 cursor-not-allowed bg-slate-50"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-5 h-5 rounded flex items-center justify-center transition-colors shrink-0",
                                            isSelected ? "bg-violet-600 text-white" : "border border-slate-300 bg-white",
                                            isDisabled && "bg-slate-200 border-slate-200"
                                        )}>
                                            {isSelected && <Check className="w-3.5 h-3.5" />}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                                {store.name}
                                                {isDisabled && <span className="text-[10px] bg-slate-200 text-slate-500 px-1.5 py-0.5 rounded">진행중</span>}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">{store.address_text}</div>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>

                    <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 sticky bottom-0 z-10 w-full">
                        <Button onClick={() => setIsStoreModalOpen(false)} className="w-full bg-violet-600 hover:bg-violet-700 text-white h-11 rounded-xl font-bold text-base">
                            선택 완료 ({selectedStoreIds.length}개)
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* 2. Review Channel */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold px-1 text-sm">
                    <Megaphone className="w-4 h-4 text-violet-500" />
                    리뷰 채널
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm">
                    <div className="grid grid-cols-2 gap-3">
                        {reviewTypes.map((type) => {
                            const Icon = type.icon
                            return (
                                <div
                                    key={type.value}
                                    onClick={() => setReviewType(type.value)}
                                    className={cn(
                                        "cursor-pointer rounded-xl border p-4 transition-all relative flex flex-col items-center text-center gap-2",
                                        reviewType === type.value
                                            ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 ring-1 ring-violet-500"
                                            : "border-slate-200 dark:border-slate-800 hover:border-violet-200 bg-slate-50 dark:bg-slate-950"
                                    )}
                                >
                                    <Icon className={cn("w-6 h-6", reviewType === type.value ? "text-violet-600" : "text-slate-400")} />
                                    <div>
                                        <div className="font-bold text-sm whitespace-nowrap">{type.label}</div>
                                        <div className="text-xs opacity-80 mt-1 font-medium">{type.desc}</div>
                                    </div>
                                    <input type="radio" name="review_type" value={type.value} checked={reviewType === type.value} readOnly className="hidden" />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>

            {/* 3. Details */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold px-1 text-sm">
                    <Check className="w-4 h-4 text-violet-500" />
                    상세 정보
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-5">
                    {/* Benefits */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">제공 서비스</Label>
                        <div className="flex gap-2 w-full justify-between">
                            <div className="relative w-full">
                                <Input
                                    value={benefitInput}
                                    onChange={e => setBenefitInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                                    placeholder="예: 5만원 식사권"
                                    className="w-full bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-violet-500 text-sm"
                                />
                            </div>
                            <Button type="button" onClick={addBenefit} className="bg-slate-800 hover:bg-slate-900 text-white shrink-0 w-16 h-11 rounded-xl font-bold text-sm">
                                추가
                            </Button>
                        </div>

                        {benefits.length > 0 && (
                            <div className="space-y-2 pt-1">
                                {benefits.map((benefit, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-3 text-sm bg-slate-50 dark:bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                        <div className="flex items-center gap-2 overflow-hidden">
                                            <div className="w-1.5 h-1.5 rounded-full bg-violet-500 shrink-0" />
                                            <span className="font-medium text-slate-700 dark:text-slate-300 break-all">{benefit}</span>
                                        </div>
                                        <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 transition-colors shrink-0">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input type="hidden" name="benefit_text" value={benefits.join('\n')} />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">필수 태그 (선택)</Label>
                        <div className="flex gap-2 w-full justify-between">
                            <div className="relative w-full">
                                <Input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder="예: 강남맛집"
                                    className="w-full bg-slate-50 border-slate-200 h-11 rounded-xl focus-visible:ring-violet-500 text-sm"
                                    disabled={tags.length >= 5}
                                />
                            </div>
                            <Button type="button" onClick={addTag} className="bg-slate-200 hover:bg-slate-300 text-slate-700 shrink-0 w-16 h-11 rounded-xl font-bold text-sm" disabled={tags.length >= 5}>
                                추가
                            </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-1">
                            {tags.map((tag, idx) => (
                                <Badge key={idx} variant="secondary" className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium gap-1 hover:bg-slate-200 rounded-lg">
                                    #{tag}
                                    <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="ml-1 hover:text-red-500">
                                        <X className="w-3 h-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <input type="hidden" name="required_tags" value={JSON.stringify(tags)} />
                    </div>
                </div>
            </div>

            {/* 4. Schedule */}
            <div className="space-y-2">
                <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold px-1 text-sm">
                    <Calendar className="w-4 h-4 text-violet-500" />
                    일정 및 인원
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                    {/* End Date */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">모집 마감</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <div
                                onClick={() => setEndDateType('DATE')}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer text-sm font-bold text-center transition-colors",
                                    endDateType === 'DATE' ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-500"
                                )}
                            >
                                날짜 지정
                            </div>
                            <div
                                onClick={() => setEndDateType('AUTO')}
                                className={cn(
                                    "p-3 rounded-xl border cursor-pointer text-sm font-bold text-center transition-colors",
                                    endDateType === 'AUTO' ? "bg-slate-900 text-white border-slate-900" : "bg-slate-50 border-slate-200 text-slate-500"
                                )}
                            >
                                인원 마감시 종료
                            </div>
                        </div>

                        {endDateType === 'DATE' && (
                            <div className="relative w-full h-12" onClick={handleDateClick}>
                                <div className="absolute inset-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 cursor-pointer hover:bg-slate-100 transition-colors z-10 pointer-events-none">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className={cn("text-sm font-medium", endDate ? "text-slate-900" : "text-slate-400")}>
                                        {endDate || "연도-월-일 선택"}
                                    </span>
                                    <span className="ml-auto text-sm text-slate-500 font-bold bg-slate-200 px-2 py-0.5 rounded text-[10px]">
                                        마감일
                                    </span>
                                </div>
                                <Input
                                    ref={dateInputRef}
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0 appearance-none"
                                    required
                                />
                                <input type="hidden" name="end_date" value={endDate} />
                            </div>
                        )}
                        {endDateType === 'AUTO' && <input type="hidden" name="end_date" value="" />}
                    </div>

                    {/* Visit Time */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">방문 가능 시간</Label>
                        <div className="flex items-center gap-2">
                            <TimeSelect value={visitStartTime} onChange={setVisitStartTime} />
                            <span className="text-slate-400 font-bold">~</span>
                            <TimeSelect value={visitEndTime} onChange={setVisitEndTime} options={validEndTimeOptions} />
                        </div>
                        <input type="hidden" name="visit_time_windows" value={JSON.stringify([{ day: '매일', startTime: visitStartTime, endTime: visitEndTime }])} />
                    </div>

                    {/* Capacity */}
                    <div className="space-y-2">
                        <Label className="text-sm font-bold text-slate-700">모집 인원 (매장별)</Label>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <span className="text-xl font-bold text-slate-900">{capacity}</span>
                                    <span className="text-sm text-slate-500 ml-1">명</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button type="button" variant="outline" size="icon" onClick={() => capacity > 1 && setCapacity(c => c - 1)} className="h-9 w-9 rounded-lg border-slate-300 bg-white hover:bg-slate-50">
                                        <Minus className="w-4 h-4" />
                                    </Button>
                                    <Button type="button" variant="outline" size="icon" onClick={() => capacity < 50 && setCapacity(c => c + 1)} className="h-9 w-9 rounded-lg border-slate-300 bg-white hover:bg-slate-50">
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="bg-white border border-violet-100 rounded-lg p-3 flex justify-between items-center shadow-sm">
                                <div className="text-xs text-slate-500 font-medium">총 포인트 비용</div>
                                <div className="text-base font-bold text-violet-600">
                                    {totalCost.toLocaleString()} P
                                </div>
                            </div>
                        </div>
                        <input type="hidden" name="capacity" value={capacity} />
                    </div>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-[90] shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                <div className="max-w-xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium">내 포인트: <span className="text-slate-900 font-bold">{storeData.pointsBalance.toLocaleString()} P</span></span>
                        <span className="text-xs text-slate-400">필요 포인트: {totalCost.toLocaleString()} P</span>
                    </div>
                    <Button
                        type="submit"
                        size="lg"
                        onClick={(e) => {
                            if (!hasEnoughPoints) {
                                e.preventDefault()
                                setIsChargeModalOpen(true)
                            }
                        }}
                        className={cn(
                            "flex-1 h-12 text-base font-bold text-white rounded-xl shadow-lg transition-transform active:scale-[0.98]",
                            !hasEnoughPoints
                                ? "bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200"
                                : "bg-violet-600 hover:bg-violet-700 shadow-violet-200"
                        )}
                        disabled={selectedStoreIds.length === 0}
                    >
                        {!hasEnoughPoints ? '충전하고 생성하기' : '캠페인 생성하기'}
                    </Button>
                </div>
            </div>

            <PointChargeModal
                isOpen={isChargeModalOpen}
                onClose={() => setIsChargeModalOpen(false)}
                onSuccess={() => {
                    router.refresh()
                }}
            />

            {/* Error Display */}
            {state.error && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl animate-in fade-in zoom-in-95 z-[100] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}
        </form>
    )
}
