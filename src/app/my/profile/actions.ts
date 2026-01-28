'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function signOut() {
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
}

export async function toggleNotification(userId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
        return { error: '로그인이 필요합니다' }
    }

    const { data: profile } = await supabase
        .from('profiles')
        .select('is_notification_on')
        .eq('id', user.id)
        .single()

    if (!profile) return { error: '프로필을 찾을 수 없습니다' }

    const newState = !profile.is_notification_on

    const { error } = await supabase
        .from('profiles')
        .update({ is_notification_on: newState })
        .eq('id', user.id)

    if (error) {
        console.error('Update Profile Error:', error)
        return { error: error.message || '설정 변경 실패' }
    }

    revalidatePath('/my/profile')
    return { success: true, newState }
}
