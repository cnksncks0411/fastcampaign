'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { addPaymentMethod } from '@/app/my/payment/actions'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

// Utility functions for formatting
const formatCardNumber = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 16)
    const parts = []
    for (let i = 0; i < v.length; i += 4) {
        parts.push(v.substring(i, i + 4))
    }
    return parts.join(' ')
}

const formatExpiry = (value: string) => {
    const v = value.replace(/\D/g, '').substring(0, 4)
    if (v.length >= 2) {
        return `${v.substring(0, 2)}/${v.substring(2)}`
    }
    return v
}

const formatAuthId = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 10)
}

const formatPassword = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 2)
}

const formatCVC = (value: string) => {
    return value.replace(/\D/g, '').substring(0, 3)
}

export default function AddPaymentForm({ onSuccess }: { onSuccess?: () => void }) {
    const [isLoading, setIsLoading] = useState(false)
    const [paymentType, setPaymentType] = useState('CARD')

    // Form States for formatting
    const [cardNumber, setCardNumber] = useState('')
    const [expiry, setExpiry] = useState('')
    const [cvc, setCvc] = useState('')
    const [pwd2, setPwd2] = useState('')
    const [authId, setAuthId] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setIsLoading(true)
        const formData = new FormData(event.currentTarget)
        formData.set('type', paymentType)

        // Remove spaces from card number before sending
        formData.set('cardNumber', cardNumber.replace(/\s/g, ''))

        try {
            const result = await addPaymentMethod(null, formData)
            if (result?.error) {
                alert(result.error)
            } else {
                // Success
                if (onSuccess) onSuccess()
            }
        } catch (e) {
            console.error(e)
            alert('오류가 발생했습니다.')
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Tabs value={paymentType} onValueChange={setPaymentType} className="w-full">
            <TabsList className="w-full bg-slate-100 dark:bg-slate-900 p-1 rounded-xl h-11 grid grid-cols-3 mb-6">
                <TabsTrigger value="CARD" className="rounded-lg text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none transition-all">신용/체크카드</TabsTrigger>
                <TabsTrigger value="EASY_PAY" className="rounded-lg text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none transition-all">간편결제</TabsTrigger>
                <TabsTrigger value="MOBILE" className="rounded-lg text-sm font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 shadow-none transition-all">휴대폰결제</TabsTrigger>
            </TabsList>

            <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 relative z-0">

                <TabsContent value="CARD" className="space-y-6 mt-0 animate-in fade-in duration-300">
                    <div className="space-y-2">
                        <Label>카드사</Label>
                        <Select name="cardCompany" required={paymentType === 'CARD'}>
                            <SelectTrigger className="bg-white dark:bg-slate-900">
                                <SelectValue placeholder="카드사를 선택해주세요" />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 z-50 shadow-xl max-h-[300px]">
                                {['KB국민', '현대', '삼성', '신한', '롯데', 'BC', '우리', '하나', 'NH농협'].map(c => (
                                    <SelectItem key={c} value={c}>{c}카드</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>카드 번호</Label>
                        <div className="relative">
                            <Input
                                name="cardNumberInput" // 실제 전송용 아님 (hidden으로 대체하거나 JS로 처리) -> 위 handleSubmit에서 set('cardNumber') 하므로 name 달라도 됨.
                                placeholder="0000 0000 0000 0000"
                                className="font-mono"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                maxLength={19}
                                required={paymentType === 'CARD'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>유효기간 (MM/YY)</Label>
                            <Input
                                name="expiry"
                                placeholder="MM/YY"
                                className="font-mono"
                                value={expiry}
                                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                                maxLength={5}
                                required={paymentType === 'CARD'}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>CVC</Label>
                            <Input
                                name="cvc"
                                placeholder="3자리"
                                className="font-mono"
                                type="password"
                                value={cvc}
                                onChange={(e) => setCvc(formatCVC(e.target.value))}
                                maxLength={3}
                                required={paymentType === 'CARD'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>비밀번호 앞 2자리</Label>
                            <div className="relative">
                                <Input
                                    name="cardPassword2"
                                    placeholder="**"
                                    className="font-mono"
                                    type="password"
                                    value={pwd2}
                                    onChange={(e) => setPwd2(formatPassword(e.target.value))}
                                    maxLength={2}
                                    required={paymentType === 'CARD'}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>생년월일/사업자번호</Label>
                            <div className="relative">
                                <Input
                                    name="authId"
                                    placeholder="6자리 또는 10자리"
                                    className="font-mono"
                                    value={authId}
                                    onChange={(e) => setAuthId(formatAuthId(e.target.value))}
                                    maxLength={10}
                                    required={paymentType === 'CARD'}
                                />
                            </div>
                        </div>
                    </div>
                    <p className="text-xs text-slate-500">
                        * 법인카드는 사업자번호 10자리를 입력해주세요.
                    </p>
                </TabsContent>

                <TabsContent value="EASY_PAY" className="mt-0 space-y-4 animate-in fade-in duration-300">
                    <Label className="mb-2 block">간편결제사 선택</Label>
                    <div className="grid grid-cols-1 gap-3">
                        <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 has-[:checked]:dark:bg-indigo-900/20">
                            <input type="radio" name="easyPayProvider" value="KAKAO" className="h-4 w-4 text-indigo-600 accent-indigo-600" required={paymentType === 'EASY_PAY'} />
                            <div className="flex-1 font-medium">카카오페이</div>
                            <div className="bg-[#FEE500] text-[#3c1e1e] text-[10px] font-bold px-2 py-0.5 rounded">KAKAO</div>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 has-[:checked]:dark:bg-indigo-900/20">
                            <input type="radio" name="easyPayProvider" value="NAVER" className="h-4 w-4 text-indigo-600 accent-indigo-600" required={paymentType === 'EASY_PAY'} />
                            <div className="flex-1 font-medium">네이버페이</div>
                            <div className="bg-[#03C75A] text-white text-[10px] font-bold px-2 py-0.5 rounded">NAVER</div>
                        </label>
                        <label className="flex items-center gap-3 p-4 border border-slate-200 dark:border-slate-800 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors has-[:checked]:border-indigo-500 has-[:checked]:bg-indigo-50/50 has-[:checked]:dark:bg-indigo-900/20">
                            <input type="radio" name="easyPayProvider" value="TOSS" className="h-4 w-4 text-indigo-600 accent-indigo-600" required={paymentType === 'EASY_PAY'} />
                            <div className="flex-1 font-medium">토스페이</div>
                            <div className="bg-[#0064FF] text-white text-[10px] font-bold px-2 py-0.5 rounded">TOSS</div>
                        </label>
                    </div>
                </TabsContent>

                <TabsContent value="MOBILE" className="mt-0 animate-in fade-in duration-300">
                    <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                        <span className="text-sm text-slate-500">휴대폰 결제는 현재 준비 중입니다.<br />다음 업데이트를 기대해주세요!</span>
                    </div>
                </TabsContent>

                <div className="pt-4">
                    <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 h-11 text-base font-bold shadow-lg shadow-indigo-200 dark:shadow-none" disabled={isLoading}>
                        {isLoading ? (
                            '처리 중...'
                        ) : (
                            paymentType === 'CARD' ? '카드 등록하기' : '간편결제 등록하기'
                        )}
                    </Button>
                </div>
            </form>

            <p className="text-center text-xs text-slate-400 mt-6 leading-relaxed">
                본 서비스는 실제 결제가 이루어지지 않는 데모 환경입니다.<br />
                입력하신 정보는 안전하게 암호화되어 저장되지 않으며,<br />
                카드 번호 뒷 4자리만 식별 목적으로 저장됩니다.
            </p>
        </Tabs>
    )
}
