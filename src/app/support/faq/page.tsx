import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { BackButton } from '@/components/common/BackButton'

export default function FAQPage() {
    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 ml-2">자주 묻는 질문</h1>
            </header>
            <div className="p-4 space-y-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold mb-2 dark:text-slate-100">Q. 이용권은 어떻게 사용하나요?</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">매장에 방문하여 '내 이용권' 탭의 QR 코드를 사장님께 보여드리면 됩니다.</p>
                </div>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-100 dark:border-slate-800">
                    <h3 className="font-bold mb-2 dark:text-slate-100">Q. 신청을 취소하고 싶어요.</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">이용권 상세 화면 하단의 '신청 취소하기' 버튼을 통해 즉시 취소할 수 있습니다.</p>
                </div>
            </div>
        </div>
    )
}
