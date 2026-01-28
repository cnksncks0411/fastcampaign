// ============================================
// 데이터베이스 타입 정의
// 실제 사용 시 supabase gen types로 자동 생성 권장
// ============================================

export type UserRole = 'USER' | 'OWNER' | 'ADMIN'
export type StoreStatus = 'ACTIVE' | 'SUSPENDED'
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED'
export type CampaignStatus = 'ACTIVE' | 'FULL' | 'ENDED'
export type ReviewType = 'INSTAGRAM_STORY' | 'INSTAGRAM_FEED' | 'NAVER_BLOG' | 'NAVER_PLACE' | 'GOOGLE_REVIEW'
export type ApplicationStatus = 'CONFIRMED' | 'CANCELLED_BY_USER' | 'CHECKED_IN' | 'NO_SHOW'
export type CancelContext = 'BEFORE_FULL' | 'AFTER_FULL'
export type PointTransactionType = 'CHARGE' | 'CAMPAIGN_CREATE_DEBIT' | 'NO_SHOW_REFUND' | 'ADMIN_ADJUST'

export interface Profile {
    id: string
    role: UserRole
    name: string | null
    phone: string | null
    avatar_url: string | null
    no_show_count: number
    restricted_until: string | null
    created_at: string
    updated_at: string
    subscription_plan?: string // 'BASIC' | 'STARTER' | 'PRO' | 'ENTERPRISE'
}

export interface Store {
    id: string
    owner_id: string
    name: string
    description: string | null
    address_text: string
    address_detail: string | null
    lat: number
    lng: number
    phone: string | null
    site_url: string | null
    category: string | null
    images: string[] | null
    status: StoreStatus
    created_at: string
    updated_at: string
}

export interface OwnerVerification {
    id: string
    owner_id: string
    store_id: string | null
    business_number: string | null
    business_name: string | null
    representative_name: string | null
    doc_url: string | null
    status: VerificationStatus
    rejection_reason: string | null
    reviewed_by: string | null
    reviewed_at: string | null
    created_at: string
    updated_at: string
}

export interface VisitTimeWindow {
    day: 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'
    start: string // "HH:mm"
    end: string   // "HH:mm"
}

export interface Campaign {
    id: string
    store_id: string
    created_by: string
    title: string
    description: string | null
    benefit_text: string
    review_type: ReviewType
    required_tags: string[] | null
    visit_time_windows: VisitTimeWindow[] | null
    capacity: number
    current_confirmed: number
    status: CampaignStatus
    start_at: string
    end_at: string
    ended_at: string | null
    created_at: string
    updated_at: string
}

export interface CampaignWithStore extends Campaign {
    store: Store
}

export interface Application {
    id: string
    campaign_id: string
    user_id: string
    status: ApplicationStatus
    cancel_context: CancelContext | null
    confirmed_at: string
    cancelled_at: string | null
    checked_in_at: string | null
    created_at: string
    updated_at: string
}

export interface ApplicationWithDetails extends Application {
    campaign: CampaignWithStore
    user: Profile
}

export interface CheckinToken {
    id: string
    application_id: string
    token: string
    expires_at: string
    used_at: string | null
    created_at: string
}

export interface PointsWallet {
    owner_id: string
    balance: number
    created_at: string
    updated_at: string
}

export interface PointsLedger {
    id: string
    owner_id: string
    transaction_type: PointTransactionType
    amount: number
    balance_after: number
    ref_type: string | null
    ref_id: string | null
    description: string | null
    idempotency_key: string | null
    created_at: string
}

export interface Settlement {
    id: string
    campaign_id: string
    owner_id: string
    total_applications: number
    checked_in_count: number
    no_show_count: number
    after_full_cancel_count: number
    refund_points_total: number
    ledger_id: string | null
    computed_at: string
}

// ============================================
// API 응답 타입
// ============================================

export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
}

export interface PaginatedResponse<T> {
    data: T[]
    total: number
    page: number
    pageSize: number
    totalPages: number
}
