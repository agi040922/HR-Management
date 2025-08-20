# LangChain 챗봇 도입 가이드 - HR 관리 시스템

## 개요
HR 관리 시스템에 LangChain을 활용한 AI 챗봇을 도입하는 방법을 단계별로 설명합니다. 직원들의 질문 응답, 정책 안내, 급여 문의 등을 자동화할 수 있습니다.

## LangChain이란?

### 정의
- **LangChain**: 대화형 AI 애플리케이션 개발을 위한 프레임워크
- **목적**: LLM(Large Language Model)을 활용한 복잡한 AI 워크플로우 구축
- **특징**: 메모리, 도구 연동, 검색 증강 생성(RAG) 지원

### 주요 구성 요소
1. **Chat Models**: OpenAI GPT, Claude 등 LLM 연동
2. **Memory**: 대화 기록 저장 및 컨텍스트 유지
3. **Chains**: 여러 단계의 처리 과정 연결
4. **Retrievers**: 외부 데이터 검색 및 활용
5. **Tools**: 외부 API나 함수 호출

## 현재 프로젝트에 도입하는 방법

### 1단계: 패키지 설치

```bash
# LangChain JavaScript 설치
npm install langchain

# OpenAI API 사용 시
npm install @langchain/openai

# 벡터 데이터베이스 (선택사항)
npm install @langchain/community

# 추가 유틸리티
npm install @langchain/core
```

### 2단계: 환경 변수 설정

```bash
# .env.local 파일에 추가
OPENAI_API_KEY=your_openai_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key_here
```

### 3단계: 기본 챗봇 구현

```typescript
// lib/chatbot/basic-chatbot.ts
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

export class HRChatbot {
  private chain: ConversationChain;
  private memory: BufferMemory;

  constructor() {
    // OpenAI 모델 초기화
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.7,
    });

    // 메모리 초기화 (대화 기록 저장)
    this.memory = new BufferMemory();

    // 대화 체인 생성
    this.chain = new ConversationChain({
      llm: model,
      memory: this.memory,
    });
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.chain.call({
        input: message,
      });
      return response.response;
    } catch (error) {
      console.error('챗봇 오류:', error);
      return '죄송합니다. 일시적인 오류가 발생했습니다.';
    }
  }

  // 대화 기록 초기화
  clearMemory() {
    this.memory.clear();
  }
}
```

### 4단계: HR 전용 컨텍스트 추가

```typescript
// lib/chatbot/hr-chatbot.ts
import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";
import { PromptTemplate } from "@langchain/core/prompts";

export class HRChatbot {
  private chain: ConversationChain;
  private memory: BufferMemory;

  constructor() {
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.3, // HR 답변은 더 정확하게
    });

    this.memory = new BufferMemory();

    // HR 전용 프롬프트 템플릿
    const prompt = PromptTemplate.fromTemplate(`
당신은 HR 관리 시스템의 전문 AI 어시스턴트입니다.
다음 규칙을 따라 답변해주세요:

1. 한국의 노동법과 회사 정책에 맞는 정확한 정보 제공
2. 급여, 근무시간, 휴가 등에 대한 질문에 친절하게 답변
3. 개인정보는 절대 요구하지 않음
4. 확실하지 않은 정보는 "담당자에게 문의하세요"라고 안내

현재 대화:
{history}

사용자: {input}
AI 어시스턴트:`);

    this.chain = new ConversationChain({
      llm: model,
      memory: this.memory,
      prompt: prompt,
    });
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await this.chain.call({
        input: message,
      });
      return response.response;
    } catch (error) {
      console.error('HR 챗봇 오류:', error);
      return '죄송합니다. HR 담당자에게 직접 문의해주세요.';
    }
  }
}
```

### 5단계: 데이터베이스 연동 (RAG 구현)

```typescript
// lib/chatbot/rag-chatbot.ts
import { ChatOpenAI } from "@langchain/openai";
import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from "@langchain/openai";
import { createClient } from '@supabase/supabase-js';

export class RAGHRChatbot {
  private chain: RetrievalQAChain;
  private supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  async initialize() {
    // 1. HR 정책 문서들을 벡터화
    const documents = await this.loadHRDocuments();
    
    // 2. 임베딩 생성
    const embeddings = new OpenAIEmbeddings();
    
    // 3. 벡터 스토어 생성
    const vectorStore = await MemoryVectorStore.fromTexts(
      documents.map(doc => doc.content),
      documents.map(doc => doc.metadata),
      embeddings
    );

    // 4. 검색기 생성
    const retriever = vectorStore.asRetriever();

    // 5. LLM 초기화
    const model = new ChatOpenAI({
      modelName: "gpt-3.5-turbo",
      temperature: 0.2,
    });

    // 6. RAG 체인 생성
    this.chain = RetrievalQAChain.fromLLM(model, retriever, {
      prompt: this.createHRPrompt(),
    });
  }

  private async loadHRDocuments() {
    // Supabase에서 HR 정책 문서 로드
    const { data: policies } = await this.supabase
      .from('hr_policies')
      .select('*');

    return policies?.map(policy => ({
      content: policy.content,
      metadata: {
        title: policy.title,
        category: policy.category,
        updated_at: policy.updated_at
      }
    })) || [];
  }

  private createHRPrompt() {
    return `
