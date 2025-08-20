# 간단한 질문-답변 챗봇 구현 가이드

## 개요

이 가이드는 미리 정의된 질문-답변 쌍으로 동작하는 간단한 룰 기반 챗봇을 구현하는 방법을 설명합니다. 복잡한 AI 모델 없이도 효과적인 고객 지원이나 FAQ 시스템을 만들 수 있습니다.

## 1. 기본 구조

### 1.1 데이터 구조

```typescript
interface QAPair {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category?: string;
}

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}
```

### 1.2 기본 챗봇 로직

```typescript
class SimpleChatbot {
  private qaPairs: QAPair[] = [];
  
  constructor(qaPairs: QAPair[]) {
    this.qaPairs = qaPairs;
  }
  
  findAnswer(userInput: string): string {
    const input = userInput.toLowerCase().trim();
    
    // 정확한 질문 매칭
    const exactMatch = this.qaPairs.find(qa => 
      qa.question.toLowerCase() === input
    );
    if (exactMatch) return exactMatch.answer;
    
    // 키워드 기반 매칭
    const keywordMatch = this.qaPairs.find(qa =>
      qa.keywords.some(keyword => 
        input.includes(keyword.toLowerCase())
      )
    );
    if (keywordMatch) return keywordMatch.answer;
    
    // 부분 문자열 매칭
    const partialMatch = this.qaPairs.find(qa =>
      qa.question.toLowerCase().includes(input) ||
      input.includes(qa.question.toLowerCase())
    );
    if (partialMatch) return partialMatch.answer;
    
    return "죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다. 다른 방식으로 질문해 주세요.";
  }
}
```

## 2. React 컴포넌트 구현

### 2.1 기본 챗봇 컴포넌트

```tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

interface QAPair {
  id: string;
  question: string;
  answer: string;
  keywords: string[];
  category?: string;
}

const SimpleChatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '안녕하세요! 무엇을 도와드릴까요?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // 기본 Q&A 데이터
  const qaPairs: QAPair[] = [
    {
      id: '1',
      question: '근무시간은 어떻게 되나요?',
      answer: '일반적인 근무시간은 오전 9시부터 오후 6시까지입니다. 점심시간은 12시부터 1시까지입니다.',
      keywords: ['근무시간', '출근', '퇴근', '시간'],
      category: '근무'
    },
    {
      id: '2',
      question: '급여는 언제 지급되나요?',
      answer: '급여는 매월 25일에 지급됩니다. 주말이나 공휴일인 경우 직전 영업일에 지급됩니다.',
      keywords: ['급여', '월급', '지급', '페이'],
      category: '급여'
    },
    {
      id: '3',
      question: '연차는 어떻게 사용하나요?',
      answer: '연차 사용은 최소 3일 전에 신청해야 합니다. HR 시스템을 통해 온라인으로 신청 가능합니다.',
      keywords: ['연차', '휴가', '휴무'],
      category: '휴가'
    }
  ];
  
  const findAnswer = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // 정확한 질문 매칭
    const exactMatch = qaPairs.find(qa => 
      qa.question.toLowerCase() === input
    );
    if (exactMatch) return exactMatch.answer;
    
    // 키워드 기반 매칭
    const keywordMatch = qaPairs.find(qa =>
      qa.keywords.some(keyword => 
        input.includes(keyword.toLowerCase())
      )
    );
    if (keywordMatch) return keywordMatch.answer;
    
    return "죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다.";
  };
  
  const handleSend = () => {
    if (!input.trim()) return;
    
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: input,
      isUser: true,
      timestamp: new Date()
    };
    
    const botResponse: ChatMessage = {
      id: (Date.now() + 1).toString(),
      text: findAnswer(input),
      isUser: false,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage, botResponse]);
    setInput('');
  };
  
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);
  
  return (
    <Card className="w-full max-w-2xl mx-auto h-96">
      <CardHeader>
        <CardTitle>HR 도우미 챗봇</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
            >
              <div
                className={`inline-block p-2 rounded-lg max-w-xs ${
                  message.isUser
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-800'
                }`}
              >
                {message.text}
              </div>
            </div>
          ))}
        </ScrollArea>
        <div className="p-4 border-t flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          />
          <Button onClick={handleSend}>전송</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimpleChatbot;
```

## 3. 데이터 저장 및 관리

### 3.1 로컬 스토리지 활용

```typescript
const STORAGE_KEY = 'chatbot-qa-pairs';

// Q&A 데이터 저장
const saveQAPairs = (qaPairs: QAPair[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(qaPairs));
};

// Q&A 데이터 불러오기
const loadQAPairs = (): QAPair[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : defaultQAPairs;
};
```

### 3.2 Q&A 편집 기능

