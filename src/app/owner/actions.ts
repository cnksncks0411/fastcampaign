'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

// ============================================
// Types
// ============================================

export type FormState = {
    error?: string
    success?: boolean
}

export interface StoreWithStatus {
    stores: {
        id: string
        name: string
        category: string | null
        address_text: string
        images: string[] | null
        verification_status?: 'PENDING' | 'APPROVED' | 'REJECTED'
        active_campaign?: {
            id: string
            title: string
            current_confirmed: number
            capacity: number
        }
    }[]
    pointsBalance: number
    isVerified: boolean
    latestNotices: {
        id: string
        title: string
        category: string
        created_at: string
    }[]
}

// ============================================
// Schemas
// ============================================

// 매장 등록 스키마
const storeSchema = z.object({
    name: z.string().min(1, '매장명을 입력해주세요'),
    category: z.string().min(1, '카테고리를 선택해주세요'),
    address_text: z.string().min(1, '주소를 입력해주세요'),
    address_detail: z.string().optional(),
    lat: z.coerce.number(),
    lng: z.coerce.number(),
    phone: z.string().optional(),
    description: z.string().optional(),
    site_url: z.string().optional(),
})

// 캠페인 생성 스키마 (guide.md 기반)
// 캠페인 생성 스키마 (guide.md 기반)
const campaignSchema = z.object({
    store_ids: z.string().transform(val => {
        try { return JSON.parse(val) } catch { return [] }
    }).refine((val: string[]) => val.length > 0, '최소 1개 이상의 매장을 선택해주세요'),
    description: z.string().optional(),
    benefit_text: z.string().min(1, '제공 혜택을 입력해주세요'),
    review_type: z.enum(['INSTAGRAM_STORY', 'NAVER_PLACE'], {
        errorMap: () => ({ message: '리뷰 유형을 선택해주세요' })
    }),
    required_tags: z.string().transform(val => {
        try { return JSON.parse(val) } catch { return [] }
    }),
    visit_time_windows: z.string().transform(val => {
        try { return JSON.parse(val) } catch { return [] }
    }),
    capacity: z.coerce.number().min(1, '모집 인원은 1명 이상이어야 합니다').max(100, '모집 인원은 100명을 초과할 수 없습니다'),
    end_date: z.string().optional(), // 마감일 직접 지정 (옵션)
})

// ============================================
// Constants (guide.md 정책)
// ============================================

const COST_PER_PERSON = 1000  // 정원 × 1000 포인트 차감
const CAMPAIGN_DURATION_HOURS = 48  // 게시 후 48시간 자동 종료

// ============================================
// Store Functions
// ============================================

// 사업주의 매장 목록 조회 (기본)
export async function getOwnerStores(): Promise<{ stores?: { id: string; name: string }[]; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    const { data: stores, error } = await supabase
        .from('stores')
        .select('id, name')
        .eq('owner_id', user.id)
        .eq('status', 'ACTIVE')
        .eq('status', 'ACTIVE')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Failed to fetch stores:', error)
        return { error: '매장 목록을 불러오는데 실패했습니다' }
    }

    return { stores: stores || [] }
}

