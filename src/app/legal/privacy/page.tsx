import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function PrivacyPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">개인정보처리방침</h1>
            <Card>
                <CardHeader>
                    <CardTitle>1. 개인정보의 처리 목적</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <p>
                        FastCampaign(이하 "회사")은 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.
                    </p>
                    <ul className="list-disc pl-5 space-y-1">
                        <li>회원 가입 및 관리</li>
                        <li>재화 또는 서비스 제공 (캠페인 신청, 선정, 포인트 정산 등)</li>
                        <li>고충처리</li>
                    </ul>

                    <h3 className="font-bold text-slate-800 mt-4">2. 개인정보의 처리 및 보유기간</h3>
                    <p>
                        회사는 법령에 따른 개인정보 보유, 이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유, 이용기간 내에서 개인정보를 처리, 보유합니다.
                    </p>

                    {/* ... 더 많은 내용 ... */}
                    <p className="text-slate-400 mt-8">
                        (이 페이지는 예시 내용입니다. 실제 운영 시에는 법적 자문을 거친 내용을 기재해야 합니다.)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
