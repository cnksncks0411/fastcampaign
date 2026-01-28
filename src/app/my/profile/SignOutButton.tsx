'use client'

import { LogOut, ChevronRight } from 'lucide-react'
import { signOut } from './actions'
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

export function SignOutButton() {
    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <button className="w-full">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 p-4 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <div className="h-10 w-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <LogOut className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1 text-left">
                            <span className="font-medium text-red-600 dark:text-red-400 block">로그아웃</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-300" />
                    </div>
                </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 rounded-2xl max-w-xs mx-auto">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-slate-900 dark:text-slate-100">로그아웃 하시겠습니까?</AlertDialogTitle>
                    <AlertDialogDescription>
                        로그아웃하면 로그인 페이지로 이동합니다.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl border-slate-200 dark:border-slate-700">취소</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={() => signOut()}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-xl border-0"
                    >
                        로그아웃
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