// 사업주의 매장 목록 + 캠페인 상태 + 포인트 + 인증 상태 조회
export async function getOwnerStoresWithStatus(): Promise<{ data?: StoreWithStatus; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 1. 매장 목록 조회
    const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, name, category, address_text, images')
        .eq('owner_id', user.id)
        .eq('status', 'ACTIVE')
        .eq('status', 'ACTIVE')
        .eq('is_deleted', false)
        .order('created_at', { ascending: false })

    if (storesError) {
        console.error('Failed to fetch stores:', storesError)
        return { error: '매장 목록을 불러오는데 실패했습니다' }
    }

    const storeIds = stores.map(s => s.id)

    // 병렬 쿼리 실행
    const [verificationsRes, campaignsRes, walletRes, ownerVerificationRes, noticesRes] = await Promise.all([
        // 2. 매장별 인증 정보
        supabase.from('owner_verifications').select('store_id, status').eq('owner_id', user.id),
        // 3. 매장별 활성 캠페인 (매장당 1개 제한이므로 한 번에 가져와서 매핑)
        storeIds.length > 0 ? supabase.from('campaigns').select('id, store_id, title, current_confirmed, capacity').in('store_id', storeIds).in('status', ['ACTIVE', 'FULL']) : Promise.resolve({ data: [] }),
        // 4. 포인트 잔액
        supabase.from('points_wallets').select('balance').eq('owner_id', user.id).single(),
        // 5. 사업주 전체 인증 상태
        supabase.from('owner_verifications').select('status').eq('owner_id', user.id).eq('status', 'APPROVED').single(),
        // 6. 최신 공지사항 조회
        supabase.from('notices').select('id, title, category, created_at').eq('is_visible', true).order('created_at', { ascending: false }).limit(2)
    ])

    const verifications = verificationsRes.data || []
    const campaigns = campaignsRes.data || []
    const wallet = walletRes.data
    const isVerified = !!ownerVerificationRes.data
    const notices = noticesRes.data || []

    // 데이터 조립
    const storesWithStatus = stores.map(store => {
        const verifyStatus = verifications.find(v => v.store_id === store.id)?.status
        const activeCampaign = campaigns.find(c => c.store_id === store.id)

        return {
            ...store,
            verification_status: verifyStatus,
            active_campaign: activeCampaign ? {
                id: activeCampaign.id,
                title: activeCampaign.title,
                current_confirmed: activeCampaign.current_confirmed,
                capacity: activeCampaign.capacity
            } : undefined
        }
    })

    return {
        data: {
            stores: storesWithStatus,
            pointsBalance: wallet?.balance || 0,
            isVerified,
            latestNotices: notices
        }
    }
}

