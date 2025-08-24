'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { HelpCircle } from 'lucide-react'
import { useTutorial } from '@/components/TutorialProvider'
import { quickHelpSteps } from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme } from '@/lib/tutorial/tutorial-utils'

export default function HelpFAQ() {
  const { startTutorial } = useTutorial()

  const handleStartQuickHelp = () => {
    const theme = getTutorialTheme()
    startTutorial(quickHelpSteps, theme)
  }

  const faqData = [
    {
      q: "스토어를 삭제하면 관련 데이터도 모두 삭제되나요?",
      a: "네, 스토어를 삭제하면 해당 스토어의 직원, 스케줄, 템플릿 등 모든 관련 데이터가 함께 삭제됩니다. 삭제하기 전에 중요한 데이터를 백업해 두시기 바랍니다."
    },
    {
      q: "직원 정보를 수정할 수 있나요?",
      a: "네, 언제든지 직원 정보를 수정할 수 있습니다. 직원 목록에서 편집 버튼을 클릭하면 정보를 수정할 수 있습니다."
    },
    {
      q: "스케줄 템플릿은 어떻게 저장되나요?",
      a: "스케줄을 작성한 후 저장 버튼을 클릭하면 자동으로 템플릿으로 저장됩니다. 저장된 템플릿은 다른 주차에도 재사용할 수 있습니다."
    },
    {
      q: "여러 스토어를 동시에 관리할 수 있나요?",
      a: "네, 한 계정으로 여러 스토어를 생성하고 관리할 수 있습니다. 각 스토어별로 독립적으로 직원과 스케줄을 관리할 수 있습니다."
    },
    {
      q: "근로계약서는 법적 효력이 있나요?",
      a: "시스템에서 생성되는 근로계약서는 근로기준법에 따른 표준 양식을 기반으로 하지만, 최종적인 법적 효력은 전문가와 상담하시는 것을 권장합니다."
    },
    {
      q: "데이터를 내보낼 수 있나요?",
      a: "현재 버전에서는 PDF 형태로 근로계약서와 급여명세서를 내보낼 수 있습니다. 추후 업데이트에서 더 많은 내보내기 기능을 제공할 예정입니다."
    }
  ]

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {faqData.map((faq, index) => (
          <Card key={index} className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg">{faq.q}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{faq.a}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <HelpCircle className="h-5 w-5" />
            더 궁금한 점이 있으신가요?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 mb-4">
            추가적인 도움이 필요하시거나 문의사항이 있으시면 언제든 연락해 주세요.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-100">
              문의하기
            </Button>
            <Button 
              onClick={handleStartQuickHelp} 
              variant="outline" 
              className="border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              빠른 도움말 보기
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
