import type { TutorialStep } from '@/components/TutorialProvider';

// 스토어 관리 페이지 튜토리얼
export const storesTutorialSteps: TutorialStep[] = [
  {
    element: 'body',
    popover: {
      title: '🏪 스토어 관리 시작하기',
      description: 'HR 관리 시스템에 오신 것을 환영합니다! 먼저 스토어를 생성하여 시작해보겠습니다.',
      side: 'bottom',
      align: 'center',
      showButtons: ['next', 'close'],
    }
  },
  {
    element: '[data-tutorial="stores-header"]',
    popover: {
      title: '스토어 관리 메뉴',
      description: '여기는 스토어 관리 페이지입니다. 여러 매장을 관리할 수 있으며, 각 스토어별로 직원과 스케줄을 관리할 수 있습니다.',
      side: 'bottom',
      align: 'start',
    }
  },
  {
    element: '[data-tutorial="new-store-button"]',
    popover: {
      title: '새 스토어 생성',
      description: '이 버튼을 클릭하여 새로운 스토어를 생성할 수 있습니다. 스토어 이름, 운영시간, 시간 단위 등을 설정할 수 있습니다.',
      side: 'left',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="store-filters"]',
    popover: {
      title: '필터 및 정렬',
      description: '드롭다운을 통해 스토어를 정렬하고 필터링할 수 있습니다. 생성순, 이름순, 직원수순으로 정렬하거나 특정 조건으로 필터링할 수 있습니다.',
      side: 'bottom',
      align: 'start',
    }
  },
  {
    element: '[data-tutorial="store-table"]',
    popover: {
      title: '스토어 목록 및 드릴다운',
      description: '생성된 스토어들이 여기에 표시됩니다. 각 스토어를 클릭하면 해당 스토어의 템플릿과 직원 정보를 드릴다운 방식으로 확인할 수 있습니다.',
      side: 'top',
      align: 'center',
    }
  },
  {
    popover: {
      title: '다음 단계: 직원 등록',
      description: '스토어를 생성했다면, 이제 직원을 등록해보겠습니다. 직원 관리 페이지로 이동하겠습니다.',
      side: 'bottom',
      showButtons: ['next', 'close'],
    }
  }
];

// 직원 관리 페이지 튜토리얼
export const employeesTutorialSteps: TutorialStep[] = [
  {
    element: 'body',
    popover: {
      title: '👥 직원 관리',
      description: '이제 직원을 등록하고 관리하는 방법을 알아보겠습니다.',
      side: 'bottom',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="employees-header"]',
    popover: {
      title: '직원 관리 페이지',
      description: '스토어별 직원을 등록하고 관리할 수 있는 페이지입니다. 직원의 시급, 직책, 연락처 등을 관리할 수 있습니다.',
      side: 'bottom',
      align: 'start',
    }
  },
  {
    element: '[data-tutorial="store-selector"]',
    popover: {
      title: '스토어 선택',
      description: '등록된 스토어 중에서 직원을 추가할 스토어를 선택할 수 있습니다. 스토어별로 직원을 구분하여 관리합니다.',
      side: 'bottom',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="view-mode-toggle"]',
    popover: {
      title: '보기 모드 전환',
      description: '테이블 모드와 카드 모드 사이를 전환할 수 있습니다. 선호하는 방식으로 직원 목록을 확인하세요.',
      side: 'left',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="new-employee-button"]',
    popover: {
      title: '새 직원 등록',
      description: '이 버튼을 클릭하여 새로운 직원을 등록할 수 있습니다. 기본 정보만 입력하거나 근로계약서와 함께 등록할 수 있습니다.',
      side: 'left',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="employee-form"]',
    popover: {
      title: '직원 등록 폼',
      description: '직원의 기본 정보를 입력하세요. 스토어, 이름, 시급(2025년 최저시급 10,030원), 직책, 연락처, 근무 시작일을 설정할 수 있습니다.',
      side: 'right',
      align: 'start',
    }
  },
  {
    element: '[data-tutorial="contract-info"]',
    popover: {
      title: '근로계약서 연동',
      description: '근로계약서 작성 페이지로 이동하여 법정 서류를 완비할 수 있습니다. 근로계약서와 함께 직원을 등록하면 더 체계적인 관리가 가능합니다.',
      side: 'top',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="employee-list"]',
    popover: {
      title: '직원 목록 및 드릴다운',
      description: '등록된 직원들이 표시됩니다. 직원을 클릭하면 상세 정보를 드릴다운으로 확인할 수 있고, 편집, 활성화/비활성화, 삭제 등의 작업을 수행할 수 있습니다.',
      side: 'top',
      align: 'center',
    }
  },
  {
    popover: {
      title: '다음 단계: 스케줄 관리',
      description: '직원을 등록했다면, 이제 스케줄을 관리해보겠습니다. 스케줄 보기 페이지로 이동하겠습니다.',
      side: 'bottom',
    }
  }
];

