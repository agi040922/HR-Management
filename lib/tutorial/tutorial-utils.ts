// 튜토리얼 유틸리티 함수들

// 로컬 스토리지에 튜토리얼 상태 저장
export const TutorialStorage = {
  // 특정 튜토리얼의 완료 상태 저장
  setTutorialCompleted: (tutorialName: string, completed: boolean = true) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`tutorial_completed_${tutorialName}`, JSON.stringify(completed));
    }
  },

  // 특정 튜토리얼의 완료 상태 확인
  isTutorialCompleted: (tutorialName: string): boolean => {
    if (typeof window !== 'undefined') {
      const completed = localStorage.getItem(`tutorial_completed_${tutorialName}`);
      return completed ? JSON.parse(completed) : false;
    }
    return false;
  },

  // 모든 튜토리얼 완료 상태 초기화
  resetAllTutorials: () => {
    if (typeof window !== 'undefined') {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('tutorial_completed_'));
      keys.forEach(key => localStorage.removeItem(key));
    }
  },

  // 사용자가 튜토리얼을 건너뛸 것인지 설정
  setSkipTutorials: (skip: boolean = true) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('skip_tutorials', JSON.stringify(skip));
    }
  },

  // 사용자가 튜토리얼을 건너뛸 것인지 확인
  shouldSkipTutorials: (): boolean => {
    if (typeof window !== 'undefined') {
      const skip = localStorage.getItem('skip_tutorials');
      return skip ? JSON.parse(skip) : false;
    }
    return false;
  }
};

// 튜토리얼 테마 설정
export const getTutorialTheme = () => ({
  popoverClass: 'tutorial-popover-custom',
  overlayColor: 'rgba(0, 0, 0, 0.7)',
  overlayOpacity: 0.7,
  stagePadding: 6,
  animate: true,
  showProgress: true,
  progressText: '{{current}}/{{total}} 단계',
  nextBtnText: '다음',
  prevBtnText: '이전',
  doneBtnText: '완료',
  allowClose: true,
  allowKeyboardControl: true,
});

