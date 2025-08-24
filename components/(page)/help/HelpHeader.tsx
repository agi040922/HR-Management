'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { HelpCircle, PlayCircle, Rocket, Lightbulb } from 'lucide-react'
import { useTutorial } from '@/components/TutorialProvider'
import { fullWorkflowTutorialSteps, quickHelpSteps } from '@/lib/tutorial/tutorial-steps'
import { getTutorialTheme } from '@/lib/tutorial/tutorial-utils'

interface HelpHeaderProps {
  activeSection: string
  onSectionChange: (section: string) => void
}

export default function HelpHeader({ activeSection, onSectionChange }: HelpHeaderProps) {
  const { startTutorial } = useTutorial()
  const [showHelp, setShowHelp] = useState(false)

  const handleStartTutorial = (tutorialType: string) => {
    const theme = getTutorialTheme()
    
    switch (tutorialType) {
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

  const sections = [
    { value: 'overview', label: '개요' },
    { value: 'tutorials', label: '튜토리얼' },
    { value: 'features', label: '기능 소개' },
    { value: 'faq', label: '자주 묻는 질문' }
  ]

  return (
    <div className="mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">HR 관리 시스템 도움말</h1>
          
          {/* 도움말 툴팁 */}
          <div className="relative">
            <button
              onClick={() => setShowHelp(!showHelp)}
              className={`p-1 transition-colors rounded-full ${
                showHelp 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              title="도움말"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            {showHelp && (
              <>
                <div 
                  className="fixed inset-0 z-40"
                  onClick={() => setShowHelp(false)}
                />
                <div className="absolute top-8 left-0 z-50 w-80 p-4 bg-white rounded-sm border shadow-lg animate-in fade-in-0 zoom-in-95 duration-200">
                  <div className="text-sm text-gray-600">
                    <p className="font-medium mb-2">도움말 페이지 사용법:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• 섹션을 선택하여 원하는 정보를 확인하세요</li>
                      <li>• 튜토리얼로 단계별 학습이 가능합니다</li>
                      <li>• 빠른 도움말로 즉시 시작할 수 있습니다</li>
                      <li>• FAQ에서 자주 묻는 질문을 확인하세요</li>
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 섹션 선택 드롭다운 */}
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">
              섹션:
            </label>
            <Select value={activeSection} onValueChange={onSectionChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="선택하세요" />
              </SelectTrigger>
              <SelectContent>
                {sections.map((section) => (
                  <SelectItem key={section.value} value={section.value}>
                    {section.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* 빠른 시작 버튼들 */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <Button
            onClick={() => handleStartTutorial('full')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
            size="sm"
          >
            <Rocket className="h-4 w-4" />
            전체 워크플로우 가이드
          </Button>
          
          <Button
            onClick={() => handleStartTutorial('quick')}
            variant="outline"
            className="flex items-center gap-2"
            size="sm"
          >
            <Lightbulb className="h-4 w-4" />
            빠른 도움말
          </Button>

          <Button
            onClick={() => handleStartTutorial('quick')}
            className="flex items-center gap-2 px-3 py-2 text-blue-600 border border-blue-300 rounded-sm hover:bg-blue-50 transition-colors text-sm"
          >
            <PlayCircle className="h-4 w-4" />
            튜토리얼 시작
          </Button>
        </div>
      </div>
      
      <p className="text-gray-600 text-sm">
        단계별 가이드로 시스템을 완벽하게 활용해보세요
      </p>
    </div>
  )
}
