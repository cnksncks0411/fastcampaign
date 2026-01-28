import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ProfileForm } from './profile-form'
import { PasswordForm } from './password-form'
import { DeleteAccountButton } from './delete-account-button'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { BackButton } from '@/components/common/BackButton'

export default async function SettingsPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single()

    return (
        <div className="bg-slate-50 dark:bg-slate-950">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-100 dark:border-slate-800 px-4 h-14 flex items-center gap-3">
                <BackButton />
                <h1 className="font-bold text-lg text-slate-900 dark:text-slate-100 ml-2">계정 설정</h1>
            </div>

            <div className="p-5 max-w-lg mx-auto">
                <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 space-y-6">
                    <ProfileForm
                        initialData={{
                            nickname: profile?.nickname || '',
                            avatarUrl: profile?.avatar_url
                        }}
                        email={user.email || ''}
                    />

                    {/* 이메일 로그인 사용자만 비밀번호 변경 가능 */}
                    {user.app_metadata.provider === 'email' && (
                        <PasswordForm />
                    )}
                </div>

                <div className="mt-8 text-center pb-8">
                    <DeleteAccountButton isEmailUser={user.app_metadata.provider === 'email'} />
                </div>
            </div>
        </div>
    )
}