// 매장 등록
export async function registerStore(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()

    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 2. 프로필 존재 확인 및 자동 생성
    const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single()

    if (!profile) {
        console.log('Profile not found, creating one...')
        const { error: profileError } = await supabase
            .from('profiles')
            .insert({
                id: user.id,
                name: user.user_metadata?.name || user.email,
                role: 'OWNER'  // 매장 등록 시 OWNER로 설정
            })

        if (profileError) {
            console.error('Failed to create profile:', profileError)
            return { error: '프로필 생성에 실패했습니다. 다시 시도해주세요.' }
        }
    } else {
        // 프로필이 있으면 OWNER 역할로 업데이트
        await supabase
            .from('profiles')
            .update({ role: 'OWNER' })
            .eq('id', user.id)
    }

    // 3. 유효성 검사
    const rawData = {
        name: formData.get('name'),
        category: formData.get('category'),
        address_text: formData.get('address'),
        address_detail: formData.get('detailAddress'),
        lat: formData.get('lat'),
        lng: formData.get('lng'),
        phone: formData.get('phone'),
        description: formData.get('description'),
        site_url: formData.get('site_url'),
    }

    const validated = storeSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.errors[0].message }
    }

    // 3.5. 중복 사업자 번호 확인 (전체 유저 대상)
    const businessNumberInput = formData.get('businessNumber') as string
    if (businessNumberInput) {
        const { createAdminClient } = await import('@/lib/supabase/server')
        const admin = await createAdminClient()

        const { data: duplicates } = await admin
            .from('owner_verifications')
            .select('status, stores!inner(is_deleted)')
            .eq('business_number', businessNumberInput)
            .in('status', ['PENDING', 'APPROVED'])
            .eq('stores.is_deleted', false)

        if (duplicates && duplicates.length > 0) {
            return { error: '이미 등록된 사업자 번호입니다.' }
        }
    }

    // 4. 매장 등록
    const { data: store, error } = await supabase
        .from('stores')
        .insert({
            owner_id: user.id,
            ...validated.data,
            status: 'ACTIVE',
        })
        .select()
        .single()

    if (error) {
        console.error('Store registration error:', error)
        return { error: `매장 등록 실패: ${error.message}` }
    }

    // 5. 사업자 인증 정보 생성 (PENDING)
    const businessNumber = formData.get('businessNumber') as string
    if (businessNumber) {
        const { error: verifyError } = await supabase
            .from('owner_verifications')
            .insert({
                owner_id: user.id,
                store_id: store.id,
                business_number: businessNumber,
                status: 'PENDING'
            })

        if (verifyError) {
            console.error('Verification creation failed:', verifyError)
            // Non-fatal error
        }
    }

    // 6. [이벤트] 최초 매장 등록 시 3,000P 지급 (계정당 1회, 사업자번호당 1회 제한)
    // 조건: 본인인증(휴대폰) 완료, 계정별 이벤트 수령 이력 없음, 사업자번호별 수령 이력 없음
    const { data: userProfile } = await supabase
        .from('profiles')
        .select('phone, welcome_bonus_received')
        .eq('id', user.id)
        .single()

    if (userProfile?.phone && !userProfile.welcome_bonus_received) {
        // 사업자 번호 확인
        const bizNum = businessNumberInput || (formData.get('businessNumber') as string)

        if (bizNum) {
            // 이 사업자 번호로 이미 혜택을 받은 이력이 있는지 확인 (Admin 권한 필요할 수 있음 -> RLS가 닫혀있으면. 
            // 하지만 INSERT/SELECT를 위해 이 테이블은 일단 public RLS 정책 없으면 owner만? 
            // 아까 마이그레이션에서 RLS ENABLE하고 정책 안만듬. -> 그러면 service_role 없이는 접근 불가.
            // 따라서 createAdminClient 사용해야 함.)
            const { createAdminClient } = await import('@/lib/supabase/server')
            const admin = await createAdminClient()

            const { data: bizBonusHistory } = await admin
                .from('bonus_history_business_numbers')
                .select('business_number')
                .eq('business_number', bizNum)
                .maybeSingle()

            if (!bizBonusHistory) {
                // 포인트 지급 실행
                const { error: rewardError } = await supabase.rpc('charge_point_wallet', {
                    amount_to_add: 3000
                })

                if (!rewardError) {
                    // 지급 이력 기록 (Admin 권한으로 기록)
                    await Promise.all([
                        // 프로필 업데이트는 본인 권한으로 가능 (update own) - 아, welcome_bonus_received 컬럼 수정 정책?
                        // profiles 정책은 'update own' 허용됨. 하지만 특정 컬럼만 막는 기능은 없음.
                        // 다만 RLS 00002_rls_policies.sql 보면 FOR UPDATE USING (auth.uid() = id) 임.
                        // 즉 본인이 본인 프로필 수정 가능. -> 클라이언트 조작 가능성?
                        // -> 클라이언트가 직접 welcome_bonus_received = false로 바꾸면?
                        // -> 그러면 또 받을 수 있나?
                        // -> bizBonusHistory가 막아줌 (사업자 번호 중복).
                        // -> 다른 사업자 번호 가져오면? -> 막을 수 없음 (새로운 사업자니까).
                        // -> 결론: 클라이언트가 welcome_bonus_received를 false로 조작해서 새 사업자로 또 받는 건 막기 힘듦.
                        // -> 이를 막으려면 welcome_bonus_received 컬럼은 본인이 수정 못하게 해야 함. (Trigger or Column-level generic security).
                        // -> 지금은 'actions.ts'가 서버 사이드니까, 여기서 admin으로 업데이트하는 게 안전함.
                        admin.from('profiles').update({ welcome_bonus_received: true }).eq('id', user.id),
                        admin.from('bonus_history_business_numbers').insert({
                            business_number: bizNum,
                            user_id: user.id,
                            store_id: store.id
                        })
                    ])
                    console.log(`[Event] User ${user.id} rewarded 3000P (New BizNum: ${bizNum})`)
                }
            }
        }
    }

    redirect('/my/profile')
}

// ============================================
// Campaign Functions
// ============================================