다음 HR 정책 정보를 바탕으로 질문에 답변해주세요:

{context}

질문: {question}

답변 시 다음을 준수해주세요:
1. 제공된 정보만을 바탕으로 답변
2. 확실하지 않으면 "정확한 정보는 HR 담당자에게 문의하세요"
3. 한국어로 친절하게 답변
4. 관련 정책의 제목도 함께 안내

답변:`;
  }

  async chat(question: string): Promise<string> {
    if (!this.chain) {
      await this.initialize();
    }

    try {
      const response = await this.chain.call({
        query: question,
      });
      return response.text;
    } catch (error) {
      console.error('RAG 챗봇 오류:', error);
      return 'HR 정책 검색 중 오류가 발생했습니다. 담당자에게 문의해주세요.';
    }
  }
}
```

### 6단계: API 라우트 생성

```typescript
// app/api/chatbot/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { RAGHRChatbot } from '@/lib/chatbot/rag-chatbot';

const chatbot = new RAGHRChatbot();

export async function POST(request: NextRequest) {
  try {
    const { message, sessionId } = await request.json();

    if (!message) {
      return NextResponse.json(
        { error: '메시지를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 챗봇 응답 생성
    const response = await chatbot.chat(message);

    // 대화 기록 저장 (선택사항)
    await saveChatHistory(sessionId, message, response);

    return NextResponse.json({
      response,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('챗봇 API 오류:', error);
    return NextResponse.json(
      { error: '챗봇 서비스에 일시적인 문제가 발생했습니다.' },
      { status: 500 }
    );
  }
}

async function saveChatHistory(sessionId: string, message: string, response: string) {
  // Supabase에 대화 기록 저장
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  await supabase.from('chat_history').insert({
    session_id: sessionId,
    user_message: message,
    bot_response: response,
    created_at: new Date().toISOString(),
  });
}
```

### 7단계: 챗봇 UI 컴포넌트

```typescript
// components/chatbot/ChatbotWidget.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '안녕하세요! HR 관련 질문이 있으시면 언제든 물어보세요.',
      isUser: false,
      timestamp: new Date(),
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          sessionId: 'user-session-' + Date.now(),
        }),
      });

      const data = await response.json();

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || '죄송합니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('챗봇 오류:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* 챗봇 토글 버튼 */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="rounded-full w-14 h-14 shadow-lg"
        >
          <MessageCircle className="w-6 h-6" />
        </Button>
      )}

      {/* 챗봇 창 */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-xl w-80 h-96 flex flex-col">
          {/* 헤더 */}
          <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
            <h3 className="font-semibold">HR 어시스턴트</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-blue-700"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* 메시지 영역 */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                    message.isUser
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg text-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* 입력 영역 */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="질문을 입력하세요..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputValue.trim()}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
```

### 8단계: 메인 레이아웃에 챗봇 추가

```typescript
// app/layout.tsx 또는 원하는 페이지에 추가
import ChatbotWidget from '@/components/chatbot/ChatbotWidget';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        {children}
        <ChatbotWidget />
      </body>
    </html>
  );
}
```

## 고급 기능 구현

### 1. 다국어 지원
```typescript
// lib/chatbot/multilingual-chatbot.ts
export class MultilingualHRChatbot {
  private detectLanguage(message: string): string {
    // 언어 감지 로직
    if (/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(message)) return 'ko';
    return 'en';
  }

  async chat(message: string): Promise<string> {
    const language = this.detectLanguage(message);
    const prompt = language === 'ko' ? this.koreanPrompt : this.englishPrompt;
    
    // 언어별 처리 로직
  }
}
```

### 2. 음성 인식 지원
```typescript
// components/chatbot/VoiceChatbot.tsx
export default function VoiceChatbot() {
  const [isListening, setIsListening] = useState(false);

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'ko-KR';
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        // 음성을 텍스트로 변환 후 챗봇에 전송
        sendMessage(transcript);
      };
      recognition.start();
    }
  };
}
```

