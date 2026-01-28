import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function TermsPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <h1 className="text-2xl font-bold mb-6">서비스 이용약관</h1>
            <Card>
                <CardHeader>
                    <CardTitle>제1조 (목적)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <p>
                        본 약관은 FastCampaign(이하 "회사")이 제공하는 위치기반 실시간 리뷰 캠페인 서비스(이하 "서비스")의 이용조건 및 절차, 회사와 회원의 권리, 의무 및 책임사항 등 기타 필요한 사항을 규정함을 목적으로 합니다.
                    </p>
                    <h3 className="font-bold text-slate-800 mt-4">제2조 (용어의 정의)</h3>
                    <p>
                        1. "서비스"라 함은 구현되는 단말기(PC, TV, 휴대형단말기 등의 각종 유무선 장치를 포함)와 상관없이 회원이 이용할 수 있는 FastCampaign 및 FastCampaign 관련 제반 서비스를 의미합니다.<br />
                        2. "회원"이라 함은 회사의 "서비스"에 접속하여 이 약관에 따라 "회사"와 이용계약을 체결하고 "회사"가 제공하는 "서비스"를 이용하는 고객을 말합니다.
                    </p>
                    {/* ... 더 많은 내용 ... */}
                    <p className="text-slate-400 mt-8">
                        (이 페이지는 예시 약관 내용입니다. 실제 운영 시에는 법적 자문을 거친 약관 내용을 기재해야 합니다.)
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
