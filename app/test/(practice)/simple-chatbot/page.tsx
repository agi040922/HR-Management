'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Trash2, Edit, Plus, Save } from 'lucide-react';

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

const STORAGE_KEY = 'simple-chatbot-qa-pairs';

const defaultQAPairs: QAPair[] = [
  {
    id: '1',
    question: '근무시간은 어떻게 되나요?',
    answer: '일반적인 근무시간은 오전 9시부터 오후 6시까지입니다. 점심시간은 12시부터 1시까지입니다.',
    keywords: ['근무시간', '출근', '퇴근', '시간', '업무시간'],
    category: '근무'
  },
  {
    id: '2',
    question: '급여는 언제 지급되나요?',
    answer: '급여는 매월 25일에 지급됩니다. 주말이나 공휴일인 경우 직전 영업일에 지급됩니다.',
    keywords: ['급여', '월급', '지급', '페이', '돈'],
    category: '급여'
  },
  {
    id: '3',
    question: '연차는 어떻게 사용하나요?',
    answer: '연차 사용은 최소 3일 전에 신청해야 합니다. HR 시스템을 통해 온라인으로 신청 가능합니다.',
    keywords: ['연차', '휴가', '휴무', '쉬는날'],
    category: '휴가'
  },
  {
    id: '4',
    question: '4대보험은 무엇인가요?',
    answer: '4대보험은 국민연금, 건강보험, 고용보험, 산재보험을 말합니다. 회사에서 자동으로 가입 처리됩니다.',
    keywords: ['4대보험', '보험', '국민연금', '건강보험', '고용보험', '산재보험'],
    category: '보험'
  },
  {
    id: '5',
    question: '야근수당은 어떻게 계산되나요?',
    answer: '야근수당은 기본시급의 1.5배로 계산됩니다. 22시 이후 근무 시 야간근로수당이 추가로 지급됩니다.',
    keywords: ['야근', '수당', '연장근로', '야간근로', '시간외'],
    category: '급여'
  }
];