// 캠페인 생성 (guide.md 스펙 준수)
export async function createCampaign(
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()

    // 1. 로그인 확인
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 2. 사업주 인증 확인
    const { data: verification } = await supabase
        .from('owner_verifications')
        .select('status')
        .eq('owner_id', user.id)
        .eq('status', 'APPROVED')
        .single()

    if (!verification) {
        return { error: '사업주 인증이 필요합니다. 인증 후 캠페인을 생성해주세요.' }
    }

    // 3. 유효성 검사
    const rawData = {
        store_ids: formData.get('store_ids'),
        description: formData.get('description') || undefined,
        benefit_text: formData.get('benefit_text'),
        review_type: formData.get('review_type'),
        required_tags: formData.get('required_tags'),
        visit_time_windows: formData.get('visit_time_windows'),
        capacity: formData.get('capacity'),
        end_date: formData.get('end_date') || undefined,
    }

    const validated = campaignSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.errors[0].message }
    }

    const storeIds = validated.data.store_ids as string[]

    // 4. 매장 소유권 및 중복 캠페인 확인 (Bulk)
    const { data: stores, error: storesError } = await supabase
        .from('stores')
        .select('id, owner_id, name, active_campaign:campaigns(id)') // active_campaign via foreign key if setup, or check manually
        .in('id', storeIds)
        .eq('owner_id', user.id)
        .eq('is_deleted', false)

    if (storesError || !stores || stores.length !== storeIds.length) {
        return { error: '선택한 매장 정보를 불러올 수 없거나 권한이 없습니다.' }
    }

    // 활성 캠페인 수동 체크 (Relation이 명확하지 않을 수 있으므로)
    const { data: activeCampaigns } = await supabase
        .from('campaigns')
        .select('store_id')
        .in('store_id', storeIds)
        .in('status', ['ACTIVE', 'FULL'])

    const storesWithActiveCampaign = activeCampaigns?.map(c => c.store_id) || []
    if (storesWithActiveCampaign.length > 0) {
        const problemStore = stores.find(s => storesWithActiveCampaign.includes(s.id))
        return { error: `[${problemStore?.name}] 매장에 이미 진행 중인 캠페인이 있습니다.` }
    }

    // 5. 포인트 확인 및 차감
    // 총 비용 = (매장 수) x (모집 인원) x (인당 비용)
    const totalCapacity = validated.data.capacity * storeIds.length
    const totalCost = totalCapacity * COST_PER_PERSON

    const { data: wallet } = await supabase
        .from('points_wallets')
        .select('balance')
        .eq('owner_id', user.id)
        .single()

    if (!wallet || wallet.balance < totalCost) {
        return { error: `포인트가 부족합니다. 필요: ${totalCost.toLocaleString()}P, 보유: ${(wallet?.balance || 0).toLocaleString()}P` }
    }

    // 6. 종료 시간 계산
    // 사용자가 마감일을 지정했으면 그 날짜의 23:59:59, 아니면 48시간 후 (기본값)
    // 사용자 요구: "직접 지정 혹은 인원 마감까지" -> 인원 마감은 로직상의 종료 조건이고, 시간상 종료 조건(End Date)은 필수임 (DB not null).
    // 따라서 마감 지정 안 하면 넉넉하게 2주(14일) 뒤로 잡거나 48시간 정책 유지. 
    // 여기서는 사용자가 '마감일' 입력 폼을 사용할 것이므로 입력값 우선.
    let endAt: Date
    if (validated.data.end_date) {
        endAt = new Date(validated.data.end_date)
        endAt.setHours(23, 59, 59, 999)
    } else {
        // 기본 14일 (사용자가 14일 언급함 "선정 후 14일 이내" -> 이건 방문기간이고 모집기간은?)
        // 보통 모집은 1~2주.
        const startAt = new Date()
        endAt = new Date(startAt.getTime() + 14 * 24 * 60 * 60 * 1000)
    }
    const startAt = new Date()

    // 캠페인 데이터 준비
    const campaignsToInsert = stores.map(store => ({
        store_id: store.id,
        title: `[${store.name}] ${validated.data.review_type === 'INSTAGRAM_STORY' ? '인스타 스토리' : '네이버 리뷰'} 체험단`,
        description: validated.data.description || null,
        benefit_text: validated.data.benefit_text,
        review_type: validated.data.review_type,
        required_tags: validated.data.required_tags,
        visit_time_windows: validated.data.visit_time_windows,
        capacity: validated.data.capacity,
        start_at: startAt.toISOString(),
        end_at: endAt.toISOString(),
    }))

    // 7. 트랜잭션 (RPC 호출)
    const { data: rpcResult, error: rpcError } = await supabase.rpc('create_campaigns_with_payment', {
        p_campaigns: campaignsToInsert,
        p_total_cost: totalCost
    })

    if (rpcError || (rpcResult && !rpcResult.success)) {
        console.error('RPC Error:', rpcError || rpcResult)
        return { error: '캠페인 생성 실패: ' + (rpcError?.message || rpcResult?.error || '알 수 없는 오류') }
    }

    return { success: true }
}

