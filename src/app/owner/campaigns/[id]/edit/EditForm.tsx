'use client'

import { useState, useRef, useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useFormStatus } from 'react-dom'
import { Check, Store, Megaphone, Minus, Plus, Search, X, ChevronDown, Calendar, Clock, MapPin, Instagram, ChevronUp, AlertCircle, Trash2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { updateCampaign } from '@/app/owner/actions'
import { cn } from '@/lib/utils'
import { BackButton } from '@/components/common/BackButton'

// 리뷰 타입
const reviewTypes = [
    { value: 'INSTAGRAM_STORY', label: '인스타그램 스토리', desc: '24시간 노출', icon: Instagram },
    { value: 'NAVER_PLACE', label: '네이버 플레이스', desc: '영수증/방문자 리뷰', icon: MapPin },
]

const timeOptions = Array.from({ length: 48 }).map((_, i) => {
    const hour = Math.floor(i / 2)
    const min = i % 2 === 0 ? '00' : '30'
    return `${hour.toString().padStart(2, '0')}:${min}`
})

// Custom Time Select (Same as CreateForm)
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

function SubmitButton() {
    const { pending } = useFormStatus()
    return (
        <Button
            type="submit"
            size="lg"
            className="w-full h-12 text-base font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-lg"
            disabled={pending}
        >
            {pending ? '수정 중...' : '변경사항 저장'}
        </Button>
    )
}

export function EditForm({ campaign }: { campaign: any }) {
    const router = useRouter()
    const updateCampaignWithId = updateCampaign.bind(null, campaign.id)
    const [state, formAction] = useActionState(updateCampaignWithId, {})
    const dateInputRef = useRef<HTMLInputElement>(null)

    // Init States
    const [reviewType, setReviewType] = useState(campaign.review_type || 'INSTAGRAM_STORY')
    const [benefits, setBenefits] = useState<string[]>(campaign.benefit_text ? campaign.benefit_text.split('\n') : [])
    const [benefitInput, setBenefitInput] = useState('')
    const [tags, setTags] = useState<string[]>(campaign.required_tags || [])
    const [tagInput, setTagInput] = useState('')

    // Schedule
    const [endDateType, setEndDateType] = useState<'DATE' | 'AUTO'>(campaign.end_at ? 'DATE' : 'AUTO')
    const [endDate, setEndDate] = useState(campaign.end_at ? new Date(campaign.end_at).toISOString().split('T')[0] : '')

    const visitWindow = campaign.visit_time_windows?.[0] || { startTime: '11:00', endTime: '21:00' }
    const [visitStartTime, setVisitStartTime] = useState(visitWindow.startTime)
    const [visitEndTime, setVisitEndTime] = useState(visitWindow.endTime)

    let validEndTimeOptions = timeOptions.filter(t => t > visitStartTime)
    if (visitStartTime === '23:30') validEndTimeOptions.push('00:00')

    useEffect(() => {
        if (!validEndTimeOptions.includes(visitEndTime)) {
            if (validEndTimeOptions.length > 0) setVisitEndTime(validEndTimeOptions[0])
        }
    }, [visitStartTime, validEndTimeOptions, visitEndTime])

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
            try { dateInputRef.current.showPicker() } catch (e) { dateInputRef.current.focus() }
        }
    }

    return (
        <form action={formAction} className="min-h-dvh bg-slate-50 dark:bg-slate-900/50 pb-28">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">캠페인 수정</h1>
            </header>

            <div className="max-w-xl mx-auto p-5 space-y-5">

                {/* 1. Store (Read Only) */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-bold px-1 text-sm">
                        <Store className="w-4 h-4 text-violet-500" />
                        진행 중인 매장
                    </div>
                    <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-800">
                        <div className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            {campaign.stores?.name}
                        </div>
                    </div>
                </div>

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
                                <Input
                                    value={benefitInput}
                                    onChange={e => setBenefitInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addBenefit(); } }}
                                    placeholder="예: 5만원 식사권"
                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl text-sm"
                                />
                                <Button type="button" onClick={addBenefit} className="bg-slate-800 text-white w-16 h-11 rounded-xl font-bold text-sm">추가</Button>
                            </div>
                            {benefits.length > 0 && (
                                <div className="space-y-2 pt-1">
                                    {benefits.map((benefit, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-3 text-sm bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                                            <span className="font-medium text-slate-700">{benefit}</span>
                                            <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <input type="hidden" name="benefit_text" value={benefits.join('\n')} />
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">상세 설명 (선택)</Label>
                            <Input
                                name="description"
                                defaultValue={campaign.description || ''}
                                placeholder="체험단에게 전달할 추가적인 안내사항"
                                className="bg-slate-50 border-slate-200 h-11 rounded-xl text-sm"
                            />
                        </div>

                        {/* Tags */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">필수 태그 (선택)</Label>
                            <div className="flex gap-2 w-full justify-between">
                                <Input
                                    value={tagInput}
                                    onChange={e => setTagInput(e.target.value)}
                                    onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
                                    placeholder="예: 강남맛집"
                                    className="bg-slate-50 border-slate-200 h-11 rounded-xl text-sm"
                                    disabled={tags.length >= 5}
                                />
                                <Button type="button" onClick={addTag} className="bg-slate-200 text-slate-700 w-16 h-11 rounded-xl font-bold text-sm" disabled={tags.length >= 5}>추가</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1">
                                {tags.map((tag, idx) => (
                                    <Badge key={idx} variant="secondary" className="px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-medium gap-1 rounded-lg">
                                        #{tag}
                                        <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="ml-1 hover:text-red-500"><X className="w-3 h-3" /></button>
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
                        일정 변경
                    </div>
                    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                        {/* End Date */}
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-slate-700">모집 마감</Label>
                            <div className="relative w-full h-12" onClick={handleDateClick}>
                                <div className="absolute inset-0 bg-slate-50 border border-slate-200 rounded-xl flex items-center px-4 cursor-pointer z-10 pointer-events-none">
                                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                                    <span className={cn("text-sm font-medium", endDate ? "text-slate-900" : "text-slate-400")}>
                                        {endDate || "연도-월-일 선택"}
                                    </span>
                                </div>
                                <Input
                                    ref={dateInputRef}
                                    type="date"
                                    value={endDate}
                                    onChange={e => setEndDate(e.target.value)}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0 appearance-none"
                                />
                                <input type="hidden" name="end_date" value={endDate} />
                            </div>
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
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 z-[90]">
                <div className="max-w-xl mx-auto">
                    <SubmitButton />
                </div>
            </div>
            {/* Error */}
            {state.error && (
                <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-red-600 text-white px-5 py-2.5 rounded-full text-sm font-bold shadow-xl animate-in fade-in zoom-in-95 z-[100] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    {state.error}
                </div>
            )}
        </form>
    )
}
