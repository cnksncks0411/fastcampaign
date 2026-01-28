'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

// 결제 수단 조회
export async function getPaymentMethods() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    const { data } = await supabase
        .from('payment_methods')
        .select('*')
        .eq('user_id', user.id)
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false })

    return data || []
}

// 결제 수단 추가
export async function addPaymentMethod(prevState: any, formData: FormData) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    const type = formData.get('type') as string || 'CARD'
    let cardCompany = ''
    let cardAlias = ''
    let last4 = ''
    let details: any = {}

    if (type === 'CARD') {
        const company = formData.get('cardCompany') as string
        const cardNumber = formData.get('cardNumber') as string
        const expiry = formData.get('expiry') as string
        const cvc = formData.get('cvc') as string
        const pwd2 = formData.get('cardPassword2') as string
        const authId = formData.get('authId') as string // 생년월일 or 사업자번호

        if (!company || !cardNumber || cardNumber.length < 13 || !expiry || !cvc || !pwd2 || !authId) {
            return { error: '모든 카드 정보를 올바르게 입력해주세요.' }
        }

        cardCompany = company
        cardAlias = `${company} 카드`
        last4 = cardNumber.slice(-4)
    } else if (type === 'EASY_PAY') {
        const provider = formData.get('easyPayProvider') as string
        if (!provider) return { error: '간편결제사를 선택해주세요.' }

        cardCompany = provider
        cardAlias = `${provider} 간편결제`
        last4 = '----'
        details.provider = provider
    } else if (type === 'MOBILE') {
        return { error: '휴대폰 결제는 준비 중입니다.' }
    }

    // 첫 카드인지 확인 -> 첫 카드면 기본으로 설정
    const { count } = await supabase.from('payment_methods').select('*', { count: 'exact', head: true }).eq('user_id', user.id)
    const isFirst = count === 0

    const { error } = await supabase.from('payment_methods').insert({
        user_id: user.id,
        type,
        card_company: cardCompany,
        card_alias: cardAlias,
        card_number_last4: last4,
        details,
        is_default: isFirst
    })

    if (error) {
        console.error(error)
        return { error: '결제 수단 등록에 실패했습니다.' }
    }

    revalidatePath('/my/payment')
    redirect('/my/payment')
}

// 기본 결제 수단 설정
export async function setDefaultPaymentMethod(methodId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    const { error } = await supabase
        .from('payment_methods')
        .update({ is_default: true })
        .eq('id', methodId)
        .eq('user_id', user.id)

    if (error) return { error: error.message }

    revalidatePath('/my/payment')
    return { success: true }
}

export async function chargePoint(amount: number) {
    const supabase = await createClient()
    const { data, error } = await supabase.rpc('charge_point_wallet', { amount_to_add: amount })

    if (error) {
        console.error('Charge Error:', error)
        return { error: '충전에 실패했습니다.' }
    }

    // RPC returns JSONB object { success: boolean, new_balance: number, error: string }
    const result = data as any
    if (!result.success) {
        return { error: result.error || '충전 실패' }
    }

    revalidatePath('/my/payment')
    revalidatePath('/owner/campaigns/create') // 캠페인 생성 페이지 갱신
    return { success: true, newBalance: result.new_balance }
}

// 결제 내역 조회 (페이지네이션)
export async function getPaymentHistory(page: number, pageSize: number = 5) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { data: [], hasMore: false }

    const from = page * pageSize
    const to = from + pageSize - 1

    const { data, count } = await supabase
        .from('points_ledger')
        .select('*', { count: 'exact' })
        .eq('owner_id', user.id)
        // 충전 내역만 보여줄지, 전체 내역 보여줄지? 사용자는 '결제 내역'을 원함 -> 보통 충전 (MONEY -> POINT).
        // 하지만 포인트 사용 내역도 궁금할 수 있지만, 'Payment Info' 페이지이므로 실제 돈 나간 내역이 맞음.
        .eq('transaction_type', 'CHARGE')
        .order('created_at', { ascending: false })
        .range(from, to)

    const hasMore = count ? to < count - 1 : false
    return { data: data || [], hasMore }
}