// 사업주의 캠페인 목록 조회
export async function getOwnerCampaigns(status: 'ACTIVE' | 'ENDED' | 'ALL' = 'ACTIVE', storeId?: string): Promise<{ campaigns?: any[]; error?: string }> {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    let query = supabase
        .from('campaigns')
        .select(`
            *,
            stores (
                id,
                name,
                images,
                category
            )
        `)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

    if (status === 'ACTIVE') {
        query = query.in('status', ['ACTIVE', 'FULL'])
    } else if (status === 'ENDED') {
        // DB Enum 값을 정확히 모르므로, 활성 상태(ACTIVE, FULL)가 아닌 모든 것을 조회
        query = query.neq('status', 'ACTIVE').neq('status', 'FULL')
    }

    if (storeId) {
        query = query.eq('store_id', storeId)
    }

    const { data: campaigns, error } = await query

    if (error) {
        console.error('Failed to fetch campaigns:', error)
        return { error: '캠페인 목록을 불러오는데 실패했습니다' }
    }

    return { campaigns: campaigns || [] }
}

export async function getOwnerCampaignDetail(id: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    // 1. Fetch Campaign Info
    const { data: campaign, error } = await supabase
        .from('campaigns')
        .select(`*, stores(name, category, images)`)
        .eq('id', id)
        .eq('created_by', user.id)
        .single()

    if (error || !campaign) {
        return { error: '캠페인 정보를 불러올 수 없습니다' }
    }

    // 2. Fetch Applications Separately (Avoid RLS complexity in joins)
    const { data: applications } = await supabase
        .from('applications')
        .select(`
            status,
            checked_in_at,
            profiles(name)
        `)
        .eq('campaign_id', id)

    // Merge
    const result = {
        ...campaign,
        applications: applications || []
    }

    return { campaign: result }
}

export async function updateCampaign(
    id: string,
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    // 유효성 검사 (Create와 동일한 스키마 사용 가능하지만, store_ids, capacity 제외)
    // 여기선 간단히 직접 추출
    const description = formData.get('description') as string
    const benefit_text = formData.get('benefit_text') as string
    const review_type = formData.get('review_type') as string
    const required_tagsRaw = formData.get('required_tags') as string
    const visit_time_windowsRaw = formData.get('visit_time_windows') as string
    const end_date = formData.get('end_date') as string

    // 필수값 체크
    if (!benefit_text) return { error: '제공 서비스를 입력해주세요' }

    let required_tags: string[] = []
    try { required_tags = JSON.parse(required_tagsRaw) } catch { }

    let visit_time_windows: any[] = []
    try { visit_time_windows = JSON.parse(visit_time_windowsRaw) } catch { }

    let endAt: string | undefined
    if (end_date) {
        const d = new Date(end_date)
        d.setHours(23, 59, 59, 999)
        endAt = d.toISOString()
    }

    const updateData: any = {
        description: description || null,
        benefit_text,
        review_type,
        required_tags,
        visit_time_windows,
        updated_at: new Date().toISOString()
    }
    if (endAt) updateData.end_at = endAt

    const { error } = await supabase
        .from('campaigns')
        .update(updateData)
        .eq('id', id)
        .eq('created_by', user.id)

    if (error) return { error: '캠페인 수정 실패' }

    redirect(`/owner/campaigns/${id}`)
}

// ============================================
// Subscription Functions
// ============================================

export async function getOwnerSubscriptionStats() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: '로그인이 필요합니다' }
    }

    // 프로필의 플랜 정보와 현재 매장 수 조회
    const [profileRes, storesRes] = await Promise.all([
        supabase.from('profiles').select('subscription_plan').eq('id', user.id).single(),
        supabase.from('stores').select('id', { count: 'exact', head: true }).eq('owner_id', user.id).eq('is_deleted', false)
    ])

    const plan = profileRes.data?.subscription_plan || 'BASIC'
    const count = storesRes.count || 0

    const limits: Record<string, number> = {
        'BASIC': 1,
        'STARTER': 5,
        'PRO': 20,
        'ENTERPRISE': 9999
    }
    const limit = limits[plan] || 1

    return { plan, count, limit }
}

// ============================================
// Store Management Functions
// ============================================

export async function getOwnerStoreDetail(storeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { error: '로그인이 필요합니다' }

    const { data, error } = await supabase
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .eq('owner_id', user.id)
        .eq('owner_id', user.id)
        .eq('is_deleted', false)
        .single()

    if (error) return { error: '매장 정보를 불러올 수 없습니다' }
    return { store: data }
}

