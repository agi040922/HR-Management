"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
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
  TrendingUp
} from "lucide-react"

interface SidebarItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: string
  isActive?: boolean
}

interface SidebarSection {
  items: SidebarItem[]
}

export function Sidebar() {
  const pathname = usePathname()

  const mainSections: SidebarSection[] = [
    {
      items: [
        {
          title: "빠른 생성",
          href: "/quick-create",
          icon: Plus,
          isActive: true
        }
      ]
    },
    {
      items: [
        {
          title: "대시보드",
          href: "/components/dashboard",
          icon: LayoutDashboard
        },
        {
          title: "스케줄 관리",
          href: "/schedule",
          icon: Calendar
        },
        {
          title: "급여 계산",
          href: "/payroll",
          icon: Calculator
        },
        {
          title: "임금 최적화",
          href: "/optimization",
          icon: TrendingUp
        },
        {
          title: "직원 관리",
          href: "/employees",
          icon: Users
        },
        {
          title: "급여 분석",
          href: "/analytics",
          icon: BarChart3
        },
        {
          title: "프로젝트",
          href: "/projects",
          icon: FolderOpen
        },
        {
          title: "팀 관리",
          href: "/team",
          icon: UserCheck
        }
      ]
    }
  ]

  const documentSections: SidebarSection[] = [
    {
      items: [
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

  const renderSidebarItem = (item: SidebarItem) => {
    const isActive = pathname === item.href || item.isActive
    const Icon = item.icon

    if (item.title === "빠른 생성") {
      return (
        <Button
          key={item.href}
          asChild
          className="w-full justify-start h-12 bg-orange-500 hover:bg-orange-600 text-white mb-4"
        >
          <Link href={item.href}>
            <Icon className="mr-3 h-5 w-5" />
            {item.title}
          </Link>
        </Button>
      )
    }

    return (
      <Link
        key={item.href}
        href={item.href}
        className={cn(
          "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground",
          isActive 
            ? "bg-primary text-primary-foreground" 
            : "text-muted-foreground"
        )}
      >
        <Icon className="h-4 w-4" />
        {item.title}
        {item.badge && (
          <Badge variant="secondary" className="ml-auto">
            {item.badge}
          </Badge>
        )}
      </Link>
    )
  }

  const renderSection = (section: SidebarSection, showSeparator = false) => (
    <div key={Math.random()}>
      {showSeparator && <Separator className="my-4" />}
      <div className="space-y-1">
        {section.items.map(renderSidebarItem)}
      </div>
    </div>
  )

  return (
    <div className="flex h-full w-64 flex-col border-r bg-background">
      {/* 헤더 */}
      <div className="flex h-14 items-center border-b px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-6 w-6" />
          <span>HR 관리 시스템</span>
        </Link>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 overflow-auto p-4">
        <div className="space-y-4">
          {/* 빠른 생성 버튼 */}
          {mainSections[0] && renderSection(mainSections[0])}
          
          {/* 메인 네비게이션 */}
          {mainSections[1] && renderSection(mainSections[1])}
          
          {/* 문서 섹션 */}
          {documentSections.map((section, index) => 
            renderSection(section, index === 0)
          )}
        </div>
      </div>

      {/* 하단 섹션 */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {bottomSections[0]?.items.map(renderSidebarItem)}
        </div>
        
        {/* 사용자 정보 */}
        <Separator className="my-4" />
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
            관
          </div>
          <div className="flex-1 text-sm">
            <div className="font-medium">관리자</div>
            <div className="text-muted-foreground">admin@company.com</div>
          </div>
        </div>
      </div>
    </div>
  )
}
