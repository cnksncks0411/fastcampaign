'use client'

import React from 'react'
import Link from 'next/link'
import { Ticket, MapPin, CheckCircle, XCircle, AlertCircle, ChevronRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserTicket } from './actions'

interface TicketHistoryListProps {
    tickets: UserTicket[]
}

const statusConfig: Record<string, { label: string; color: string; darkColor: string; icon: React.ReactNode }> = {
    CHECKED_IN: {
        label: '사용 완료',
        color: 'bg-emerald-100 text-emerald-700',
        darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: <CheckCircle className="h-4 w-4" />
    },
    USED: {
        label: '사용 완료',
        color: 'bg-emerald-100 text-emerald-700',
        darkColor: 'dark:bg-emerald-900/30 dark:text-emerald-400',
        icon: <CheckCircle className="h-4 w-4" />
    },
    CANCELLED_BY_USER: {
        label: '취소됨',
        color: 'bg-slate-100 text-slate-600',
        darkColor: 'dark:bg-slate-800 dark:text-slate-400',
        icon: <XCircle className="h-4 w-4" />
    },
    NO_SHOW: {
        label: '기간 만료',
        color: 'bg-red-100 text-red-700',
        darkColor: 'dark:bg-red-900/30 dark:text-red-400',
        icon: <AlertCircle className="h-4 w-4" />
    },
}

export function TicketHistoryList({ tickets }: TicketHistoryListProps) {
    if (tickets.length === 0) {
        return (
            <div className="py-10 text-center text-slate-400 dark:text-slate-500 text-sm">
                지난 이용권 내역이 없습니다
            </div>
        )
    }

    return (
        <div className="space-y-4 pb-24">
            {tickets.map(ticket => {
                const config = statusConfig[ticket.status] || { label: ticket.status, color: 'bg-gray-100', darkColor: 'dark:bg-slate-800', icon: null }

                return (
                    <Card key={ticket.id} className="overflow-hidden border-0 shadow-sm opacity-80 dark:bg-slate-900">
                        <CardContent className="p-0 flex">
                            {/* 왼쪽: 아이콘 영역 */}
                            <div className="w-20 bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border-r border-slate-100 dark:border-slate-700">
                                <div className={`p-2 rounded-full ${config.color} ${config.darkColor} bg-opacity-20`}>
                                    {config.icon}
                                </div>
                                <span className={`text-[10px] font-bold mt-1.5 ${config.color.split(' ')[1]} ${config.darkColor.split(' ')[1]}`}>
                                    {config.label}
                                </span>
                            </div>

                            {/* 오른쪽: 정보 영역 */}
                            <div className="flex-1 p-4">
                                <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                                    {ticket.campaign.store.name}
                                </h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                    {ticket.campaign.benefit_text}
                                </p>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="flex items-center text-xs text-slate-400 dark:text-slate-500">
                                        <MapPin className="h-3 w-3 mr-1" />
                                        {ticket.campaign.store.address_text.split(' ').slice(0, 2).join(' ')}
                                    </div>
                                    <span className="text-xs text-slate-300 dark:text-slate-600">
                                        {new Date(ticket.confirmed_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )
            })}
        </div>
    )
}