// 스케줄 관리 페이지 튜토리얼
export const scheduleTutorialSteps: TutorialStep[] = [
  {
    element: 'body',
    popover: {
      title: '📅 스케줄 관리',
      description: '마지막으로 스케줄을 관리하는 방법을 알아보겠습니다.',
      side: 'bottom',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="schedule-header"]',
    popover: {
      title: '스케줄 관리 페이지',
      description: '등록된 직원들의 주간 스케줄을 관리할 수 있는 페이지입니다. 시간대별로 직원을 배치하고 근무 스케줄을 조정할 수 있습니다.',
      side: 'bottom',
      align: 'start',
    }
  },
  {
    element: '[data-tutorial="store-template-selectors"]',
    popover: {
      title: '스토어 및 템플릿 선택',
      description: '스케줄을 관리할 스토어와 템플릿을 선택할 수 있습니다. 템플릿을 통해 주간 스케줄 패턴을 저장하고 재사용할 수 있습니다.',
      side: 'bottom',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="save-button"]',
    popover: {
      title: '스케줄 저장',
      description: '변경사항을 저장하려면 이 버튼을 클릭하세요. 저장된 스케줄은 템플릿으로 관리됩니다.',
      side: 'left',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="schedule-actions"]',
    popover: {
      title: '스케줄 관리 도구',
      description: '영업시간 설정, 스케줄 초기화, 직원 추가 등의 기능을 사용할 수 있습니다.',
      side: 'left',
      align: 'center',
    }
  },
  {
    element: '[data-tutorial="schedule-table"]',
    popover: {
      title: '주간 스케줄 테이블',
      description: '요일별, 시간대별로 직원을 배치할 수 있습니다. 직원을 클릭하면 상세 정보를 확인하고, 빈 슬롯을 클릭하면 직원을 추가할 수 있습니다.',
      side: 'top',
      align: 'center',
    }
  },
  {
    popover: {
      title: '🎉 튜토리얼 완료!',
      description: '축하합니다! HR 관리 시스템의 기본 사용법을 모두 익혔습니다. 추가 도움이 필요하시면 도움말 페이지를 참고하세요.',
      side: 'bottom',
      doneBtnText: '완료',
    }
  }
];

// 전체 워크플로우 튜토리얼 (모든 단계를 한 번에)
export const fullWorkflowTutorialSteps: TutorialStep[] = [
  {
    popover: {
      title: '🚀 HR 관리 시스템 완전 가이드',
      description: '전체 워크플로우를 처음부터 끝까지 안내해드리겠습니다. 스토어 생성 → 직원 등록 → 스케줄 관리 순서로 진행됩니다.',
      side: 'bottom',
    }
  },
  ...storesTutorialSteps.slice(1, -1), // 첫 번째와 마지막 스텝 제외
  ...employeesTutorialSteps.slice(1, -1), // 첫 번째와 마지막 스텝 제외
  ...scheduleTutorialSteps.slice(1), // 첫 번째 스텝 제외, 마지막 완료 메시지 포함
];

// 빠른 도움말 스텝들
export const quickHelpSteps: TutorialStep[] = [
  {
    element: '[data-tutorial="main-navigation"]',
    popover: {
      title: '메인 네비게이션',
      description: '좌측 사이드바를 통해 다양한 기능에 접근할 수 있습니다.',
      side: 'right',
      align: 'start',
      showButtons: ['next', 'close'],
    }
  },
  {
    element: '[data-tutorial="user-profile"]',
    popover: {
      title: '사용자 프로필',
      description: '우측 상단에서 프로필 설정과 로그아웃을 할 수 있습니다.',
      side: 'left',
      align: 'end',
    }
  },
  {
    popover: {
      title: '도움이 필요하시면...',
      description: '각 페이지의 도움말 아이콘(?)을 클릭하거나, 도움말 페이지를 방문하여 더 자세한 정보를 확인하세요.',
      side: 'bottom',
      doneBtnText: '확인',
    }
  }
];