### 3. 파일 업로드 지원
```typescript
// 급여명세서, 계약서 등 파일 분석 기능
export class DocumentAnalysisChatbot {
  async analyzeDocument(file: File): Promise<string> {
    // 파일 내용 추출 및 분석
    const content = await this.extractTextFromFile(file);
    
    const prompt = `
다음 HR 문서를 분석해주세요:
${content}

분석 결과를 한국어로 요약해주세요.
`;

    return await this.chat(prompt);
  }
}
```

## 데이터베이스 스키마

```sql
-- 챗봇 대화 기록 테이블
CREATE TABLE chat_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  user_message TEXT NOT NULL,
  bot_response TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- HR 정책 문서 테이블
CREATE TABLE hr_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category VARCHAR(100),
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 챗봇 설정 테이블
CREATE TABLE chatbot_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  language VARCHAR(10) DEFAULT 'ko',
  voice_enabled BOOLEAN DEFAULT false,
  notification_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 보안 및 개인정보 보호

### 1. 민감 정보 필터링
```typescript
export class SecureHRChatbot {
  private filterSensitiveInfo(message: string): string {
    // 주민번호, 계좌번호 등 민감 정보 마스킹
    return message
      .replace(/\d{6}-\d{7}/g, '******-*******') // 주민번호
      .replace(/\d{3}-\d{2}-\d{6}/g, '***-**-******'); // 계좌번호
  }

  async chat(message: string): Promise<string> {
    const filteredMessage = this.filterSensitiveInfo(message);
    // 처리 로직
  }
}
```

### 2. 접근 권한 제어
```typescript
// 사용자 권한에 따른 답변 제한
export class RoleBasedChatbot {
  async chat(message: string, userRole: string): Promise<string> {
    if (userRole === 'employee') {
      // 일반 직원은 개인 정보만 조회 가능
    } else if (userRole === 'hr_manager') {
      // HR 담당자는 모든 정보 접근 가능
    }
  }
}
```

## 성능 최적화

### 1. 응답 캐싱
```typescript
// 자주 묻는 질문에 대한 캐싱
const responseCache = new Map<string, string>();

export class CachedChatbot {
  async chat(message: string): Promise<string> {
    const cacheKey = this.generateCacheKey(message);
    
    if (responseCache.has(cacheKey)) {
      return responseCache.get(cacheKey)!;
    }

    const response = await this.generateResponse(message);
    responseCache.set(cacheKey, response);
    
    return response;
  }
}
```

### 2. 스트리밍 응답
```typescript
// 긴 답변을 실시간으로 스트리밍
export class StreamingChatbot {
  async *chatStream(message: string): AsyncGenerator<string> {
    const stream = await this.llm.stream(message);
    
    for await (const chunk of stream) {
      yield chunk.content;
    }
  }
}
```

## 모니터링 및 분석

### 1. 사용량 추적
```typescript
// 챗봇 사용 통계 수집
export class AnalyticsChatbot {
  async chat(message: string): Promise<string> {
    // 사용량 기록
    await this.trackUsage({
      message_length: message.length,
      response_time: Date.now(),
      user_satisfaction: null, // 나중에 피드백으로 업데이트
    });

    return await this.generateResponse(message);
  }
}
```

### 2. 품질 개선
```typescript
// 사용자 피드백 수집
export class FeedbackChatbot {
  async collectFeedback(messageId: string, rating: number, comment?: string) {
    await this.supabase.from('chat_feedback').insert({
      message_id: messageId,
      rating,
      comment,
      created_at: new Date().toISOString(),
    });
  }
}
```

## 결론

LangChain을 활용한 HR 챗봇 도입으로 다음과 같은 효과를 기대할 수 있습니다:

### 장점
1. **24/7 지원**: 언제든지 HR 관련 질문 응답
2. **업무 효율성**: 반복적인 질문 자동 처리
3. **일관된 답변**: 정확하고 일관된 정보 제공
4. **비용 절감**: HR 담당자의 업무 부담 감소

### 주의사항
1. **개인정보 보호**: 민감한 정보 처리 시 각별한 주의
2. **정확성 검증**: AI 답변의 정확성 지속적 모니터링
3. **사용자 교육**: 챗봇 한계와 올바른 사용법 안내
4. **지속적 개선**: 사용자 피드백을 통한 성능 향상

이러한 체계적인 접근을 통해 HR 관리 시스템에 효과적인 AI 챗봇을 성공적으로 도입할 수 있습니다.
