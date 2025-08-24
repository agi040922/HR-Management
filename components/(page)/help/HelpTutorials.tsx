'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Store, 
  Users, 
  Calendar, 
  PlayCircle, 
  ExternalLink, 
  Clock, 
  CheckCircle,
  Rocket
} from 'lucide-react'
import { useTutorial } from '@/components/TutorialProvider'
import {
  fullWorkflowTutorialSteps,
  quickHelpSteps
} from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme, TutorialStorage } from '@/lib/tutorial/tutorial-utils'

export default function HelpTutorials() {
  const { startTutorial } = useTutorial()

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
      path: '/schedule/view'
    }
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tutorialCards.map((tutorial) => (
          <Card key={tutorial.id} className="border-gray-200 hover:shadow-sm transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-sm bg-gray-100">
                  <tutorial.icon className="h-6 w-6 text-gray-600" />
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

      <Card className="border-gray-200">
        <CardHeader>
          <CardTitle>고급 튜토리얼</CardTitle>
          <CardDescription>
            전체 시스템을 종합적으로 이해할 수 있는 완전 가이드
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-sm">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-gray-100 rounded-sm">
                <Rocket className="h-6 w-6 text-gray-600" />
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
              className="bg-blue-600 hover:bg-blue-700"
            >
              시작하기
            </Button>
          </div>

          <div className="pt-4 border-t border-gray-200">
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
    </div>
  )
}
