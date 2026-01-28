'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Search, MapPin, Store, BadgeCheck } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { registerStore, type FormState } from '../actions'

const initialState: FormState = {}

interface DaumPostcodeData {
    address: string
    addressType: string
    bname: string
    buildingName: string
}

declare global {
    interface Window {
        daum: {
            Postcode: new (options: { oncomplete: (data: DaumPostcodeData) => void }) => { open: () => void }
        }
        naver: typeof naver
    }
}


export default function RegisterStorePage() {
    const [state, formAction, isPending] = useActionState(registerStore, initialState)
    const [address, setAddress] = useState('')
    const [category, setCategory] = useState('')
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)

    // 다음 주소 검색 로드
    useEffect(() => {
        const script = document.createElement('script')
        script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
        script.async = true
        document.head.appendChild(script)
    }, [])

    const handleAddressSearch = () => {
        if (!window.daum?.Postcode) return
        new window.daum.Postcode({
            oncomplete: function (data: DaumPostcodeData) {
                const fullAddress = data.address
                setAddress(fullAddress)

                // 네이버 지도 Geocoding API를 사용하여 좌표 변환
                if (!window.naver || !window.naver.maps) {
                    console.error('네이버 지도 API가 로드되지 않았습니다.')
                    return
                }

                naver.maps.Service.geocode({
                    query: fullAddress
                }, function (status, response) {
                    if (status !== naver.maps.Service.Status.OK) {
                        return alert('주소를 좌표로 변환하는데 실패했습니다.')
                    }

                    const result = response.v2.addresses[0]
                    if (result) {
                        const newCoords = {
                            lat: parseFloat(result.y),
                            lng: parseFloat(result.x)
                        }
                        setCoords(newCoords)
                    }
                })
            }
        }).open()
    }

    return (
        <div className="fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 overflow-y-auto">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 transition-all">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-white ml-2">매장 등록</h1>
            </header>

            <div className="max-w-2xl mx-auto px-5 pt-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="mb-8 space-y-2 text-center sm:text-left">
                    <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                        사장님의 매장을<br className="block sm:hidden" /> 등록해주세요
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 font-medium">
                        정확한 정보는 성공적인 마케팅의 시작입니다.
                    </p>
                </div>

                <form action={formAction} className="space-y-6">
                    {/* 이미지 업로드 (Hidden) */}
                    <input type="file" name="images" multiple className="hidden" />

                    {/* 섹션: 사업자 인증 (신규 추가) */}
                    <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">사업자 인증</span>
                        </div>
                        <CardContent className="p-5 space-y-4">
                            <div className="flex gap-2 items-end">
                                <div className="flex-1 space-y-2">
                                    <Label htmlFor="businessNumber" className="text-sm font-semibold text-slate-700 dark:text-slate-300">사업자 등록번호</Label>
                                    <Input
                                        id="businessNumber"
                                        name="businessNumber"
                                        placeholder="000-00-00000"
                                        className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all text-base"
                                    />
                                </div>
                                <Button type="button" variant="outline" className="h-12 border-slate-200 dark:border-slate-700 font-medium" onClick={() => alert('추후 구현 예정입니다.')}>
                                    인증요청
                                </Button>
                            </div>
                            <p className="text-xs text-slate-500">
                                * 매장 운영 여부를 확인하기 위해 사업자 인증이 필요합니다.
                            </p>
                        </CardContent>
                    </Card>

                    {/* 섹션 1: 기본 정보 */}
                    <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-violet-50/50 dark:bg-violet-900/10 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Store className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">기본 정보</span>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">매장명</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="상호명을 입력하세요"
                                    className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all text-base"
                                    required
                                />
                            </div>

                            <div className="space-y-2 relative">
                                <Label htmlFor="category" className="text-sm font-semibold text-slate-700 dark:text-slate-300">업종 카테고리</Label>
                                <Select value={category} onValueChange={setCategory} required>
                                    <SelectTrigger id="category" className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800">
                                        <SelectValue placeholder="카테고리 선택" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-white dark:bg-slate-900" style={{ zIndex: 100 }}>
                                        <SelectItem value="식당">식당/카페</SelectItem>
                                        <SelectItem value="뷰티">뷰티/미용</SelectItem>
                                        <SelectItem value="숙박">숙박/펜션</SelectItem>
                                        <SelectItem value="문화">문화/여가</SelectItem>
                                        <SelectItem value="운동">운동/헬스</SelectItem>
                                        <SelectItem value="교육">교육/학원</SelectItem>
                                        <SelectItem value="병원">병원/약국</SelectItem>
                                        <SelectItem value="반려동물">반려동물</SelectItem>
                                        <SelectItem value="기타">기타</SelectItem>
                                    </SelectContent>
                                </Select>
                                <input type="hidden" name="category" value={category} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* 섹션 2: 위치 정보 */}
                    <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-blue-50/50 dark:bg-blue-900/10 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">매장 위치</span>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">주소 검색</Label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <Input
                                            id="address"
                                            name="address"
                                            value={address}
                                            readOnly
                                            placeholder="도로명 주소 검색"
                                            className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all cursor-pointer text-base"
                                            required
                                            onClick={handleAddressSearch}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        onClick={handleAddressSearch}
                                        className="h-12 w-20 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shrink-0"
                                    >
                                        검색
                                    </Button>
                                </div>
                                <Input
                                    name="detailAddress"
                                    placeholder="상세 주소 (예: 1층 101호)"
                                    className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all text-base"
                                />
                                <input type="hidden" name="lat" value={coords?.lat || 0} />
                                <input type="hidden" name="lng" value={coords?.lng || 0} />
                            </div>

                            {/* 지도 미리보기 Placeholder */}
                            <div className="relative w-full aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center group">
                                {coords ? (
                                    <div className="absolute inset-0 bg-blue-50/50 dark:bg-slate-800 flex flex-col items-center justify-center text-blue-600 dark:text-blue-400">
                                        <MapPin className="h-10 w-10 mb-2 animate-bounce" />
                                        <p className="font-bold text-sm">위치가 확인되었습니다</p>
                                        <p className="text-xs opacity-75 mt-1">{address}</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2 p-6">
                                        <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto flex items-center justify-center">
                                            <MapPin className="h-6 w-6 text-slate-400" />
                                        </div>
                                        <p className="text-sm text-slate-500 font-medium">주소를 검색하면<br />지도가 표시됩니다</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 섹션 3: 상세 정보 */}
                    <Card className="border-0 shadow-xl shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-emerald-50/50 dark:bg-emerald-900/10 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-emerald-600 dark:border-emerald-400 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">i</span>
                            </div>
                            <span className="font-bold text-slate-800 dark:text-slate-200">상세 설명</span>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="phone" className="text-sm font-semibold text-slate-700 dark:text-slate-300">대표 전화번호</Label>
                                <Input
                                    id="phone"
                                    name="phone"
                                    placeholder="0507-1234-5678"
                                    className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="site_url" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    매장 링크 <span className="text-slate-400 font-normal ml-1">(선택)</span>
                                </Label>
                                <Input
                                    id="site_url"
                                    name="site_url"
                                    placeholder="https://instargram.com/..."
                                    className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all text-base"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description" className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                    매장 소개 <span className="text-slate-400 font-normal ml-1">(선택)</span>
                                </Label>
                                <Textarea
                                    id="description"
                                    name="description"
                                    placeholder="체험단에게 보여질 매장의 매력을 어필해보세요!"
                                    className="min-h-[120px] border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none p-4 text-base leading-relaxed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Bottom Padding for Fixed Button */}
                    <div className="h-10" />
                </form>
            </div>

            {/* 하단 고정 버튼 */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 z-40 max-w-md mx-auto sm:max-w-full sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-8">
                <div className="max-w-2xl mx-auto sm:px-5">
                    <Button
                        type="submit"
                        onClick={() => document.querySelector('form')?.requestSubmit()}
                        className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                        disabled={isPending}
                    >
                        {isPending ? (
                            <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                매장 등록 중...
                            </>
                        ) : (
                            '매장 등록 완료'
                        )}
                    </Button>
                </div>
            </div>
        </div>
    )
}