```tsx
const QAEditor: React.FC = () => {
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const addQAPair = () => {
    const newPair: QAPair = {
      id: Date.now().toString(),
      question: '',
      answer: '',
      keywords: []
    };
    setQAPairs([...qaPairs, newPair]);
    setEditingId(newPair.id);
  };
  
  const updateQAPair = (id: string, updates: Partial<QAPair>) => {
    setQAPairs(prev => prev.map(qa => 
      qa.id === id ? { ...qa, ...updates } : qa
    ));
  };
  
  const deleteQAPair = (id: string) => {
    setQAPairs(prev => prev.filter(qa => qa.id !== id));
  };
  
  return (
    <div className="space-y-4">
      <Button onClick={addQAPair}>새 Q&A 추가</Button>
      {qaPairs.map((qa) => (
        <Card key={qa.id}>
          <CardContent className="p-4">
            {editingId === qa.id ? (
              <div className="space-y-2">
                <Input
                  placeholder="질문"
                  value={qa.question}
                  onChange={(e) => updateQAPair(qa.id, { question: e.target.value })}
                />
                <textarea
                  placeholder="답변"
                  value={qa.answer}
                  onChange={(e) => updateQAPair(qa.id, { answer: e.target.value })}
                  className="w-full p-2 border rounded"
                  rows={3}
                />
                <Input
                  placeholder="키워드 (쉼표로 구분)"
                  value={qa.keywords.join(', ')}
                  onChange={(e) => updateQAPair(qa.id, { 
                    keywords: e.target.value.split(',').map(k => k.trim()) 
                  })}
                />
                <div className="flex gap-2">
                  <Button onClick={() => setEditingId(null)}>저장</Button>
                  <Button variant="outline" onClick={() => deleteQAPair(qa.id)}>삭제</Button>
                </div>
              </div>
            ) : (
              <div onClick={() => setEditingId(qa.id)} className="cursor-pointer">
                <h3 className="font-semibold">{qa.question}</h3>
                <p className="text-gray-600">{qa.answer}</p>
                <p className="text-sm text-gray-400">키워드: {qa.keywords.join(', ')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

## 4. 고급 기능

### 4.1 카테고리별 분류

```typescript
const getCategorizedQAs = (qaPairs: QAPair[]) => {
  return qaPairs.reduce((acc, qa) => {
    const category = qa.category || '기타';
    if (!acc[category]) acc[category] = [];
    acc[category].push(qa);
    return acc;
  }, {} as Record<string, QAPair[]>);
};
```

### 4.2 검색 개선

```typescript
const improvedSearch = (userInput: string, qaPairs: QAPair[]): QAPair | null => {
  const input = userInput.toLowerCase().trim();
  
  // 1. 정확한 매칭 (가중치: 100)
  const exactMatch = qaPairs.find(qa => 
    qa.question.toLowerCase() === input
  );
  if (exactMatch) return exactMatch;
  
  // 2. 키워드 매칭 (가중치: 80)
  const keywordMatches = qaPairs.filter(qa =>
    qa.keywords.some(keyword => 
      input.includes(keyword.toLowerCase())
    )
  );
  
  // 3. 부분 문자열 매칭 (가중치: 60)
  const partialMatches = qaPairs.filter(qa =>
    qa.question.toLowerCase().includes(input) ||
    input.includes(qa.question.toLowerCase())
  );
  
  // 가장 관련성 높은 결과 반환
  return keywordMatches[0] || partialMatches[0] || null;
};
```

## 5. 사용 방법

### 5.1 기본 사용법

1. 컴포넌트를 페이지에 임포트
2. Q&A 데이터 준비
3. 챗봇 컴포넌트 렌더링

```tsx
import SimpleChatbot from '@/components/SimpleChatbot';

export default function ChatPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">고객 지원</h1>
      <SimpleChatbot />
    </div>
  );
}
```

### 5.2 커스터마이징

- **스타일링**: Tailwind CSS 클래스 수정
- **데이터**: qaPairs 배열 수정
- **로직**: findAnswer 함수 개선
- **UI**: 메시지 표시 방식 변경

## 6. 장단점

### 장점
- 구현이 간단하고 빠름
- 외부 API 불필요
- 응답 속도가 빠름
- 비용이 들지 않음
- 완전한 제어 가능

### 단점
- 미리 정의된 답변만 가능
- 자연어 처리 한계
- 복잡한 질문 처리 어려움
- 수동으로 Q&A 관리 필요

## 7. 확장 가능성

- **Supabase 연동**: 데이터베이스에 Q&A 저장
- **관리자 패널**: 웹 인터페이스로 Q&A 관리
- **분석 기능**: 자주 묻는 질문 통계
- **다국어 지원**: 언어별 Q&A 세트
- **AI 연동**: 답변 못 찾을 때 AI API 호출

이 가이드를 통해 간단하지만 효과적인 챗봇을 구현할 수 있습니다.
