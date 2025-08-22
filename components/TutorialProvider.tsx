'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export interface TutorialStep {
  element?: string | Element;
  popover?: {
    title?: string;
    description: string;
    side?: 'top' | 'right' | 'bottom' | 'left';
    align?: 'start' | 'center' | 'end';
    showButtons?: ('next' | 'previous' | 'close')[];
    nextBtnText?: string;
    prevBtnText?: string;
    doneBtnText?: string;
    showProgress?: boolean;
    progressText?: string;
    popoverClass?: string;
    onNextClick?: () => void;
    onPrevClick?: () => void;
    onCloseClick?: () => void;
  };
  onHighlighted?: () => void;
  onDeselected?: () => void;
}

export interface TutorialConfig {
  showProgress?: boolean;
  progressText?: string;
  animate?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  popoverClass?: string;
  stagePadding?: number;
  allowClose?: boolean;
  allowKeyboardControl?: boolean;
  showButtons?: ('next' | 'previous' | 'close')[];
  nextBtnText?: string;
  prevBtnText?: string;
  doneBtnText?: string;
}

interface TutorialContextType {
  isRunning: boolean;
  currentStepIndex: number;
  totalSteps: number;
  startTutorial: (steps: TutorialStep[], config?: TutorialConfig) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  highlightElement: (step: TutorialStep) => void;
  isFirstStep: boolean;
  isLastStep: boolean;
  driverInstance: any | null;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};

interface TutorialProviderProps {
  children: React.ReactNode;
}

