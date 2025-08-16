"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator" 
import { 
  Home,
  Plus,
  LayoutDashboard,
  Users,
  BarChart3,
  FolderOpen,
  UserCheck,
  FileText,
  Database,
  ClipboardList,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Search,
  MoreHorizontal,
  Building2,
  Calendar,
  Calculator,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Clock,
  DollarSign,
  Archive,
  AlertTriangle
} from "lucide-react"

// 디자인 시스템 색상 상수
const DESIGN_COLORS = {
  primary: {
    main: '#1A73E8',
    light: '#4285F4',
    dark: '#1557B0',
    text: '#FFFFFF',
    hover: '#185ABC'
  },
  accent: {
    orange: '#FF6B35',
    orangeHover: '#E55A2B'
  },
  text: {
    primary: '#202124',
    secondary: '#5F6368',
    muted: '#9AA0A6'
  },
  background: {
    hover: '#F8F9FA',
    selected: '#E8F0FE',
    border: '#E0E0E0'
  }
}

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  isActive?: boolean
}

interface SidebarSection {
  title?: string
  icon?: React.ComponentType<{ className?: string }>
  items: SidebarItem[]
  isCollapsible?: boolean
}

interface SidebarProps {
  isMobile?: boolean
  onMobileClose?: () => void
  onCollapse?: (isCollapsed: boolean) => void
}

