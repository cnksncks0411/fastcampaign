'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createJsClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { encrypt, decrypt, hashPhone } from '@/lib/crypto'

// 유효성 검사 스키마
const signUpSchema = z.object({
    name: z.string().min(2, '이름은 2자 이상이어야 합니다'),
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    // 비밀번호: 8자 이상, 영문, 숫자, 특수문자 포함
    password: z.string()
        .min(8, '비밀번호는 8자 이상이어야 합니다')
        .regex(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*])/, '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다'),
    phone: z.string().min(10, '휴대폰 번호를 올바르게 입력해주세요'),
})

const signInSchema = z.object({
    email: z.string().email('올바른 이메일 형식이 아닙니다'),
    password: z.string().min(1, '비밀번호를 입력해주세요'),
})

export type AuthState = {
    error?: string
    success?: boolean
    message?: string
}

type ResetPasswordParams = {
    email: string
    phone: string
    password: string
}

// ============================================
// 휴대폰 인증 (Mock)
// ============================================
export async function sendVerificationCode(phone: string, email?: string) {
    if (email) {
        try {
            const { createAdminClient } = await import('@/lib/supabase/server')
            const admin = await createAdminClient()

            const { data: profile } = await admin
                .from('profiles')
                .select('phone')
                .eq('email', email)
                .maybeSingle()

            if (!profile || !profile.phone) {
                return { success: false, error: '입력하신 정보와 일치하는 회원이 없습니다.' }
            }

            const { decrypt } = await import('@/lib/crypto')
            const decryptedPhone = decrypt(profile.phone)
            const inputPhoneClean = phone.replace(/-/g, '').trim()
            const storedPhoneClean = decryptedPhone.replace(/-/g, '').trim()

            if (inputPhoneClean !== storedPhoneClean) {
                return { success: false, error: '입력하신 정보와 일치하는 회원이 없습니다.' }
            }
        } catch (e) {
            console.error('Verify phone match error:', e)
            return { success: false, error: '서버 오류: 서비스 키 설정을 확인해주세요.' }
        }
    }

    console.log(`[Mock SMS] Verification code for ${phone}: 123456`)
    return { success: true, message: '인증번호가 발송되었습니다.' }
}

export async function verifyPhoneCode(phone: string, code: string) {
    if (code === '123456') {
        return { success: true, message: '인증되었습니다.' }
    }
    return { success: false, error: '인증번호가 올바르지 않습니다.' }
}

