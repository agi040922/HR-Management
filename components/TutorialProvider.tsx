'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, EVENTS } from 'react-joyride';

interface TutorialStep {
  target: string;
  content: string;
  title?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  disableBeacon?: boolean;
  hideCloseButton?: boolean;
  hideFooter?: boolean;
  showProgress?: boolean;
  showSkipButton?: boolean;
  styles?: any;
}

interface TutorialContextType {
  isRunning: boolean;
  steps: TutorialStep[];
  stepIndex: number;
  startTutorial: (steps: TutorialStep[]) => void;
  stopTutorial: () => void;
  nextStep: () => void;
  prevStep: () => void;
  setSteps: (steps: TutorialStep[]) => void;
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
  const [steps, setSteps] = useState<TutorialStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);

  const startTutorial = (newSteps: TutorialStep[]) => {
    setSteps(newSteps);
    setStepIndex(0);
    setIsRunning(true);
  };

  const stopTutorial = () => {
    setIsRunning(false);
    setStepIndex(0);
  };

  const nextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
    } else {
      stopTutorial();
    }
  };

  const prevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, type, index } = data;

    if ([EVENTS.STEP_AFTER, EVENTS.TARGET_NOT_FOUND].includes(type)) {
      setStepIndex(index + (type === EVENTS.STEP_AFTER ? 1 : 0));
    } else if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status)) {
      stopTutorial();
    }
  };

  // 커스텀 스타일
  const joyrideStyles = {
    options: {
      primaryColor: '#3b82f6',
      backgroundColor: '#ffffff',
      overlayColor: 'rgba(0, 0, 0, 0.5)',
      spotlightShadow: '0 0 15px rgba(0, 0, 0, 0.5)',
      beaconSize: 36,
      zIndex: 10000,
    },
    tooltip: {
      fontSize: 16,
      padding: 20,
      borderRadius: 8,
    },
    tooltipContainer: {
      textAlign: 'left' as const,
    },
    tooltipTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
    },
    tooltipContent: {
      fontSize: 14,
      lineHeight: 1.5,
    },
    buttonNext: {
      backgroundColor: '#3b82f6',
      fontSize: 14,
      padding: '8px 16px',
      borderRadius: 6,
    },
    buttonBack: {
      color: '#6b7280',
      fontSize: 14,
      padding: '8px 16px',
    },
    buttonSkip: {
      color: '#9ca3af',
      fontSize: 14,
    },
    buttonClose: {
      color: '#6b7280',
      fontSize: 18,
      padding: 4,
    },
  };

  return (
    <TutorialContext.Provider
      value={{
        isRunning,
        steps,
        stepIndex,
        startTutorial,
        stopTutorial,
        nextStep,
        prevStep,
        setSteps,
      }}
    >
      {children}
      <Joyride
        steps={steps}
        run={isRunning}
        stepIndex={stepIndex}
        callback={handleJoyrideCallback}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        styles={joyrideStyles}
        locale={{
          back: '이전',
          close: '닫기',
          last: '완료',
          next: '다음',
          skip: '건너뛰기',
        }}
        floaterProps={{
          disableAnimation: true,
        }}
      />
    </TutorialContext.Provider>
  );
};
