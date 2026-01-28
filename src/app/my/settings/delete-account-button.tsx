'use client'

import { useState } from 'react'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { deleteAccount } from './delete-action'
import { useRouter } from 'next/navigation'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function DeleteAccountButton({ isEmailUser }: { isEmailUser: boolean }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [password, setPassword] = useState('')
    const router = useRouter()

    const handleDelete = async () => {
        if (isEmailUser && !password) {
            alert('비밀번호를 입력해주세요.')
            return
        }

        setIsDeleting(true)
        try {
            const result = await deleteAccount(password)
            if (result.success) {
                alert('회원 탈퇴가 완료되었습니다.')
                router.replace('/') // 홈으로 이동
                router.refresh()    // 상태 갱신
            } else {
                alert(result.error || '탈퇴 처리에 실패했습니다.')
            }
        } catch (error) {
            console.error(error)
            alert('오류가 발생했습니다.')
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="text-xs text-slate-400 underline hover:text-slate-500 dark:hover:text-slate-300 transition-colors">
                    회원 탈퇴
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl max-w-xs mx-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">정말 탈퇴하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        계정을 삭제하면 모든 활동 내역과 포인트가 영구적으로 삭제되며, 복구할 수 없습니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {isEmailUser && (
                    <div className="py-2 space-y-2 text-left">
                        <Label htmlFor="delete-password" className="text-xs font-bold text-slate-900 dark:text-slate-100">
                            비밀번호 확인
                        </Label>
                        <Input
                            id="delete-password"
                            type="password"
                            placeholder="비밀번호를 입력하세요"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="h-10 rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                        />
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-700">취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.preventDefault()
                            handleDelete()
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl border-0"
                        disabled={isDeleting}
                    >
                        {isDeleting ? '처리 중...' : '탈퇴하기'}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