export function Sidebar({ isMobile = false, onMobileClose, onCollapse }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [expandedSections, setExpandedSections] = useState<{[key: string]: boolean}>({
    '근무관리': true,
    '급여대장': true,
    '문서관리': true
  })

  const mainSections: SidebarSection[] = [
    {
      items: [
        {
          title: "대시보드",
          href: "/components/dashboard",
          icon: LayoutDashboard
        }
      ]
    },
    {
      title: "근무관리",
      icon: Clock,
      isCollapsible: true,
      items: [
        {
          title: "스케줄 관리",
          href: "/schedule/view",
          icon: Calendar
        },
        {
          title: "직원 관리",
          href: "/employees",
          icon: Users
        },
        {
          title: "팀 관리",
          href: "/team",
          icon: UserCheck
        },
        {
          title: "예외사항 관리",
          href: "/schedule/exceptions",
          icon: AlertTriangle
        }
      ]
    },
    {
      title: "급여대장",
      icon: DollarSign,
      isCollapsible: true,
      items: [
        {
          title: "급여 계산",
          href: "/payroll",
          icon: Calculator
        },
        {
          title: "급여 분석",
          href: "/analytics",
          icon: BarChart3
        },
        {
          title: "임금 최적화",
          href: "/schedule/optimization",
          icon: TrendingUp
        }
      ]
    }
  ]

  const documentSections: SidebarSection[] = [
    {
      title: "문서관리",
      icon: Archive,
      isCollapsible: true,
      items: [
        {
          title: "근로계약서",
          href: "/test/labor-contract",
          icon: FileText
        },
        {
          title: "문서",
          href: "/documents",
          icon: FileText
        },
        {
          title: "데이터 라이브러리",
          href: "/data-library",
          icon: Database
        },
        {
          title: "보고서",
          href: "/reports",
          icon: ClipboardList
        },
        {
          title: "급여 명세서",
          href: "/payroll",
          icon: FileSpreadsheet
        },
        {
          title: "더보기",
          href: "/more",
          icon: MoreHorizontal
        }
      ]
    }
  ]

  const bottomSections: SidebarSection[] = [
    {
      items: [
        {
          title: "설정",
          href: "/settings",
          icon: Settings
        },
        {
          title: "도움말",
          href: "/help",
          icon: HelpCircle
        },
        {
          title: "검색",
          href: "/search",
          icon: Search
        }
      ]
    }
  ]

  const handleLinkClick = (href: string) => {
    // 모바일에서 링크 클릭 시 사이드바 닫기
    if (isMobile && onMobileClose) {
      onMobileClose()
    }
  }

  const renderSidebarItem = (item: SidebarItem, isSubItem = false) => {
    const isActive = pathname === item.href || item.isActive
    const Icon = item.icon

    if (item.title === "빠른 생성") {
      return (
        <Button
          key={item.href}
          asChild
          className={cn(
            "mb-3 transition-all duration-300 font-medium",
            isCollapsed ? "w-12 h-12 p-0 justify-center" : "w-full justify-start h-10"
          )}
          style={{
            backgroundColor: DESIGN_COLORS.accent.orange,
            color: DESIGN_COLORS.primary.text,
            borderRadius: '6px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_COLORS.accent.orangeHover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = DESIGN_COLORS.accent.orange
          }}
          title={isCollapsed ? item.title : undefined}
        >
          <Link 
            href={item.href}
            onClick={() => handleLinkClick(item.href)}
          >
            <Icon className={cn("h-4 w-4", !isCollapsed && "mr-2")} />
            {!isCollapsed && item.title}
          </Link>
        </Button>
      )
    }

    return (
      <div key={item.href} className="relative">
        {/* 연결선 */}
        {!isCollapsed && isSubItem && (
          <div 
            className="absolute left-2 top-0 bottom-0 w-px"
            style={{ backgroundColor: DESIGN_COLORS.background.border }}
          />
        )}
        
        <Link
          href={item.href}
          onClick={() => handleLinkClick(item.href)}
          className={cn(
            "flex items-center text-sm font-medium transition-all duration-150 cursor-pointer relative",
            isCollapsed ? "justify-center px-2 py-2" : isSubItem ? "gap-2 px-2 py-1.5 ml-4" : "gap-2 px-2 py-1.5",
            isActive 
              ? "text-white rounded-md" 
              : "text-gray-600 hover:text-gray-900 rounded-md"
          )}
          style={{
            backgroundColor: isActive ? DESIGN_COLORS.primary.main : 'transparent',
            borderRadius: '6px',
            fontSize: '13px'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = DESIGN_COLORS.background.hover
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          }}
          title={isCollapsed ? item.title : undefined}
        >
          {/* 하위 항목 연결점 */}
          {!isCollapsed && isSubItem && (
            <div 
              className="absolute left-2 top-1/2 w-2 h-px"
              style={{ 
                backgroundColor: DESIGN_COLORS.background.border,
                transform: 'translateY(-50%)'
              }}
            />
          )}
          
          <Icon className={cn("h-4 w-4 flex-shrink-0", isSubItem && !isCollapsed && "ml-2")} />
          {!isCollapsed && (
            <>
              <span className="flex-1">{item.title}</span>
              {item.badge && (
                <Badge 
                  variant="secondary" 
                  className="ml-auto text-xs"
                  style={{
                    backgroundColor: DESIGN_COLORS.background.selected,
                    color: DESIGN_COLORS.text.secondary,
                    borderRadius: '10px',
                    fontSize: '10px',
                    fontWeight: '500',
                    height: '16px',
                    minWidth: '16px'
                  }}
                >
                  {item.badge}
                </Badge>
              )}
            </>
          )}
        </Link>
      </div>
    )
  }

  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }))
  }

  const renderSection = (section: SidebarSection, showSeparator = false) => (
    <div key={section.title || 'main-section'}>
      {showSeparator && (
        <div 
          style={{
            height: '1px',
            backgroundColor: DESIGN_COLORS.background.border,
            margin: '12px 0'
          }}
        />
      )}
      
      {/* 섹션 제목 (토글 가능한 경우) */}
      {section.title && section.isCollapsible && (
        <button
          onClick={() => toggleSection(section.title!)}
          className={cn(
            "flex items-center w-full px-2 py-1.5 text-left transition-colors duration-150 hover:bg-gray-100 rounded-md mb-1",
            isCollapsed && "justify-center px-2"
          )}
          style={{
            color: DESIGN_COLORS.text.primary,
            fontSize: '14px',
            fontWeight: '600'
          }}
          title={isCollapsed ? section.title : undefined}
        >
          {!isCollapsed && section.icon && (
            <section.icon className="h-4 w-4 mr-2 flex-shrink-0" />
          )}
          {isCollapsed && section.icon && (
            <section.icon className="h-4 w-4" />
          )}
          {!isCollapsed && (
            <>
              <span className="flex-1">{section.title}</span>
              {expandedSections[section.title] ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
            </>
          )}
        </button>
      )}
      
      {/* 메뉴 아이템들 */}
      {(!section.isCollapsible || !section.title || expandedSections[section.title]) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', marginBottom: '8px' }}>
          {section.items.map((item, index) => renderSidebarItem(item, section.isCollapsible))}
        </div>
      )}
    </div>
  )

  return (
    <div 
      className="flex flex-col transition-all duration-300 bg-white shadow-lg"
      style={{
        width: isCollapsed && !isMobile ? '72px' : '220px',
        height: '100vh',
        backgroundColor: '#FFFFFF',
        borderRight: `1px solid ${DESIGN_COLORS.background.border}`,
        zIndex: 45
      }}
    >
      {/* 헤더 영역 */}
      <div className="flex items-center justify-between p-3">
        {!isCollapsed && (
          <span 
            className="font-semibold"
            style={{ 
              color: DESIGN_COLORS.text.primary,
              fontSize: '16px',
              fontWeight: '600'
            }}
          >
            인사관리
          </span>
        )}
        <button
          onClick={() => {
            const newCollapsedState = !isCollapsed
            setIsCollapsed(newCollapsedState)
            onCollapse?.(newCollapsedState)
          }}
          className="p-1 rounded-md transition-colors duration-150 hover:bg-gray-100"
          style={{
            color: DESIGN_COLORS.text.secondary
          }}
          title={isCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto" style={{ padding: '12px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* 대시보드 */}
          {mainSections[0] && renderSection(mainSections[0])}
          
          {/* 근무관리 */}
          {mainSections[1] && renderSection(mainSections[1], true)}
          
          {/* 급여대장 */}
          {mainSections[2] && renderSection(mainSections[2], true)}
          
          {/* 문서관리 */}
          {documentSections.map((section, index) => 
            renderSection(section, true)
          )}
        </div>
      </div>

      {/* 하단 섹션 */}
      <div 
        style={{
          borderTop: `1px solid ${DESIGN_COLORS.background.border}`,
          padding: '12px'
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
          {bottomSections[0]?.items.map((item, index) => renderSidebarItem(item, false))}
        </div>
        
        {/* 사용자 정보 */}
        <div 
          style={{
            height: '1px',
            backgroundColor: DESIGN_COLORS.background.border,
            margin: '16px 0'
          }}
        />
        <div 
          className={cn(
            "flex items-center px-3 py-2",
            isCollapsed ? "justify-center" : "gap-3"
          )}
          style={{ borderRadius: '8px' }}
        >
          <div 
            className="flex items-center justify-center text-sm font-medium"
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: DESIGN_COLORS.primary.main,
              color: DESIGN_COLORS.primary.text,
              fontSize: '14px',
              fontWeight: '600'
            }}
            title={isCollapsed ? "관리자 (admin@company.com)" : undefined}
          >
            관
          </div>
          {!isCollapsed && (
            <div className="flex-1">
              <div 
                className="font-medium"
                style={{
                  fontSize: '14px',
                  fontWeight: '500',
                  color: DESIGN_COLORS.text.primary,
                  lineHeight: '20px'
                }}
              >
                관리자
              </div>
              <div 
                style={{
                  fontSize: '12px',
                  color: DESIGN_COLORS.text.muted,
                  lineHeight: '16px'
                }}
              >
                admin@company.com
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
