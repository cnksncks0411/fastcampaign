'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export interface CheckinResult {
    userName: string
    campaignTitle: string
    benefit: string
    reviewType: string
    checkedInAt: string
}

export type CheckinState = {
    error?: string
    success?: boolean
    data?: CheckinResult
}

const tokenSchema = z.object({
    token: z.string().length(8, '코드는 8자리여야 합니다').toUpperCase(),
})

// 토큰 검증 및 체크인 처리
export async function verifyCheckinToken(
    prevState: CheckinState,
    formData: FormData
): Promise<CheckinState> {
    const supabase = await createClient()

    // 1. 사업주 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 2. 토큰 유효성 검사
    const token = formData.get('token')
    const validated = tokenSchema.safeParse({ token })

    if (!validated.success) {
        return { error: validated.error.errors[0].message }
    }

    const checkinToken = validated.data.token

    // 3. 토큰 조회 (유효기간, 사용 여부 확인)
    const { data: tokenData, error: tokenError } = await supabase
        .from('checkin_tokens')
        .select(`
            id,
            application_id,
            expires_at,
            used_at,
            application:applications (
                id,
                user_id,
                status,
                campaign:campaigns (
                    id,
                    title,
                    benefit_text,
                    review_type,
                    store_id
                ),
                user:profiles (
                    name,
                    email
                )
            )
        `)
        .eq('token', checkinToken)
        .single()

    if (tokenError || !tokenData) {
        return { error: '유효하지 않은 코드입니다' }
    }

    if (tokenData.used_at) {
        return { error: '이미 사용된 코드입니다' }
    }

    if (new Date(tokenData.expires_at) < new Date()) {
        return { error: '만료된 코드입니다 (24시간 경과)' }
    }

    // 타입 캐스팅
    const application = tokenData.application as any
    const campaign = application?.campaign
    const applicant = application?.user

    if (!campaign) {
        return { error: '캠페인 정보를 찾을 수 없습니다' }
    }

    // 4. 권한 확인 (본인 매장의 캠페인인지)
    // 매장 소유주 확인
    const { data: store } = await supabase
        .from('stores')
        .select('owner_id')
        .eq('id', campaign.store_id)
        .single()

    if (!store || store.owner_id !== user.id) {
        return { error: '해당 매장의 코드가 아닙니다' }
    }

    // 5. 체크인 처리 (트랜잭션 권장되나 Supabase JS에서는 순차 처리)
    const now = new Date().toISOString()

    // 5-1. 토큰 사용 처리
    const { error: updateTokenError } = await supabase
        .from('checkin_tokens')
        .update({ used_at: now })
        .eq('id', tokenData.id)

    if (updateTokenError) {
        return { error: '체크인 처리 중 오류가 발생했습니다 (토큰 갱신)' }
    }

    // 5-2. 신청 상태 업데이트
    const { error: updateAppError } = await supabase
        .from('applications')
        .update({
            status: 'CHECKED_IN',
            checked_in_at: now
        })
        .eq('id', tokenData.application_id)

    if (updateAppError) {
        console.error('Application update error:', updateAppError)
        // 토큰은 사용되었지만 상태 업데이트 실패 시... (심각한 오류)
        return { error: '체크인 상태 업데이트에 실패했습니다. 관리자에게 문의하세요.' }
    }

    return {
        success: true,
        data: {
            userName: applicant?.name || '사용자',
            campaignTitle: campaign.title,
            benefit: campaign.benefit_text,
            reviewType: campaign.review_type,
            checkedInAt: now
        }
    }
}

// 최근 체크인 내역 조회 (옵션)
export async function verifyLastCheckin() {
    return {}
}
