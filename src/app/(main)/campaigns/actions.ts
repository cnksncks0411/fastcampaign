'use server'

import { createClient } from '@/lib/supabase/server'

export interface Campaign {
    id: string
    title: string
    description: string | null
    benefit_text: string
    review_type: string
    required_tags: string[] | null
    visit_time_windows: { day: string; time: string }[] | null
    capacity: number
    current_confirmed: number
    status: string
    start_at: string
    end_at: string
    store: {
        id: string
        name: string
        address_text: string
        category: string | null
        lat: number
        lng: number
    }
}

export interface CampaignListItem {
    id: string
    title: string
    benefit_text: string
    review_type: string
    capacity: number
    current_confirmed: number
    end_at: string
    store: {
        name: string
        category: string | null
        lat: number
        lng: number
    }
}

// 활성 캠페인 목록 조회
export async function getActiveCampaigns(options?: {
    reviewType?: string
    category?: string
    limit?: number
    bounds?: { south: number; west: number; north: number; east: number }
}): Promise<{ campaigns: CampaignListItem[]; error?: string }> {
    const supabase = await createClient()

    let query = supabase
        .from('campaigns')
        .select(`
            id,
            title,
            benefit_text,
            review_type,
            capacity,
            current_confirmed,
            end_at,
            store:stores!inner (
                name,
                category,
                lat,
                lng
            )
        `)
        .eq('status', 'ACTIVE')
        .gt('end_at', new Date().toISOString())
        .order('created_at', { ascending: false })

    if (options?.reviewType) {
        query = query.eq('review_type', options.reviewType)
    }

    if (options?.limit) {
        query = query.limit(options.limit)
    }

    if (options?.bounds) {
        query = query
            .gte('store.lat', options.bounds.south)
            .lte('store.lat', options.bounds.north)
            .gte('store.lng', options.bounds.west)
            .lte('store.lng', options.bounds.east)
    }

    const { data, error } = await query

    if (error) {
        console.error('Failed to fetch campaigns:', error)
        return { campaigns: [], error: '캠페인 목록을 불러오는데 실패했습니다' }
    }

    // Flatten the store object from array to single object
    const campaigns = (data || []).map((c) => ({
        ...c,
        store: Array.isArray(c.store) ? c.store[0] : c.store
    })) as CampaignListItem[]

    return { campaigns }
}

// 캠페인 상세 조회
export async function getCampaignById(id: string): Promise<{ campaign?: Campaign; error?: string }> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('campaigns')
        .select(`
            id,
            title,
            description,
            benefit_text,
            review_type,
            required_tags,
            visit_time_windows,
            capacity,
            current_confirmed,
            status,
            start_at,
            end_at,
            store:stores (
                id,
                name,
                address_text,
                category,
                lat,
                lng
            )
        `)
        .eq('id', id)
        .single()

    if (error) {
        console.error('Failed to fetch campaign:', error)
        return { error: '캠페인을 찾을 수 없습니다' }
    }

    // Flatten the store object
    const campaign = {
        ...data,
        store: Array.isArray(data.store) ? data.store[0] : data.store
    } as Campaign

    return { campaign }
}

// 캠페인 신청
export async function applyToCampaign(campaignId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 2. 프로필 확인 (제한 여부)
    const { data: profile } = await supabase
        .from('profiles')
        .select('restricted_until')
        .eq('id', user.id)
        .single()

    if (profile?.restricted_until && new Date(profile.restricted_until) > new Date()) {
        return { error: '현재 서비스 이용이 제한된 상태입니다' }
    }

    // 3 ~ 6. RPC 호출 (원자적 처리: 캠페인 확인, 신청, 토큰 생성, 카운트 증가)
    const { data: result, error: rpcError } = await supabase.rpc('apply_to_campaign', {
        p_campaign_id: campaignId,
        p_user_id: user.id
    })

    if (rpcError) {
        console.error('RPC Error:', rpcError)
        return { error: '신청 처리 중 오류가 발생했습니다' }
    }

    if (result && result.error) {
        return { error: result.error }
    }

    return { success: true }
}

// 캠페인 신청 취소 (RPC 사용)
export async function cancelApplication(campaignId: string): Promise<{ success?: boolean; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 1. 내 신청 건 조회 (ID 확인용)
    const { data: application } = await supabase
        .from('applications')
        .select('id')
        .eq('campaign_id', campaignId)
        .eq('user_id', user.id)
        .eq('status', 'CONFIRMED')
        .single()

    if (!application) {
        return { error: '취소할 신청 내역이 없습니다.' }
    }

    // 2. RPC 호출 (취소, 환급/반환 처리)
    const { data: result, error } = await supabase.rpc('cancel_my_application', {
        p_application_id: application.id
    })

    if (error) {
        console.error('Cancel RPC Error:', error)
        return { error: '취소 처리 중 오류가 발생했습니다.' }
    }

    if (result && result.error) {
        return { error: result.error }
    }

    return { success: true }
}

// 사용자의 신청 현황 조회
export async function getUserApplications(): Promise<{ applications: { campaign_id: string; status: string }[]; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { applications: [], error: '로그인이 필요합니다' }
    }

    const { data, error } = await supabase
        .from('applications')
        .select('campaign_id, status')
        .eq('user_id', user.id)

    if (error) {
        return { applications: [], error: '신청 현황을 불러오는데 실패했습니다' }
    }

    return { applications: data || [] }
}
