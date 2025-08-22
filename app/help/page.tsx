'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Book, 
  PlayCircle, 
  Store, 
  Users, 
  Calendar, 
  HelpCircle, 
  Rocket,
  CheckCircle,
  ArrowRight,
  ExternalLink,
  Star,
  Clock,
  Lightbulb,
  Settings,
  Target
} from 'lucide-react'
import { useTutorial } from '@/components/TutorialProvider'
import {
  storesTutorialSteps,
  employeesTutorialSteps,
  scheduleTutorialSteps,
  fullWorkflowTutorialSteps,
  quickHelpSteps
} from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme, TutorialStorage } from '@/lib/tutorial/tutorial-utils'

export default function HelpPage() {
  const { startTutorial } = useTutorial()
  const [activeSection, setActiveSection] = useState('overview')

  // 각 페이지별 튜토리얼 시작
  const handleStartTutorial = (tutorialType: string) => {
    const theme = getTutorialTheme()
    
    switch (tutorialType) {
      case 'stores':
        window.location.href = '/stores?tutorial=true'
        break
      case 'employees':
        window.location.href = '/employees?tutorial=true'
        break
      case 'schedule':
        window.location.href = '/schedule/view?tutorial=true'
        break
      case 'full':
        startTutorial(fullWorkflowTutorialSteps, theme)
        break
      case 'quick':
        startTutorial(quickHelpSteps, theme)
        break
      default:
        break
    }
  }

  // 튜토리얼 완료 상태 확인
  const isCompleted = (tutorialName: string) => {
    return TutorialStorage.isTutorialCompleted(tutorialName)
  }

  // 튜토리얼 초기화
  const resetAllTutorials = () => {
    if (confirm('모든 튜토리얼 진행 상태를 초기화하시겠습니까?')) {
      TutorialStorage.resetAllTutorials()
      alert('튜토리얼 상태가 초기화되었습니다.')
    }
  }

  const tutorialCards = [
    {
      id: 'stores',
      title: '스토어 관리',
      description: '새로운 스토어를 생성하고 관리하는 방법을 배워보세요',
      icon: Store,
      steps: 6,
      duration: '3-4분',
      difficulty: '쉬움',
      color: 'bg-blue-500',
      path: '/stores'
    },
    {
      id: 'employees',
      title: '직원 관리',
      description: '직원을 등록하고 정보를 관리하는 방법을 익혀보세요',
      icon: Users,
      steps: 9,
      duration: '5-6분',
      difficulty: '보통',
      color: 'bg-green-500',
      path: '/employees'
    },
    {
      id: 'schedule',
      title: '스케줄 관리',
      description: '직원 스케줄을 생성하고 관리하는 방법을 알아보세요',
      icon: Calendar,
      steps: 7,
      duration: '4-5분',
      difficulty: '보통',
      color: 'bg-purple-500',
      path: '/schedule/view'
    }
  ]

  const features = [
    {
      title: '드릴다운 뷰',
      description: '스토어와 직원 정보를 상세하게 확인할 수 있는 확장 가능한 테이블 뷰',
      icon: Target
    },
    {
      title: '실시간 필터링',
      description: '다양한 조건으로 데이터를 실시간으로 필터링하고 정렬',
      icon: Settings
    },
    {
      title: '근로계약서 연동',
      description: '법정 서류를 완비할 수 있는 근로계약서 작성 및 관리',
      icon: Book
    },
    {
      title: '스케줄 템플릿',
      description: '주간 스케줄을 템플릿으로 저장하고 재사용 가능',
      icon: Clock
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl">
              <HelpCircle className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            HR 관리 시스템 도움말
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            단계별 가이드로 시스템을 완벽하게 활용해보세요
          </p>
          
          {/* 빠른 시작 버튼들 */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              onClick={() => handleStartTutorial('full')}
              size="lg"
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Rocket className="h-5 w-5" />
              전체 워크플로우 가이드
            </Button>
            
            <Button
              onClick={() => handleStartTutorial('quick')}
              variant="outline"
              size="lg"
              className="flex items-center gap-2"
            >
              <Lightbulb className="h-5 w-5" />
              빠른 도움말
            </Button>
          </div>
        </div>

        <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">개요</TabsTrigger>
            <TabsTrigger value="tutorials">튜토리얼</TabsTrigger>
            <TabsTrigger value="features">기능 소개</TabsTrigger>
            <TabsTrigger value="faq">자주 묻는 질문</TabsTrigger>
          </TabsList>

          {/* 개요 탭 */}
          <TabsContent value="overview" className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-yellow-500" />
                  시작하기 전에
                </CardTitle>
                <CardDescription>
                  HR 관리 시스템의 기본 워크플로우를 이해하고 시작해보세요
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <Store className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">1. 스토어 생성</h3>
                      <p className="text-gray-600 text-sm">
                        먼저 매장 정보를 등록하고 운영시간을 설정하세요
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">2. 직원 등록</h3>
                      <p className="text-gray-600 text-sm">
                        스토어에 소속될 직원들을 등록하고 정보를 관리하세요
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">3. 스케줄 관리</h3>
                      <p className="text-gray-600 text-sm">
                        등록된 직원들의 주간 근무 스케줄을 배치하세요
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-800">💡 팁</h4>
                      <p className="text-yellow-700 text-sm mt-1">
                        각 단계별로 제공되는 튜토리얼을 따라하시면 더 쉽게 익힐 수 있습니다. 
                        오른쪽 상단의 도움말 아이콘(?)을 클릭하면 해당 페이지의 도움말을 확인할 수 있어요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 튜토리얼 탭 */}
          <TabsContent value="tutorials" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tutorialCards.map((tutorial) => (
                <Card key={tutorial.id} className="relative overflow-hidden hover:shadow-lg transition-shadow">
                  <div className={`absolute top-0 left-0 right-0 h-2 ${tutorial.color}`} />
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${tutorial.color.replace('bg-', 'bg-').replace('-500', '-100')}`}>
                        <tutorial.icon className={`h-6 w-6 ${tutorial.color.replace('bg-', 'text-')}`} />
                      </div>
                      {isCompleted(tutorial.id) && (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      )}
                    </div>
                    <CardTitle className="text-lg">{tutorial.title}</CardTitle>
                    <CardDescription>{tutorial.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="h-4 w-4" />
                        {tutorial.steps}단계
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {tutorial.duration}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">
                        {tutorial.difficulty}
                      </Badge>
                      {isCompleted(tutorial.id) && (
                        <Badge variant="default" className="text-xs bg-green-100 text-green-800">
                          완료
                        </Badge>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleStartTutorial(tutorial.id)}
                        className="flex-1 flex items-center gap-2"
                        size="sm"
                      >
                        <PlayCircle className="h-4 w-4" />
                        튜토리얼 시작
                      </Button>
                      <Button
                        onClick={() => window.location.href = tutorial.path}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>고급 튜토리얼</CardTitle>
                <CardDescription>
                  전체 시스템을 종합적으로 이해할 수 있는 완전 가이드
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
                      <Rocket className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">전체 워크플로우 가이드</h3>
                      <p className="text-sm text-gray-600">
                        스토어 생성부터 스케줄 관리까지 전체 과정을 한 번에 학습
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                        <span>• 22단계</span>
                        <span>• 15-20분</span>
                        <span>• 종합 과정</span>
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => handleStartTutorial('full')}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                  >
                    시작하기
                  </Button>
                </div>

                <div className="pt-4 border-t">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">튜토리얼 진행 상태 초기화</h4>
                      <p className="text-sm text-gray-600">
                        모든 튜토리얼을 처음부터 다시 진행하고 싶다면 초기화할 수 있습니다
                      </p>
                    </div>
                    <Button onClick={resetAllTutorials} variant="outline" size="sm">
                      초기화
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* 기능 소개 탭 */}
          <TabsContent value="features" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {features.map((feature, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <feature.icon className="h-5 w-5 text-blue-600" />
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card>
              <CardHeader>
                <CardTitle>시스템 특징</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      사용자 친화적 인터페이스
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">
                      직관적인 UI/UX로 누구나 쉽게 사용할 수 있습니다
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      실시간 데이터 동기화
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">
                      모든 데이터는 실시간으로 저장되고 동기화됩니다
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      반응형 디자인
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">
                      데스크톱, 태블릿, 모바일 모든 기기에서 최적화된 경험
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      안전한 데이터 보호
                    </h4>
                    <p className="text-sm text-gray-600 ml-6">
                      강력한 보안 시스템으로 개인정보를 안전하게 보호
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* FAQ 탭 */}
          <TabsContent value="faq" className="space-y-6">
            <div className="space-y-4">
              {[
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
              ].map((faq, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.q}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{faq.a}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="bg-blue-50 border-blue-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-800">
                  <HelpCircle className="h-5 w-5" />
                  더 궁금한 점이 있으신가요?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-blue-700 mb-4">
                  추가적인 도움이 필요하시거나 문의사항이 있으시면 언제든 연락해 주세요.
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                    문의하기
                  </Button>
                  <Button 
                    onClick={() => handleStartTutorial('quick')} 
                    variant="outline" 
                    className="border-blue-300 text-blue-700 hover:bg-blue-100"
                  >
                    빠른 도움말 보기
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