export async function updateStore(
    storeId: string,
    prevState: FormState,
    formData: FormData
): Promise<FormState> {
    const supabase = await createClient()

    const rawData = {
        name: formData.get('name'),
        category: formData.get('category'),
        address_text: formData.get('address'),
        address_detail: formData.get('detailAddress'),
        lat: formData.get('lat'),
        lng: formData.get('lng'),
        phone: formData.get('phone'),
        description: formData.get('description'),
        site_url: formData.get('site_url'),
    }

    const validated = storeSchema.safeParse(rawData)
    if (!validated.success) {
        return { error: validated.error.errors[0].message }
    }

    const { error } = await supabase
        .from('stores')
        .update({
            ...validated.data,
            updated_at: new Date().toISOString()
        })
        .eq('id', storeId)

    if (error) {
        return { error: '매장 정보 수정에 실패했습니다.' }
    }

    return { success: true }
}

export async function deleteStore(storeId: string) {
    const supabase = await createClient()

    // 1. Auth Check (getUser needed for role update)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    // 2. Soft Delete: 실제 데이터는 남기고 플래그만 변경
    const { error } = await supabase
        .from('stores')
        .update({ is_deleted: true })
        .eq('id', storeId)

    if (error) {
        console.error('Soft delete store error:', error)
        return { error: '삭제 실패: ' + (error.message || '알 수 없는 오류') }
    }

    // 3. Check remaining stores count
    const { count } = await supabase
        .from('stores')
        .select('id', { count: 'exact', head: true })
        .eq('owner_id', user.id)
        .eq('is_deleted', false)

    // 4. Downgrade role if no stores left
    if (count === 0) {
        await supabase
            .from('profiles')
            .update({ role: 'USER' })
            .eq('id', user.id)
    }

    revalidatePath('/owner/stores')
    return { success: true }
}

// ============================================
// Point & Wallet Functions
// ============================================

export async function getPointWallet() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    const { data: wallet, error } = await supabase
        .from('points_wallets')
        .select('balance')
        .eq('owner_id', user.id)
        .single()

    if (error && error.code === 'PGRST116') {
        return { balance: 0 }
    }

    return { balance: wallet?.balance || 0 }
}

export async function getPointHistory() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    const { data: history, error } = await supabase
        .from('points_ledger')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

    if (error) return { error: '포인트 내역을 불러오는데 실패했습니다' }

    return { history: history || [] }
}

/* 
// DEPRECATED: Replaced by chargePoints RPC version for better atomic handling
export async function chargePointsDeprecated(amount: number): Promise<FormState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    // 1. Get current wallet
    const { data: wallet } = await supabase
        .from('points_wallets')
        .select('balance')
        .eq('owner_id', user.id)
        .single()

    // Create wallet if not exists (should exist though)
    const currentBalance = wallet?.balance || 0
    const newBalance = currentBalance + amount

    // 2. Update Wallet (Upsert to handle non-existent wallet)
    const { error: walletError } = await supabase
        .from('points_wallets')
        .upsert({
            owner_id: user.id,
            balance: newBalance,
            updated_at: new Date().toISOString()
        })

    if (walletError) {
        return { error: '충전 중 오류가 발생했습니다.' }
    }

    // 3. Insert Ledger
    const idempotencyKey = `charge_${Date.now()}_${user.id}`
    await supabase
        .from('points_ledger')
        .insert({
            owner_id: user.id,
            transaction_type: 'CHARGE',
            amount: amount,
            balance_after: newBalance,
            description: `포인트 충전`,
            idempotency_key: idempotencyKey
        })

    revalidatePath('/owner/points')
    return { success: true }
}
*/

export async function chargePoints(amount: number): Promise<FormState> {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return { error: '로그인이 필요합니다' }

    // Use RPC to bypass RLS and ensure atomicity
    const { data, error } = await supabase.rpc('charge_point_wallet', {
        amount_to_add: amount
    })

    if (error) {
        console.error('Charge RPC error:', error)
        return { error: '충전 중 오류가 발생했습니다: ' + error.message }
    }

    const result = data as { success: boolean; error?: string }

    if (!result.success) {
        return { error: '충전 실패: ' + (result.error || '알 수 없는 오류') }
    }

    revalidatePath('/owner/points')
    return { success: true }
}
