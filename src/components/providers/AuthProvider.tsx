'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'
// import type { Database } from '@/types/database.types'

// 임시 타입 정의
interface Profile {
    id: string
    role: 'USER' | 'OWNER' | 'ADMIN'
    // 필요한 다른 필드들...
}

interface AuthContextType {
    user: User | null
    session: Session | null
    profile: Profile | null
    isLoading: boolean
    isOwner: boolean
    isAdmin: boolean
    signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [session, setSession] = useState<Session | null>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const initializeAuth = async () => {
            try {
                // 현재 세션 가져오기
                const { data: { session } } = await supabase.auth.getSession()
                setSession(session)
                setUser(session?.user ?? null)

                if (session?.user) {
                    await fetchProfile(session.user.id)
                }
            } catch (error) {
                console.error('Error initializing auth:', error)
            } finally {
                setIsLoading(false)
            }
        }

        initializeAuth()

        // Auth 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            setSession(session)
            setUser(session?.user ?? null)

            if (session?.user) {
                await fetchProfile(session.user.id)
            } else {
                setProfile(null)
            }
            setIsLoading(false)
        })

        return () => {
            subscription.unsubscribe()
        }
    }, [])

    const fetchProfile = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single()

            if (error) {
                console.error('Error fetching profile:', error)
            } else {
                setProfile(data)
            }
        } catch (error) {
            console.error('Network error fetching profile:', error)
        }
    }

    const signOut = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setSession(null)
        setProfile(null)
    }

    const value = {
        user,
        session,
        profile,
        isLoading,
        isOwner: profile?.role === 'OWNER',
        isAdmin: profile?.role === 'ADMIN',
        signOut
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
