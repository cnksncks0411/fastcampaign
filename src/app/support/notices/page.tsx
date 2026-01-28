import { ArrowLeft, Megaphone, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { BackButton } from '@/components/common/BackButton'

export default async function NoticesPage() {
    const supabase = await createClient()

    const { data: notices } = await supabase
        .from('notices')
        .select('*')
        .order('created_at', { ascending: false })

    return (
        <div className="min-h-dvh bg-slate-50 dark:bg-slate-950">
            <header className="sticky top-0 z-10 border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-800 px-4 py-4 flex items-center gap-3">
                <BackButton />
                <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 ml-2">공지사항</h1>
            </header>

            <div className="p-4 space-y-3">
                {notices && notices.length > 0 ? (
                    notices.map((notice) => (
                        <div key={notice.id} className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800">
                            <details className="group">
                                <summary className="flex items-start gap-3 p-5 cursor-pointer list-none select-none">
                                    <div className="mt-0.5">
                                        {notice.is_important ? (
                                            <Megaphone className="h-5 w-5 text-red-500" />
                                        ) : (
                                            <Megaphone className="h-5 w-5 text-slate-400" />
                                        )}
                                    </div>
                                    <div className="flex-1 text-left">
                                        <div className="flex items-center gap-2 mb-1">
                                            {notice.is_important && (
                                                <Badge variant="destructive" className="h-5 text-[10px] px-1.5">중요</Badge>
                                            )}
                                            <span className="text-xs text-slate-400">
                                                {new Date(notice.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h3 className={`font-medium ${notice.is_important ? 'text-slate-900 dark:text-slate-100 font-bold' : 'text-slate-700 dark:text-slate-200'}`}>
                                            {notice.title}
                                        </h3>
                                    </div>
                                    <ChevronDown className="h-5 w-5 text-slate-300 group-open:rotate-180 transition-transform mt-0.5" />
                                </summary>
                                <div className="px-5 pb-5 pl-11">
                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-800 text-sm text-slate-600 dark:text-slate-400 whitespace-pre-line leading-relaxed">
                                        {notice.content.replace(/\\n/g, '\n')}
                                    </div>
                                </div>
                            </details>
                        </div>
                    ))
                ) : (
                    <div className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 p-12 text-center text-slate-500">
                        <Megaphone className="h-10 w-10 mx-auto text-slate-200 mb-3" />
                        <p>등록된 공지사항이 없습니다.</p>
                    </div>
                )}
            </div>
        </div>
    )
}