export default function SimpleChatbotPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      text: '안녕하세요! HR 관련 질문을 도와드리겠습니다. 무엇을 궁금해하시나요?',
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [qaPairs, setQAPairs] = useState<QAPair[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newQA, setNewQA] = useState<Partial<QAPair>>({
    question: '',
    answer: '',
    keywords: [],
    category: ''
  });
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 로컬 스토리지에서 Q&A 데이터 로드
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setQAPairs(JSON.parse(stored));
      } catch {
        setQAPairs(defaultQAPairs);
      }
    } else {
      setQAPairs(defaultQAPairs);
    }
  }, []);

  // Q&A 데이터 저장
  const saveQAPairs = (pairs: QAPair[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pairs));
    setQAPairs(pairs);
  };

  // 답변 찾기 로직
  const findAnswer = (userInput: string): string => {
    const input = userInput.toLowerCase().trim();
    
    // 1. 정확한 질문 매칭
    const exactMatch = qaPairs.find(qa => 
      qa.question.toLowerCase() === input
    );
    if (exactMatch) return exactMatch.answer;
    
    // 2. 키워드 기반 매칭
    const keywordMatch = qaPairs.find(qa =>
      qa.keywords.some(keyword => 
        input.includes(keyword.toLowerCase())
      )
    );
    if (keywordMatch) return keywordMatch.answer;
    
    // 3. 부분 문자열 매칭
    const partialMatch = qaPairs.find(qa =>
      qa.question.toLowerCase().includes(input) ||
      input.includes(qa.question.toLowerCase())
    );
    if (partialMatch) return partialMatch.answer;
    
    return "죄송합니다. 해당 질문에 대한 답변을 찾을 수 없습니다. 다른 방식으로 질문해 주시거나 관리자에게 문의해 주세요.";
  };

  // 메시지 전송
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

  // 스크롤 자동 이동
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  // Q&A 추가
  const addQAPair = () => {
    if (!newQA.question || !newQA.answer) return;
    
    const qaPair: QAPair = {
      id: Date.now().toString(),
      question: newQA.question,
      answer: newQA.answer,
      keywords: newQA.keywords || [],
      category: newQA.category || '기타'
    };
    
    const updatedPairs = [...qaPairs, qaPair];
    saveQAPairs(updatedPairs);
    setNewQA({ question: '', answer: '', keywords: [], category: '' });
  };

  // Q&A 수정
  const updateQAPair = (id: string, updates: Partial<QAPair>) => {
    const updatedPairs = qaPairs.map(qa => 
      qa.id === id ? { ...qa, ...updates } : qa
    );
    saveQAPairs(updatedPairs);
  };

  // Q&A 삭제
  const deleteQAPair = (id: string) => {
    const updatedPairs = qaPairs.filter(qa => qa.id !== id);
    saveQAPairs(updatedPairs);
  };

  // 카테고리별 분류
  const categorizedQAs = qaPairs.reduce((acc, qa) => {
    const category = qa.category || '기타';
    if (!acc[category]) acc[category] = [];
    acc[category].push(qa);
    return acc;
  }, {} as Record<string, QAPair[]>);

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">간단한 Q&A 챗봇 테스트</h1>
        <p className="text-gray-600">
          미리 정의된 질문-답변으로 동작하는 룰 기반 챗봇입니다. 
          질문을 입력하거나 Q&A를 직접 관리할 수 있습니다.
        </p>
      </div>

      <Tabs defaultValue="chat" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chat">챗봇 테스트</TabsTrigger>
          <TabsTrigger value="manage">Q&A 관리</TabsTrigger>
          <TabsTrigger value="stats">통계 및 정보</TabsTrigger>
        </TabsList>

        {/* 챗봇 테스트 탭 */}
        <TabsContent value="chat" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 챗봇 인터페이스 */}
            <div className="lg:col-span-2">
              <Card className="h-96">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    🤖 HR 도우미 챗봇
                    <Badge variant="secondary">{qaPairs.length}개 답변 준비됨</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-64 p-4" ref={scrollAreaRef}>
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`mb-4 ${message.isUser ? 'text-right' : 'text-left'}`}
                      >
                        <div
                          className={`inline-block p-3 rounded-lg max-w-xs ${
                            message.isUser
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-800 border'
                          }`}
                        >
                          {message.text}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                  <div className="p-4 border-t flex gap-2">
                    <Input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="질문을 입력하세요... (예: 근무시간, 급여, 연차)"
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1"
                    />
                    <Button onClick={handleSend} disabled={!input.trim()}>
                      전송
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 빠른 질문 버튼 */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">빠른 질문</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {qaPairs.slice(0, 5).map((qa) => (
                    <Button
                      key={qa.id}
                      variant="outline"
                      size="sm"
                      className="w-full text-left justify-start h-auto p-2"
                      onClick={() => setInput(qa.question)}
                    >
                      <div className="text-xs truncate">{qa.question}</div>
                    </Button>
                  ))}
                </CardContent>
              </Card>

              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-lg">카테고리별 질문 수</CardTitle>
                </CardHeader>
                <CardContent>
                  {Object.entries(categorizedQAs).map(([category, qas]) => (
                    <div key={category} className="flex justify-between items-center py-1">
                      <span className="text-sm">{category}</span>
                      <Badge variant="secondary">{qas.length}</Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Q&A 관리 탭 */}
        <TabsContent value="manage" className="space-y-4">
          {/* 새 Q&A 추가 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                새 Q&A 추가
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">질문</label>
                  <Input
                    placeholder="질문을 입력하세요"
                    value={newQA.question || ''}
                    onChange={(e) => setNewQA(prev => ({ ...prev, question: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">카테고리</label>
                  <Input
                    placeholder="카테고리 (예: 급여, 근무, 휴가)"
                    value={newQA.category || ''}
                    onChange={(e) => setNewQA(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">답변</label>
                <Textarea
                  placeholder="답변을 입력하세요"
                  value={newQA.answer || ''}
                  onChange={(e) => setNewQA(prev => ({ ...prev, answer: e.target.value }))}
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">키워드 (쉼표로 구분)</label>
                <Input
                  placeholder="키워드1, 키워드2, 키워드3"
                  value={newQA.keywords?.join(', ') || ''}
                  onChange={(e) => setNewQA(prev => ({ 
                    ...prev, 
                    keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k) 
                  }))}
                />
              </div>
              <Button 
                onClick={addQAPair} 
                disabled={!newQA.question || !newQA.answer}
                className="w-full"
              >
                <Plus className="w-4 h-4 mr-2" />
                Q&A 추가
              </Button>
            </CardContent>
          </Card>

          {/* 기존 Q&A 목록 */}
          <div className="space-y-4">
            {Object.entries(categorizedQAs).map(([category, qas]) => (
              <Card key={category}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{category} 카테고리</span>
                    <Badge>{qas.length}개</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {qas.map((qa) => (
                    <div key={qa.id} className="border rounded-lg p-4">
                      {editingId === qa.id ? (
                        <div className="space-y-3">
                          <Input
                            value={qa.question}
                            onChange={(e) => updateQAPair(qa.id, { question: e.target.value })}
                            placeholder="질문"
                          />
                          <Textarea
                            value={qa.answer}
                            onChange={(e) => updateQAPair(qa.id, { answer: e.target.value })}
                            placeholder="답변"
                            rows={3}
                          />
                          <Input
                            value={qa.keywords.join(', ')}
                            onChange={(e) => updateQAPair(qa.id, { 
                              keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                            })}
                            placeholder="키워드 (쉼표로 구분)"
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => setEditingId(null)}>
                              <Save className="w-4 h-4 mr-1" />
                              저장
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setEditingId(null)}>
                              취소
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-lg">{qa.question}</h4>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(qa.id)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => deleteQAPair(qa.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-700 mb-2">{qa.answer}</p>
                          <div className="flex flex-wrap gap-1">
                            {qa.keywords.map((keyword, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {keyword}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 통계 및 정보 탭 */}
        <TabsContent value="stats" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>전체 통계</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>총 Q&A 수:</span>
                    <Badge>{qaPairs.length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>카테고리 수:</span>
                    <Badge>{Object.keys(categorizedQAs).length}</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>총 키워드 수:</span>
                    <Badge>{qaPairs.reduce((sum, qa) => sum + qa.keywords.length, 0)}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>사용법</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <p>• 정확한 질문으로 검색</p>
                <p>• 키워드로 검색</p>
                <p>• 부분 문자열로 검색</p>
                <p>• Q&A 추가/수정/삭제</p>
                <p>• 로컬 스토리지에 자동 저장</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>데이터 관리</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const data = JSON.stringify(qaPairs, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'chatbot-qa-data.json';
                    a.click();
                  }}
                  className="w-full"
                >
                  데이터 내보내기
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (confirm('기본 데이터로 초기화하시겠습니까?')) {
                      saveQAPairs(defaultQAPairs);
                    }
                  }}
                  className="w-full"
                >
                  기본값으로 초기화
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>구현 특징</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none">
              <ul className="space-y-1 text-sm">
                <li><strong>룰 기반 매칭:</strong> 정확한 질문, 키워드, 부분 문자열 순으로 검색</li>
                <li><strong>로컬 스토리지:</strong> 브라우저에 Q&A 데이터 자동 저장</li>
                <li><strong>실시간 편집:</strong> Q&A 추가, 수정, 삭제 즉시 반영</li>
                <li><strong>카테고리 분류:</strong> 주제별로 Q&A 그룹화</li>
                <li><strong>키워드 검색:</strong> 다양한 표현으로 같은 답변 찾기</li>
                <li><strong>반응형 UI:</strong> 모바일과 데스크톱 모두 지원</li>
                <li><strong>데이터 내보내기:</strong> JSON 형태로 백업 가능</li>
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
