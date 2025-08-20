'use client';

import React, { useRef, useState, useEffect } from 'react';
import { 
  canvasToBase64, 
  uploadSignatureToStorage, 
  saveSignatureData, 
  completeContractSigning,
  DEFAULT_SIGNATURE_OPTIONS,
  getBrowserInfo 
} from '@/lib/signature-utils';

interface SignatureTestData {
  contractId: string;
  employerName: string;
  employeeName: string;
  employerSignature?: string;
  employeeSignature?: string;
}

export default function SignatureTestPage() {
  const employerCanvasRef = useRef<HTMLCanvasElement>(null);
  const employeeCanvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [activeCanvas, setActiveCanvas] = useState<'employer' | 'employee' | null>(null);
  const [testData, setTestData] = useState<SignatureTestData>({
    contractId: `test-contract-${Date.now()}`,
    employerName: '김사장',
    employeeName: '이직원'
  });
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<string[]>([]);

  // Canvas 초기화
  useEffect(() => {
    initializeCanvas(employerCanvasRef.current);
    initializeCanvas(employeeCanvasRef.current);
  }, []);

  const initializeCanvas = (canvas: HTMLCanvasElement | null) => {
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Canvas 크기 설정
    canvas.width = DEFAULT_SIGNATURE_OPTIONS.width;
    canvas.height = DEFAULT_SIGNATURE_OPTIONS.height;
    
    // 배경색 설정
    ctx.fillStyle = DEFAULT_SIGNATURE_OPTIONS.backgroundColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 펜 설정
    ctx.strokeStyle = DEFAULT_SIGNATURE_OPTIONS.penColor;
    ctx.lineWidth = DEFAULT_SIGNATURE_OPTIONS.penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>, canvasType: 'employer' | 'employee') => {
    setIsDrawing(true);
    setActiveCanvas(canvasType);
    
    const canvas = canvasType === 'employer' ? employerCanvasRef.current : employeeCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !activeCanvas) return;
    
    const canvas = activeCanvas === 'employer' ? employerCanvasRef.current : employeeCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    setActiveCanvas(null);
  };

  const clearCanvas = (canvasType: 'employer' | 'employee') => {
    const canvas = canvasType === 'employer' ? employerCanvasRef.current : employeeCanvasRef.current;
    initializeCanvas(canvas);
    
    // 서명 데이터 초기화
    setTestData(prev => ({
      ...prev,
      [canvasType === 'employer' ? 'employerSignature' : 'employeeSignature']: undefined
    }));
  };

  const addMessage = (message: string) => {
    setMessages(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const saveSignature = async (canvasType: 'employer' | 'employee') => {
    const canvas = canvasType === 'employer' ? employerCanvasRef.current : employeeCanvasRef.current;
    if (!canvas) return;

    setLoading(true);
    try {
      // 1. Canvas를 base64로 변환
      const signatureBase64 = canvasToBase64(canvas);
      addMessage(`${canvasType} 서명을 base64로 변환 완료`);

      // 2. Storage에 업로드 (실제 Supabase 연결이 없으면 시뮬레이션)
      let imageUrl: string;
      try {
        imageUrl = await uploadSignatureToStorage(
          testData.contractId,
          canvasType,
          signatureBase64
        );
        addMessage(`${canvasType} 서명 이미지 업로드 완료: ${imageUrl}`);
      } catch (error) {
        // Supabase 연결이 없는 경우 시뮬레이션
        imageUrl = `https://example.com/signatures/${testData.contractId}_${canvasType}_${Date.now()}.png`;
        addMessage(`${canvasType} 서명 업로드 시뮬레이션: ${imageUrl}`);
      }

      // 3. 데이터베이스에 저장 (실제 연결이 없으면 시뮬레이션)
      try {
        const signatureId = await saveSignatureData({
          contractId: testData.contractId,
          signerType: canvasType,
          signerName: canvasType === 'employer' ? testData.employerName : testData.employeeName,
          signatureImageUrl: imageUrl,
          signedAt: new Date(),
          ...getBrowserInfo()
        });
        addMessage(`${canvasType} 서명 데이터 저장 완료: ${signatureId}`);
      } catch (error) {
        // 시뮬레이션
        const signatureId = `sig_${Date.now()}_${canvasType}`;
        addMessage(`${canvasType} 서명 데이터 저장 시뮬레이션: ${signatureId}`);
      }

      // 4. 상태 업데이트
      setTestData(prev => ({
        ...prev,
        [canvasType === 'employer' ? 'employerSignature' : 'employeeSignature']: imageUrl
      }));

      addMessage(`${canvasType} 서명 저장 완료!`);
    } catch (error) {
      addMessage(`${canvasType} 서명 저장 실패: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const completeContract = async () => {
    if (!testData.employerSignature || !testData.employeeSignature) {
      addMessage('양측 서명이 모두 필요합니다.');
      return;
    }

    setLoading(true);
    try {
      await completeContractSigning(
        testData.contractId,
        testData.employerSignature,
        testData.employeeSignature
      );
      addMessage('계약서 서명 완료 처리 성공!');
    } catch (error) {
      // 시뮬레이션
      addMessage('계약서 서명 완료 처리 시뮬레이션 성공!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">전자서명 테스트 페이지</h1>
        
        {/* 테스트 정보 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">테스트 계약서 정보</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">계약서 ID</label>
              <input
                type="text"
                value={testData.contractId}
                onChange={(e) => setTestData(prev => ({ ...prev, contractId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">고용주명</label>
                <input
                  type="text"
                  value={testData.employerName}
                  onChange={(e) => setTestData(prev => ({ ...prev, employerName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">근로자명</label>
                <input
                  type="text"
                  value={testData.employeeName}
                  onChange={(e) => setTestData(prev => ({ ...prev, employeeName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 서명 패드들 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* 고용주 서명 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-blue-600">고용주 서명</h3>
            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={employerCanvasRef}
                onMouseDown={(e) => startDrawing(e, 'employer')}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-200 cursor-crosshair"
                style={{ width: '100%', maxWidth: '400px', height: '200px' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => clearCanvas('employer')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                지우기
              </button>
              <button
                onClick={() => saveSignature('employer')}
                disabled={loading}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50"
              >
                {loading ? '저장 중...' : '서명 저장'}
              </button>
            </div>
            {testData.employerSignature && (
              <div className="mt-2 text-sm text-green-600">
                ✓ 고용주 서명 저장 완료
              </div>
            )}
          </div>

          {/* 근로자 서명 */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold mb-4 text-green-600">근로자 서명</h3>
            <div className="border-2 border-gray-300 rounded-lg p-4 mb-4">
              <canvas
                ref={employeeCanvasRef}
                onMouseDown={(e) => startDrawing(e, 'employee')}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                className="border border-gray-200 cursor-crosshair"
                style={{ width: '100%', maxWidth: '400px', height: '200px' }}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => clearCanvas('employee')}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
              >
                지우기
              </button>
              <button
                onClick={() => saveSignature('employee')}
                disabled={loading}
                className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors disabled:opacity-50"
              >
                {loading ? '저장 중...' : '서명 저장'}
              </button>
            </div>
            {testData.employeeSignature && (
              <div className="mt-2 text-sm text-green-600">
                ✓ 근로자 서명 저장 완료
              </div>
            )}
          </div>
        </div>

        {/* 계약 완료 버튼 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-lg font-semibold mb-4">계약서 서명 완료</h3>
          <button
            onClick={completeContract}
            disabled={loading || !testData.employerSignature || !testData.employeeSignature}
            className="px-6 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '처리 중...' : '계약서 서명 완료 처리'}
          </button>
          <p className="text-sm text-gray-600 mt-2">
            양측 서명이 모두 완료되어야 활성화됩니다.
          </p>
        </div>

        {/* 로그 메시지 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">테스트 로그</h3>
          <div className="bg-gray-100 rounded-md p-4 max-h-64 overflow-y-auto">
            {messages.length === 0 ? (
              <p className="text-gray-500">아직 로그가 없습니다.</p>
            ) : (
              messages.map((message, index) => (
                <div key={index} className="text-sm text-gray-700 mb-1">
                  {message}
                </div>
              ))
            )}
          </div>
          <button
            onClick={() => setMessages([])}
            className="mt-2 px-3 py-1 bg-gray-500 text-white text-sm rounded-md hover:bg-gray-600 transition-colors"
          >
            로그 지우기
          </button>
        </div>

        {/* 사용 안내 */}
        <div className="bg-blue-50 rounded-lg p-6 mt-8">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">사용 안내</h3>
          <div className="text-blue-700 space-y-2">
            <p>• 마우스로 서명 패드에 서명을 그려보세요.</p>
            <p>• '서명 저장' 버튼을 클릭하여 서명을 저장합니다.</p>
            <p>• 양측 서명이 완료되면 '계약서 서명 완료 처리' 버튼이 활성화됩니다.</p>
            <p>• 실제 Supabase 연결이 없는 경우 시뮬레이션으로 동작합니다.</p>
            <p>• 모든 과정은 하단 로그에서 확인할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