export const TutorialProvider: React.FC<TutorialProviderProps> = ({ children }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const driverRef = useRef<any>(null);
  const stepsRef = useRef<TutorialStep[]>([]);

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === totalSteps - 1;

  // Driver.js 기본 설정
  const defaultConfig: TutorialConfig = {
    showProgress: true,
    progressText: '{{current}} / {{total}} 단계',
    animate: true,
    overlayColor: 'rgba(0, 0, 0, 0.6)',
    overlayOpacity: 0.6,
    popoverClass: 'tutorial-popover-custom',
    stagePadding: 4,
    allowClose: true,
    allowKeyboardControl: true,
    showButtons: ['next', 'previous', 'close'],
    nextBtnText: '다음',
    prevBtnText: '이전',
    doneBtnText: '완료'
  };

  const startTutorial = (steps: TutorialStep[], config?: TutorialConfig) => {
    const mergedConfig = { ...defaultConfig, ...config };
    stepsRef.current = steps;
    setTotalSteps(steps.length);
    setCurrentStepIndex(0);
    setIsRunning(true);

    // Driver.js 인스턴스 생성
    const driverInstance = driver({
      showProgress: mergedConfig.showProgress,
      progressText: `단계 {{current}} / {{total}}`,
      animate: mergedConfig.animate,
      overlayColor: mergedConfig.overlayColor,
      overlayOpacity: mergedConfig.overlayOpacity,
      popoverClass: mergedConfig.popoverClass,
      stagePadding: mergedConfig.stagePadding,
      allowClose: mergedConfig.allowClose,
      allowKeyboardControl: mergedConfig.allowKeyboardControl,
      nextBtnText: mergedConfig.nextBtnText,
      prevBtnText: mergedConfig.prevBtnText,
      doneBtnText: mergedConfig.doneBtnText,
      smoothScroll: true,
      disableActiveInteraction: false,
      
      // 글로벌 콜백들
      onHighlightStarted: (element, step, { driver }) => {
        const stepIndex = driver.getActiveIndex();
        if (stepIndex !== undefined) {
          setCurrentStepIndex(stepIndex);
          
          // 커스텀 onHighlighted 콜백 실행
          const currentStep = stepsRef.current[stepIndex];
          if (currentStep?.onHighlighted) {
            currentStep.onHighlighted();
          }
        }
      },
      
      onDeselected: (element, step, { driver }) => {
        const stepIndex = driver.getActiveIndex();
        if (stepIndex !== undefined) {
          // 커스텀 onDeselected 콜백 실행
          const currentStep = stepsRef.current[stepIndex];
          if (currentStep?.onDeselected) {
            currentStep.onDeselected();
          }
        }
      },
      
      onDestroyed: () => {
        setIsRunning(false);
        setCurrentStepIndex(0);
        driverRef.current = null;
      },
      
      // 글로벌 네비게이션 콜백들 - 기본 동작 포함
      onNextClick: (element, step, { driver }) => {
        const stepIndex = driver.getActiveIndex();
        
        if (stepIndex !== undefined) {
          const currentStep = stepsRef.current[stepIndex];
          
          // 커스텀 onNextClick이 있으면 실행
          if (currentStep?.popover?.onNextClick) {
            currentStep.popover.onNextClick();
            return; // 커스텀 핸들러가 있으면 기본 동작 건너뛰기
          }
          
          // 마지막 단계가 아니면 다음으로 이동
          if (stepIndex < stepsRef.current.length - 1) {
            driver.moveNext();
          } else {
            // 마지막 단계면 완료
            driver.destroy();
          }
        }
      },
      
      onPrevClick: (element, step, { driver }) => {
        const stepIndex = driver.getActiveIndex();
        
        if (stepIndex !== undefined) {
          const currentStep = stepsRef.current[stepIndex];
          
          // 커스텀 onPrevClick이 있으면 실행
          if (currentStep?.popover?.onPrevClick) {
            currentStep.popover.onPrevClick();
            return; // 커스텀 핸들러가 있으면 기본 동작 건너뛰기
          }
          
          // 이전 단계로 이동
          if (stepIndex > 0) {
            driver.movePrevious();
          }
        }
      },
      
      onCloseClick: (element, step, { driver }) => {
        const stepIndex = driver.getActiveIndex();
        
        if (stepIndex !== undefined) {
          const currentStep = stepsRef.current[stepIndex];
          
          // 커스텀 onCloseClick이 있으면 실행
          if (currentStep?.popover?.onCloseClick) {
            currentStep.popover.onCloseClick();
            return; // 커스텀 핸들러가 있으면 기본 동작 건너뛰기
          }
        }
        
        // 튜토리얼 종료
        driver.destroy();
      },
      
      steps: steps.map((step, index) => ({
        element: step.element,
        popover: {
          title: step.popover?.title,
          description: step.popover?.description || '',
          side: step.popover?.side || 'bottom',
          align: step.popover?.align || 'center',
          showButtons: step.popover?.showButtons || mergedConfig.showButtons,
          nextBtnText: step.popover?.nextBtnText || (index === steps.length - 1 ? mergedConfig.doneBtnText : mergedConfig.nextBtnText),
          prevBtnText: step.popover?.prevBtnText || mergedConfig.prevBtnText,
        },
        onHighlightStarted: step.onHighlighted,
        onDeselected: step.onDeselected,
      }))
    });

    driverRef.current = driverInstance;
    driverInstance.drive();
  };

  const stopTutorial = () => {
    if (driverRef.current) {
      driverRef.current.destroy();
    }
    setIsRunning(false);
    setCurrentStepIndex(0);
    driverRef.current = null;
  };

  const nextStep = () => {
    if (driverRef.current) {
      const currentStepIdx = driverRef.current.getActiveIndex();
      if (currentStepIdx !== undefined && currentStepIdx < totalSteps - 1) {
        driverRef.current.moveNext();
      } else {
        // 마지막 단계면 완료
        driverRef.current.destroy();
      }
    }
  };

  const prevStep = () => {
    if (driverRef.current) {
      const currentStepIdx = driverRef.current.getActiveIndex();
      if (currentStepIdx !== undefined && currentStepIdx > 0) {
        driverRef.current.movePrevious();
      }
    }
  };

  const goToStep = (index: number) => {
    if (driverRef.current && index >= 0 && index < totalSteps) {
      driverRef.current.moveTo(index);
      setCurrentStepIndex(index);
    }
  };

  const highlightElement = (step: TutorialStep) => {
    const driverInstance = driver({
      ...defaultConfig,
      showButtons: ['close'],
    });

    driverInstance.highlight({
      element: step.element,
      popover: {
        ...step.popover,
        showButtons: ['close'],
        popoverClass: step.popover?.popoverClass || defaultConfig.popoverClass,
      }
    });
  };

  // 컴포넌트 언마운트 시 정리
  useEffect(() => {
    return () => {
      if (driverRef.current) {
        driverRef.current.destroy();
      }
    };
  }, []);

  return (
    <TutorialContext.Provider
      value={{
        isRunning,
        currentStepIndex,
        totalSteps,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        goToStep,
        highlightElement,
        isFirstStep,
        isLastStep,
        driverInstance: driverRef.current,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};