// 페이지별 튜토리얼 데이터 속성 추가 도우미
export const addTutorialAttributes = () => {
  // 스토어 페이지
  const addStoreAttributes = () => {
    // 헤더
    const storeHeader = document.querySelector('h1:contains("스토어 관리")') || 
                       document.querySelector('[class*="text-2xl"]:contains("스토어 관리")');
    if (storeHeader) storeHeader.setAttribute('data-tutorial', 'stores-header');

    // 새 스토어 버튼
    const newStoreBtn = document.querySelector('button:contains("새 스토어")') ||
                       document.querySelector('[class*="flex items-center gap-2"]:contains("새 스토어")');
    if (newStoreBtn) newStoreBtn.setAttribute('data-tutorial', 'new-store-button');

    // 필터 영역
    const filters = document.querySelector('select') || 
                   document.querySelector('[class*="appearance-none"]');
    if (filters) filters.closest('div')?.setAttribute('data-tutorial', 'store-filters');

    // 스토어 테이블
    const storeTable = document.querySelector('[class*="StoreDataTable"]') ||
                      document.querySelector('div:contains("스토어 목록")');
    if (storeTable) storeTable.setAttribute('data-tutorial', 'store-table');
  };

  // 직원 페이지
  const addEmployeeAttributes = () => {
    // 헤더
    const employeeHeader = document.querySelector('h1:contains("직원 관리")');
    if (employeeHeader) employeeHeader.setAttribute('data-tutorial', 'employees-header');

    // 스토어 선택기
    const storeSelector = document.querySelector('label:contains("스토어:")');
    if (storeSelector) storeSelector.parentElement?.setAttribute('data-tutorial', 'store-selector');

    // 보기 모드 토글
    const viewToggle = document.querySelector('button:contains("테이블")') ||
                      document.querySelector('button:contains("카드")');
    if (viewToggle) viewToggle.closest('div')?.setAttribute('data-tutorial', 'view-mode-toggle');

    // 새 직원 버튼
    const newEmployeeBtn = document.querySelector('button:contains("새 직원 등록")');
    if (newEmployeeBtn) newEmployeeBtn.setAttribute('data-tutorial', 'new-employee-button');

    // 직원 폼
    const employeeForm = document.querySelector('form') ||
                        document.querySelector('div:contains("직원 정보")');
    if (employeeForm) employeeForm.setAttribute('data-tutorial', 'employee-form');

    // 계약서 정보
    const contractInfo = document.querySelector('div:contains("근로계약서와 함께 등록")');
    if (contractInfo) contractInfo.setAttribute('data-tutorial', 'contract-info');

    // 직원 목록
    const employeeList = document.querySelector('[class*="Table"]') ||
                        document.querySelector('div:contains("직원 목록")');
    if (employeeList) employeeList.setAttribute('data-tutorial', 'employee-list');
  };

  // 스케줄 페이지
  const addScheduleAttributes = () => {
    // 헤더
    const scheduleHeader = document.querySelector('h1:contains("스케줄 관리")');
    if (scheduleHeader) scheduleHeader.setAttribute('data-tutorial', 'schedule-header');

    // 스토어/템플릿 선택기
    const selectors = document.querySelector('label:contains("스토어:")');
    if (selectors) selectors.closest('div')?.setAttribute('data-tutorial', 'store-template-selectors');

    // 저장 버튼
    const saveBtn = document.querySelector('button:contains("저장")');
    if (saveBtn) saveBtn.setAttribute('data-tutorial', 'save-button');

    // 스케줄 액션들
    const actions = document.querySelector('button:contains("영업시간 설정")');
    if (actions) actions.closest('div')?.setAttribute('data-tutorial', 'schedule-actions');

    // 스케줄 테이블
    const scheduleTable = document.querySelector('[class*="ScheduleTable"]') ||
                         document.querySelector('div:contains("주간 스케줄")');
    if (scheduleTable) scheduleTable.setAttribute('data-tutorial', 'schedule-table');
  };

  // 메인 네비게이션
  const addMainNavAttributes = () => {
    const sidebar = document.querySelector('aside') || 
                   document.querySelector('nav') ||
                   document.querySelector('[class*="sidebar"]');
    if (sidebar) sidebar.setAttribute('data-tutorial', 'main-navigation');

    const userProfile = document.querySelector('[class*="user"]') ||
                       document.querySelector('button:contains("프로필")') ||
                       document.querySelector('[class*="header"] button');
    if (userProfile) userProfile.setAttribute('data-tutorial', 'user-profile');
  };

  // 현재 페이지에 따라 적절한 속성 추가
  const currentPath = window.location.pathname;
  
  addMainNavAttributes(); // 모든 페이지에 공통 적용

  if (currentPath.includes('/stores')) {
    addStoreAttributes();
  } else if (currentPath.includes('/employees')) {
    addEmployeeAttributes();
  } else if (currentPath.includes('/schedule')) {
    addScheduleAttributes();
  }
};

// 요소가 존재할 때까지 대기하는 함수
export const waitForElement = (selector: string, timeout: number = 5000): Promise<Element | null> => {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    // 타임아웃 설정
    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
};

// 페이지 로딩이 완료될 때까지 대기
export const waitForPageLoad = (): Promise<void> => {
  return new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve();
    } else {
      window.addEventListener('load', () => resolve());
    }
  });
};

// 튜토리얼 자동 시작 확인
export const shouldAutoStartTutorial = (tutorialName: string): boolean => {
  // 이미 완료된 튜토리얼이거나 사용자가 건너뛰기를 설정한 경우 false
  if (TutorialStorage.isTutorialCompleted(tutorialName) || TutorialStorage.shouldSkipTutorials()) {
    return false;
  }

  // URL 파라미터로 튜토리얼 시작 요청이 있는 경우 true
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('tutorial') === 'true' || urlParams.get('tutorial') === tutorialName;
};

// 페이지별 튜토리얼 이름 매핑
export const getTutorialNameFromPath = (path: string): string => {
  if (path.includes('/stores')) return 'stores';
  if (path.includes('/employees')) return 'employees';
  if (path.includes('/schedule')) return 'schedule';
  return 'general';
};
