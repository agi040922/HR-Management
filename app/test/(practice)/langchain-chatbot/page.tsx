'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Send, Bot, User, Code, Database, Zap, Brain, Settings, Play } from 'lucide-react';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: 'text' | 'code' | 'error';
}

interface ChatbotDemo {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  systemPrompt: string;
  examples: string[];
  features: string[];
}

export default function LangChainChatbotTestPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDemo, setSelectedDemo] = useState<string>('hr-assistant');
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const chatbotDemos: ChatbotDemo[] = [
    {
      id: 'hr-assistant',
      name: 'HR 어시스턴트',
      description: '직원 관리, 급여, 정책 관련 질문에 답변하는 HR 전문 챗봇',
      icon: <User className="w-5 h-5" />,
      systemPrompt: `당신은 HR 관리 시스템의 전문 AI 어시스턴트입니다.
한국의 노동법과 회사 정책에 맞는 정확한 정보를 제공하고,
급여, 근무시간, 휴가 등에 대한 질문에 친절하게 답변해주세요.
개인정보는 절대 요구하지 않으며, 확실하지 않은 정보는 "담당자에게 문의하세요"라고 안내해주세요.`,
      examples: [
        '2025년 최저시급이 얼마인가요?',
        '주휴수당은 어떻게 계산하나요?',
        '연차 사용 규정을 알려주세요',
        '4대보험 요율이 어떻게 되나요?'
      ],
      features: ['한국 노동법 기반', '급여 계산 도움', '정책 안내', '친절한 응답']
    },
    {
      id: 'payroll-calculator',
      name: '급여 계산 도우미',
      description: '복잡한 급여 계산을 도와주는 전문 챗봇',
      icon: <Database className="w-5 h-5" />,
      systemPrompt: `당신은 급여 계산 전문가입니다.
2025년 기준 최저시급 10,030원을 기준으로 하여,
근무시간, 4대보험, 소득세, 지방세를 정확히 계산해주세요.
계산 과정을 단계별로 설명하고, 최종 실수령액을 명확히 제시해주세요.`,
      examples: [
        '주 40시간 근무 시 월급을 계산해주세요',
        '시급 12,000원으로 주 25시간 근무하면 얼마인가요?',
        '4대보험 공제액을 자세히 알려주세요',
        '세전 300만원의 실수령액은 얼마인가요?'
      ],
      features: ['정확한 계산', '단계별 설명', '2025년 기준', '실수령액 계산']
    },
    {
      id: 'schedule-optimizer',
      name: '일정 최적화 도우미',
      description: '직원 스케줄링과 근무 일정 최적화를 도와주는 챗봇',
      icon: <Zap className="w-5 h-5" />,
      systemPrompt: `당신은 직원 스케줄링 전문가입니다.
효율적인 근무 일정 배치, 교대 근무 계획, 휴가 관리 등을 도와주세요.
노동법을 준수하면서도 업무 효율성을 높일 수 있는 방안을 제시해주세요.`,
      examples: [
        '3교대 근무 스케줄을 어떻게 짜야 하나요?',
        '직원 5명으로 주 7일 운영하려면?',
        '야간 근무 시 주의사항은?',
        '휴가철 인력 배치 방법은?'
      ],
      features: ['스케줄 최적화', '교대 근무 계획', '노동법 준수', '효율성 향상']
    },
    {
      id: 'policy-guide',
      name: '정책 안내 도우미',
      description: '회사 정책과 규정을 안내하는 챗봇',
      icon: <Settings className="w-5 h-5" />,
      systemPrompt: `당신은 회사 정책 전문 안내자입니다.
취업규칙, 인사규정, 복리후생, 교육 제도 등 회사의 모든 정책을 
명확하고 이해하기 쉽게 설명해주세요. 
정책 변경사항이나 예외 상황에 대해서도 안내해주세요.`,
      examples: [
        '신입사원 교육 과정은 어떻게 되나요?',
        '재택근무 정책을 알려주세요',
        '경조사 휴가는 며칠인가요?',
        '승진 평가 기준이 궁금합니다'
      ],
      features: ['정책 해석', '규정 안내', '예외 상황 처리', '변경사항 알림']
    }
  ];

  const implementationSteps = [
    {
      step: 1,
      title: 'LangChain 설치',
      description: 'JavaScript용 LangChain 라이브러리 설치',
      code: `npm install langchain @langchain/openai @langchain/core
npm install @langchain/community  # 추가 기능용`
    },
    {
      step: 2,
      title: '환경 변수 설정',
      description: 'OpenAI API 키 및 기타 설정',
      code: `# .env.local
OPENAI_API_KEY=your_openai_api_key_here
LANGCHAIN_TRACING_V2=true
LANGCHAIN_API_KEY=your_langchain_api_key_here`
    },
    {
      step: 3,
      title: '기본 챗봇 구현',
      description: 'ChatOpenAI와 ConversationChain 사용',
      code: `import { ChatOpenAI } from "@langchain/openai";
import { ConversationChain } from "langchain/chains";
import { BufferMemory } from "langchain/memory";

const model = new ChatOpenAI({
  modelName: "gpt-3.5-turbo",
  temperature: 0.7,
});

const memory = new BufferMemory();
const chain = new ConversationChain({
  llm: model,
  memory: memory,
});`
    },
    {
      step: 4,
      title: 'API 라우트 생성',
      description: 'Next.js API 라우트로 챗봇 엔드포인트 구현',
      code: `// app/api/chatbot/route.ts
export async function POST(request: NextRequest) {
  const { message } = await request.json();
  const response = await chatbot.chat(message);
  return NextResponse.json({ response });
}`
    }
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // 선택된 데모에 따라 초기 메시지 설정
    const demo = chatbotDemos.find(d => d.id === selectedDemo);
    if (demo) {
      setMessages([{
        id: '1',
        content: `안녕하세요! 저는 ${demo.name}입니다. ${demo.description} 무엇을 도와드릴까요?`,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      }]);
    }
  }, [selectedDemo]);

  const sendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date(),
      type: 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // 실제 구현에서는 API 호출
      // const response = await fetch('/api/chatbot', { ... });
      
      // 데모용 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));
      
      const demo = chatbotDemos.find(d => d.id === selectedDemo);
      const botResponse = generateDemoResponse(inputValue, demo);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: botResponse,
        isUser: false,
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('챗봇 오류:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: '죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해주세요.',
        isUser: false,
        timestamp: new Date(),
        type: 'error'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateDemoResponse = (input: string, demo?: ChatbotDemo): string => {
    const lowerInput = input.toLowerCase();
    
    if (demo?.id === 'hr-assistant') {
      if (lowerInput.includes('최저시급')) {
        return '2025년 최저시급은 시간당 10,030원입니다. 이는 2024년 9,860원에서 1.7% 인상된 금액입니다.';
      }
      if (lowerInput.includes('주휴수당')) {
        return '주휴수당은 주 15시간 이상 근무하는 근로자에게 지급되며, 1주일 동안의 소정근로시간을 평균한 시간에 대해 통상임금을 지급합니다.';
      }
      if (lowerInput.includes('연차')) {
        return '연차휴가는 1년간 80% 이상 출근한 근로자에게 15일(1년 미만 근무자는 월 1일씩)이 주어집니다. 미사용 연차는 다음 해로 이월 가능합니다.';
      }
    }
    
    if (demo?.id === 'payroll-calculator') {
      if (lowerInput.includes('40시간') || lowerInput.includes('월급')) {
        return `주 40시간 근무 기준 계산:
- 월 근무시간: 40시간 × 4.3주 = 172시간
- 세전 급여: 172시간 × 10,030원 = 1,725,160원
- 4대보험 공제: 약 173,000원
- 소득세: 약 57,000원
- 실수령액: 약 1,495,000원

*정확한 계산은 개인별 공제 항목에 따라 달라질 수 있습니다.`;
      }
    }
    
    return `${demo?.name || '챗봇'}이 "${input}"에 대해 답변드리겠습니다. 실제 구현에서는 LangChain과 OpenAI API를 통해 더 정확하고 상세한 답변을 제공할 수 있습니다.`;
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const tryExample = (example: string) => {
    setInputValue(example);
  };

  return (
    <div className="container mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">LangChain 챗봇 구현 테스트</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          LangChain을 활용한 AI 챗봇 구현 방법을 학습하고 실제로 테스트해볼 수 있는 페이지입니다.
          다양한 유형의 챗봇을 체험하고 구현 방법을 배워보세요.
        </p>
      </div>

      {/* 챗봇 데모 선택 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Bot className="w-6 h-6" />
          챗봇 데모 선택
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {chatbotDemos.map((demo) => (
            <Card 
              key={demo.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedDemo === demo.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedDemo(demo.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {demo.icon}
                  {demo.name}
                </CardTitle>
                <CardDescription>{demo.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">주요 기능:</h4>
                    <div className="flex flex-wrap gap-2">
                      {demo.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">예시 질문:</h4>
                    <div className="space-y-1">
                      {demo.examples.slice(0, 2).map((example, index) => (
                        <button
                          key={index}
                          onClick={(e) => {
                            e.stopPropagation();
                            tryExample(example);
                          }}
                          className="block text-left text-sm text-blue-600 hover:underline"
                        >
                          "{ example }"
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 챗봇 인터페이스 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <MessageCircle className="w-6 h-6" />
          챗봇 테스트 인터페이스
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 채팅 영역 */}
          <div className="lg:col-span-2">
            <Card className="h-96 flex flex-col">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  {chatbotDemos.find(d => d.id === selectedDemo)?.icon}
                  {chatbotDemos.find(d => d.id === selectedDemo)?.name}
                </CardTitle>
              </CardHeader>
              
              {/* 메시지 영역 */}
              <CardContent className="flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg text-sm ${
                          message.isUser
                            ? 'bg-blue-600 text-white'
                            : message.type === 'error'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        <div className="whitespace-pre-wrap">{message.content}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {message.timestamp.toLocaleTimeString()}
                        </div>
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
              </CardContent>
            </Card>
          </div>

          {/* 예시 질문 및 설정 */}
          <div className="space-y-6">
            {/* 예시 질문 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">예시 질문</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {chatbotDemos.find(d => d.id === selectedDemo)?.examples.map((example, index) => (
                    <button
                      key={index}
                      onClick={() => tryExample(example)}
                      className="block w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 시스템 프롬프트 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">시스템 프롬프트</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={chatbotDemos.find(d => d.id === selectedDemo)?.systemPrompt || ''}
                  readOnly
                  className="text-xs h-32"
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 구현 단계 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Code className="w-6 h-6" />
          구현 단계
        </h2>
        
        <div className="space-y-4">
          {implementationSteps.map((step) => (
            <Card key={step.step}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Badge variant="outline">{step.step}</Badge>
                  {step.title}
                </CardTitle>
                <CardDescription>{step.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto text-sm">
                  {step.code}
                </pre>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 고급 기능 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Brain className="w-6 h-6" />
          고급 기능
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>RAG (검색 증강 생성)</CardTitle>
              <CardDescription>
                외부 문서나 데이터베이스를 검색하여 더 정확한 답변 제공
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { RetrievalQAChain } from "langchain/chains";
import { MemoryVectorStore } from "langchain/vectorstores/memory";

const vectorStore = await MemoryVectorStore.fromTexts(
  documents, embeddings
);
const chain = RetrievalQAChain.fromLLM(
  model, vectorStore.asRetriever()
);`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>메모리 관리</CardTitle>
              <CardDescription>
                대화 기록을 저장하여 컨텍스트 유지
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { BufferMemory } from "langchain/memory";
import { ConversationChain } from "langchain/chains";

const memory = new BufferMemory();
const chain = new ConversationChain({
  llm: model,
  memory: memory,
});`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>도구 연동</CardTitle>
              <CardDescription>
                외부 API나 함수를 호출하여 실시간 데이터 활용
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`import { DynamicTool } from "langchain/tools";

const payrollTool = new DynamicTool({
  name: "payroll-calculator",
  description: "급여 계산",
  func: async (input) => {
    return calculatePayroll(input);
  },
});`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>스트리밍 응답</CardTitle>
              <CardDescription>
                실시간으로 응답을 스트리밍하여 사용자 경험 향상
              </CardDescription>
            </CardHeader>
            <CardContent>
              <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`const stream = await model.stream(message);
for await (const chunk of stream) {
  process.stdout.write(chunk.content);
}`}
              </pre>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 실습 과제 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">실습 과제</h2>
        
        <Card>
          <CardHeader>
            <CardTitle>직접 구현해보기</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• OpenAI API 키를 발급받아 실제 챗봇 구현</li>
              <li>• Supabase와 연동하여 HR 데이터 기반 RAG 챗봇 구현</li>
              <li>• 음성 인식 기능을 추가한 음성 챗봇 구현</li>
              <li>• 파일 업로드 기능으로 문서 분석 챗봇 구현</li>
              <li>• 다국어 지원 챗봇 구현</li>
              <li>• 사용자 피드백 시스템 구현</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* 주의사항 */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">주의사항 및 베스트 프랙티스</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-700">✅ 해야 할 것</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• API 키 보안 관리</li>
                <li>• 사용자 입력 검증</li>
                <li>• 응답 시간 최적화</li>
                <li>• 오류 처리 구현</li>
                <li>• 사용량 모니터링</li>
                <li>• 개인정보 보호</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-red-700">❌ 하지 말아야 할 것</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li>• 클라이언트에 API 키 노출</li>
                <li>• 무제한 API 호출 허용</li>
                <li>• 민감 정보 로깅</li>
                <li>• 검증되지 않은 응답 제공</li>
                <li>• 과도한 토큰 사용</li>
                <li>• 사용자 데이터 무단 저장</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
