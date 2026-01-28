'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Ticket, Clock, MapPin, QrCode, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { UserTicket } from './actions'

// 탭 컴포넌트
const TABS = [
    { id: 'ALL', label: '전체' },
    { id: 'ACTIVE', label: '사용 가능' },
    { id: 'COMPLETED', label: '완료/취소' },
]

interface TicketListProps {
    initialTickets: UserTicket[]
}

export default function TicketList({ initialTickets = [] }: TicketListProps) {
    const [activeTab, setActiveTab] = useState('ACTIVE')
    const [tickets] = useState<UserTicket[]>(initialTickets)

    const filteredTickets = tickets.filter(t => {
        if (activeTab === 'ALL') return true
        if (activeTab === 'ACTIVE') return t.status === 'CONFIRMED'
        if (activeTab === 'COMPLETED') return t.status !== 'CONFIRMED'
        return true
    })

    return (
        <div className="min-h-dvh bg-slate-50 pb-24">
            {/* 헤더 */}
            <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md px-4 h-14 flex items-center justify-between border-b border-slate-100">
                <h1 className="text-lg font-bold text-slate-900">내 이용권</h1>
                <div className="text-sm font-medium text-slate-500">
                    보유 <span className="text-violet-600 font-bold">{tickets.filter(t => t.status === 'CONFIRMED').length}</span>
                </div>
            </header>

            {/* 탭 네비게이션 */}
            <div className="px-4 py-3 bg-white mb-2">
                <div className="flex p-1 bg-slate-100 rounded-xl">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                                ? 'bg-white text-slate-900 shadow-sm'
                                : 'text-slate-500 hover:text-slate-700'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* 리스트 영역 */}
            <div className="px-4 space-y-4 pt-2">
                {filteredTickets.map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                ))}

                {filteredTickets.length === 0 && (
                    <div className="py-20 text-center text-slate-400">
                        <div className="flex justify-center mb-3">
                            <Ticket className="h-10 w-10 opacity-20" />
                        </div>
                        <p>이용권 내역이 없습니다</p>
                    </div>
                )}
            </div>
        </div>
    )
}

function TicketCard({ ticket }: { ticket: UserTicket }) {
    const isActive = ticket.status === 'CONFIRMED'

    // 상태별 스타일 설정
    const statusStyle = {
        CONFIRMED: { label: '방문 대기', bg: 'bg-violet-100', text: 'text-violet-600', border: 'border-violet-100' },
        CHECKED_IN: { label: '사용 완료', bg: 'bg-emerald-100', text: 'text-emerald-600', border: 'border-emerald-100' },
        CANCELLED_BY_USER: { label: '취소됨', bg: 'bg-slate-100', text: 'text-slate-500', border: 'border-slate-100' },
        NO_SHOW: { label: '기간 만료', bg: 'bg-red-100', text: 'text-red-500', border: 'border-red-100' },
    }[ticket.status] || { label: ticket.status, bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-100' }

    return (
        <Link href={`/my/tickets/${ticket.id}`} className="block group">
            <Card className={`overflow-hidden border-0 shadow-sm transition-all group-active:scale-[0.98] ${isActive ? 'shadow-md shadow-violet-100' : 'opacity-80'}`}>
                <CardContent className="p-0 flex flex-col">
                    {/* 상단 정보 영역 */}
                    <div className="p-5 bg-white relative">
                        <div className="flex justify-between items-start mb-3">
                            <Badge variant="secondary" className={`${statusStyle.bg} ${statusStyle.text} border-0 hover:${statusStyle.bg}`}>
                                {statusStyle.label}
                            </Badge>
                            {isActive && (
                                <span className="text-xs font-bold text-red-500 flex items-center gap-1">
                                    <Clock className="h-3 w-3" /> D-2
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-slate-900 mb-1">{ticket.campaign.store.name}</h3>
                        <p className="text-violet-600 font-bold mb-4">{ticket.campaign.benefit_text}</p>

                        <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-50 p-2.5 rounded-lg">
                            <MapPin className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{ticket.campaign.store.address_text}</span>
                        </div>

                        {/* 펀치홀 효과 (좌우 구멍) */}
                        <div className="absolute -left-3 bottom-[-12px] w-6 h-6 bg-slate-50 rounded-full z-10" />
                        <div className="absolute -right-3 bottom-[-12px] w-6 h-6 bg-slate-50 rounded-full z-10" />
                    </div>

                    {/* 절취선 */}
                    <div className="h-[1px] w-full bg-slate-50 relative border-t border-dashed border-slate-200" />

                    {/* 하단 액션 영역 */}
                    <div className="px-5 py-4 bg-white flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">
                            {isActive ? '매장에 방문하여 QR을 보여주세요' : '사용이 완료된 이용권입니다'}
                        </span>

                        {isActive ? (
                            <div className="bg-slate-900 text-white h-9 px-4 rounded-xl shadow-lg shadow-slate-200 flex items-center text-sm font-medium">
                                <QrCode className="h-4 w-4 mr-1.5" />
                                QR 체크인
                            </div>
                        ) : (
                            <div className="text-sm font-medium text-slate-400">
                                상세보기
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
