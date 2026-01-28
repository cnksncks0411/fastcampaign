
'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Loader2, MapPin, Store, BadgeCheck, Trash2, AlertTriangle, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { updateStore, deleteStore, type FormState } from '../../actions'

interface EditStoreFormProps {
    store: any // Using any for simplicity in rapid dev, ideally define Store interface
}

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
    }
}

export function EditStoreForm({ store }: EditStoreFormProps) {
    const router = useRouter()
    const updateAction = updateStore.bind(null, store.id)
    const [state, formAction, isPending] = useActionState(updateAction, {})

    // States
    const [address, setAddress] = useState(store.address_text || '')
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>({ lat: store.lat, lng: store.lng })
    const [category, setCategory] = useState(store.category || '')
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Load Daum Postcode Script
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

                if (!(window as any).naver || !(window as any).naver.maps) {
                    // Fallback or error if naver map not loaded (should be loaded in layout or head)
                    return
                }

                (window as any).naver.maps.Service.geocode({
                    query: fullAddress
                }, function (status: any, response: any) {
                    if (status !== (window as any).naver.maps.Service.Status.OK) {
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

    const handleDelete = async () => {
        if (!store?.id) {
            alert('매장 정보 오류: ID를 찾을 수 없습니다.')
            return
        }

        console.log('[DEBUG] Start Deleting Store:', store.id)
        setIsDeleting(true)

        try {
            const res = await deleteStore(store.id)
            console.log('[DEBUG] Delete Result:', res)

            if (res.success) {
                // router.push sometimes fails to trigger full reload or navigation in some edge cases
                // Using window.location.href ensures a hard redirect
                window.location.href = '/'
            } else {
                alert(`삭제 실패: ${res.error || '알 수 없는 오류가 발생했습니다.'}`)
                setIsDeleting(false)
            }
        } catch (e) {
            console.error('[DEBUG] Delete Exception:', e)
            alert('삭제 중 예기치 못한 오류가 발생했습니다.')
            setIsDeleting(false)
        }
    }

    // Success Alert
    // Success Alert & Redirect
    useEffect(() => {
        if (state.success) {
            // Toast would be better, but alert for now
            alert('매장 정보가 성공적으로 수정되었습니다.')
            router.push('/owner/stores')
            router.refresh()
        }
    }, [state.success, router])

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950 pb-32">
            {/* Header */}
            <header className="sticky top-0 z-30 flex items-center h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/60 dark:border-slate-800 px-4 transition-all">
                <Link href="/owner/stores" className="mr-4 p-2 -ml-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 transition-colors">
                    <ArrowLeft className="h-5 w-5" />
                </Link>
                <h1 className="text-lg font-bold text-slate-900 dark:text-white">매장 정보 관리</h1>
                <div className="ml-auto">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => {
                            if (window.confirm('정말로 삭제하시겠습니까?\n삭제된 매장은 복구할 수 없으며, 모든 캠페인 데이터가 함께 삭제 처리됩니다.')) {
                                handleDelete();
                            }
                        }}
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                </div>
            </header>

            <div className="max-w-2xl mx-auto px-5 pt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <form action={formAction} className="space-y-6">
                    {/* 사업자 인증 정보 (Read Only) */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-slate-100 dark:bg-slate-800 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <BadgeCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">사업자 정보</span>
                        </div>
                        <CardContent className="p-5 space-y-4">
                            <div className="space-y-2">
                                <Label className="text-sm font-semibold text-slate-700 dark:text-slate-300">사업자 등록번호</Label>
                                <Input
                                    disabled
                                    defaultValue={store.business_number || '미등록'}
                                    className="bg-slate-50 text-slate-500 border-slate-200"
                                />
                                <p className="text-xs text-slate-400">* 사업자 정보 변경이 필요한 경우 고객센터로 문의해주세요.</p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* 기본 정보 */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
                        <div className="bg-violet-50/50 dark:bg-violet-900/10 p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
                            <Store className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                            <span className="font-bold text-slate-800 dark:text-slate-200">매장 기본 정보</span>
                        </div>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-semibold text-slate-700 dark:text-slate-300">매장명</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    defaultValue={store.name}
                                    placeholder="상호명을 입력하세요"
                                    className="h-12 border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 text-base"
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

                    {/* 위치 정보 */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
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
                                    defaultValue={store.address_detail || ''}
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
                                        <MapPin className="h-10 w-10 mb-2" />
                                        <p className="font-bold text-sm">위치 확인됨</p>
                                        <p className="text-xs opacity-75 mt-1">{address}</p>
                                    </div>
                                ) : (
                                    <div className="text-center space-y-2 p-6">
                                        <MapPin className="h-6 w-6 text-slate-400 mx-auto" />
                                        <p className="text-sm text-slate-500 font-medium">주소를 검색하면<br />지도가 표시됩니다</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* 상세 정보 */}
                    <Card className="border-0 shadow-lg shadow-slate-200/40 dark:shadow-none bg-white dark:bg-slate-900 ring-1 ring-slate-100 dark:ring-slate-800 overflow-hidden">
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
                                    defaultValue={store.phone || ''}
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
                                    defaultValue={store.site_url || ''}
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
                                    defaultValue={store.description || ''}
                                    placeholder="체험단에게 보여질 매장의 매력을 어필해보세요!"
                                    className="min-h-[120px] border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all resize-none p-4 text-base leading-relaxed"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Error Message */}
                    {state.error && (
                        <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 shrink-0" />
                            {state.error}
                        </div>
                    )}

                    {/* 하단 고정 버튼 */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-100 dark:border-slate-800 z-40 max-w-md mx-auto sm:max-w-full sm:static sm:bg-transparent sm:border-0 sm:p-0 sm:mt-8">
                        <div className="max-w-2xl mx-auto sm:px-0">
                            <Button
                                type="submit"
                                className="w-full h-14 bg-violet-600 hover:bg-violet-700 text-white text-lg font-bold rounded-2xl shadow-lg shadow-violet-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                disabled={isPending}
                            >
                                {isPending ? (
                                    <>
                                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                        저장 중...
                                    </>
                                ) : (
                                    '수정 사항 저장'
                                )}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>

            {/* Delete Modal */}
            <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center gap-2">
                            <AlertTriangle className="h-5 w-5" />
                            매장 삭제 확인
                        </DialogTitle>
                        <DialogDescription className="pt-2">
                            정말로 <strong>{store.name}</strong> 매장을 삭제하시겠습니까?<br />
                            삭제 후에는 복구할 수 없으며, 진행 중인 모든 캠페인 데이터도 함께 삭제될 수 있습니다.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0 mt-4">
                        <Button variant="outline" onClick={() => setShowDeleteModal(false)}>취소</Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? '삭제 중...' : '삭제하기'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