// ============================================
// 회원가입
// ============================================
export async function signUp(
    prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    const rawFormData = {
        name: formData.get('name') as string,
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        phone: formData.get('phone') as string,
    }

    const validatedFields = signUpSchema.safeParse(rawFormData)
    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message }
    }

    const { name, email, password, phone } = validatedFields.data
    const supabase = await createClient()

    // 1. 휴대폰 번호 암호화 & 닉네임 생성
    const encryptedPhone = phone ? encrypt(phone) : null
    const nickname = `user_${Math.random().toString(36).slice(2, 10)}`

    // 2. Supabase Auth로 회원가입
    // Trigger(handle_new_user)가 profiles 테이블 생성을 담당합니다.
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                nickname, // 닉네임도 미리 생성해서 전달
                phone: encryptedPhone, // 암호화된 번호를 메타데이터로 전달
                phone_hash: phone ? hashPhone(phone) : null, // 중복 방지용 해시
            },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/callback`,
        },
    })

    if (error) {
        console.error('SignUp error:', error.message)
        if (error.message.includes('already registered')) {
            return { error: '이미 가입된 이메일입니다' }
        }
        return { error: `회원가입 실패: ${error.message}` }
    }

    console.log('SignUp successful. User ID:', data.user?.id)

    // 3. Profiles 테이블에 프로필 생성 보장 (Fallback 로직)
    // 트리거(DB)가 실패할 경우를 대비하여, 서버에서 직접 생성을 시도합니다.
    if (data.user && data.session) {
        try {
            console.log('Attempting manual profile creation/check...')

            // 인증된 클라이언트 생성 (RLS 우회)
            const authenticatedClient = createJsClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
                {
                    global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
                }
            )

            const { error: profileError } = await authenticatedClient
                .from('profiles')
                .upsert({
                    id: data.user.id,
                    name,
                    email,
                    nickname,
                    phone: encryptedPhone,
                    phone_hash: phone ? hashPhone(phone) : null,
                    role: 'USER',
                }, { onConflict: 'id' })

            if (profileError) {
                console.error('Manual profile creation failed (Trigger might have handled it?):', profileError.message)
            } else {
                console.log('Profile ensured via Actions.')
            }
        } catch (e) {
            console.error('Profile creation fallback exception:', e)
        }
    }

    // 3. 로그아웃 (자동 로그인 방지)
    await supabase.auth.signOut()

    return {
        success: true,
        message: '회원가입이 완료되었습니다! 로그인해주세요.',
    }
}

// ============================================
// 로그인
// ============================================
export async function signIn(
    prevState: AuthState,
    formData: FormData
): Promise<AuthState> {
    const rawFormData = {
        email: formData.get('email') as string,
        password: formData.get('password') as string,
    }

    const validatedFields = signInSchema.safeParse(rawFormData)
    if (!validatedFields.success) {
        return { error: validatedFields.error.errors[0].message }
    }

    const { email, password } = validatedFields.data
    const supabase = await createClient()

    // 1. 로그인 시도
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    })

    if (error) {
        console.error('SignIn error:', error.message)
        if (error.message.includes('Invalid login credentials')) {
            return { error: '이메일 또는 비밀번호가 올바르지 않습니다' }
        }
        if (error.message.includes('Email not confirmed')) {
            return { error: '이메일 인증이 필요합니다. 메일함을 확인해주세요.' }
        }
        return { error: '로그인에 실패했습니다. 다시 시도해주세요.' }
    }

    // 2. 프로필 존재 확인 (없으면 생성)
    if (data.user && data.session) {
        // 인증된 클라이언트 생성
        const authenticatedClient = createJsClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
            {
                global: { headers: { Authorization: `Bearer ${data.session.access_token}` } }
            }
        )
        const name = data.user.user_metadata?.name || email.split('@')[0]
        const phone = data.user.user_metadata?.phone
        const phoneHash = data.user.user_metadata?.phone_hash
        await ensureProfileExists(authenticatedClient, data.user.id, name, email, phone, phoneHash)
    }

    redirect('/')
}

// ... 나머지 함수들 (signOut, getCurrentUser, switchToOwner, checkEmailDuplicate, verifyUserAndResetPassword, ensureProfileExists)
// 아래 코드는 기존과 동일하므로 생략하지 않고 포함합니다.

export async function signOut(): Promise<void> {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function getCurrentUser() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
    return { id: user.id, email: user.email, ...profile }
}

export async function switchToOwner(): Promise<AuthState> {
    return { error: 'Deprecated function' }
}

// ensureProfileExists: 'any' 타입 허용
async function ensureProfileExists(
    supabase: any,
    userId: string,
    name: string,
    email: string,
    phone?: string,
    phoneHash?: string
) {
    const { data: existingProfile } = await supabase.from('profiles').select('id').eq('id', userId).single()
    if (existingProfile) return

    const { error } = await supabase.from('profiles').insert({
        id: userId,
        name,
        email,
        phone: phone ? encrypt(phone) : null,
        phone_hash: phoneHash || (phone ? hashPhone(phone) : null),
        role: 'USER',
    })
    if (error) console.error('Failed to create profile:', error.message)
}

export async function checkEmailDuplicate(email: string) {
    try {
        const supabase = await createClient()
        const { data: exists, error } = await supabase.rpc('check_email_exists', { email_input: email })
        if (error) return { available: false, message: '중복 확인 기능을 사용할 수 없습니다.' }
        if (exists) return { available: false, message: '이미 가입된 이메일입니다.' }
        return { available: true }
    } catch (e: any) {
        return { available: false, message: '서버 오류가 발생했습니다.' }
    }
}

export async function verifyUserAndResetPassword({ email, phone, password }: ResetPasswordParams) {
    try {
        if (!email || !phone || !password) return { success: false, error: '모든 정보를 입력해주세요.' }
        const { createAdminClient } = await import('@/lib/supabase/server')
        let admin: any
        try { admin = await createAdminClient() }
        catch (adminError) { return { success: false, error: '서버 설정 오류: Service Key가 필요합니다.' } }
        if (!admin) return { success: false, error: '관리자 권한을 획득할 수 없습니다.' }

        const { data: profile, error } = await admin.from('profiles').select('id, phone').eq('email', email).maybeSingle()
        if (error || !profile) return { success: false, error: '계정을 찾을 수 없습니다.' }
        if (!profile.phone) return { success: false, error: '등록된 휴대폰 번호가 없습니다.' }

        try {
            const { decrypt } = await import('@/lib/crypto')
            if (phone.replace(/-/g, '').trim() !== decrypt(profile.phone).replace(/-/g, '').trim()) {
                return { success: false, error: '정보가 일치하지 않습니다.' }
            }
        } catch { return { success: false, error: '오류가 발생했습니다.' } }

        const { error: updateError } = await admin.auth.admin.updateUserById(profile.id, { password: password })
        if (updateError) return { success: false, error: '비밀번호 변경 실패' }
        return { success: true }
    } catch (e: any) {
        return { success: false, error: `서버 오류: ${e?.message}` }
    }
}
