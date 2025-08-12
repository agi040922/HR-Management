/**
 * 전자서명 관련 유틸리티 함수들
 * Supabase Storage 연동 로직 포함
 */

import { supabase } from '@/lib/supabase';

// 서명 데이터 타입 정의
export interface SignatureData {
  id: string;
  contractId: string;
  signerType: 'employer' | 'employee';
  signerName: string;
  signatureImageUrl: string;
  signedAt: Date;
  ipAddress?: string;
  userAgent?: string;
}

export interface SignaturePadOptions {
  width: number;
  height: number;
  backgroundColor: string;
  penColor: string;
  penWidth: number;
}

/**
 * Canvas 서명 패드에서 서명 이미지를 base64로 변환
 */
export function canvasToBase64(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL('image/png');
}

/**
 * base64 이미지를 Blob으로 변환
 */
export function base64ToBlob(base64: string): Blob {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: 'image/png' });
}

/**
 * Supabase Storage에 서명 이미지 업로드
 */
export async function uploadSignatureToStorage(
  contractId: string,
  signerType: 'employer' | 'employee',
  signatureBase64: string
): Promise<string> {
  try {
    const blob = base64ToBlob(signatureBase64);
    const fileName = `${contractId}_${signerType}_${Date.now()}.png`;
    const filePath = `signatures/${fileName}`;

    const { data, error } = await supabase.storage
      .from('labor-contracts')
      .upload(filePath, blob, {
        contentType: 'image/png',
        upsert: false
      });

    if (error) {
      throw new Error(`서명 이미지 업로드 실패: ${error.message}`);
    }

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('labor-contracts')
      .getPublicUrl(filePath);

    return urlData.publicUrl;
  } catch (error) {
    console.error('서명 업로드 오류:', error);
    throw error;
  }
}

/**
 * 서명 데이터를 데이터베이스에 저장
 */
export async function saveSignatureData(signatureData: Omit<SignatureData, 'id'>): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('contract_signatures')
      .insert([{
        contract_id: signatureData.contractId,
        signer_type: signatureData.signerType,
        signer_name: signatureData.signerName,
        signature_image_url: signatureData.signatureImageUrl,
        signed_at: signatureData.signedAt.toISOString(),
        ip_address: signatureData.ipAddress,
        user_agent: signatureData.userAgent
      }])
      .select('id')
      .single();

    if (error) {
      throw new Error(`서명 데이터 저장 실패: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('서명 데이터 저장 오류:', error);
    throw error;
  }
}

/**
 * 계약서 서명 완료 처리
 */
export async function completeContractSigning(
  contractId: string,
  employerSignature: string,
  employeeSignature: string
): Promise<void> {
  try {
    // 계약서 상태를 '서명 완료'로 업데이트
    const { error } = await supabase
      .from('labor_contracts')
      .update({
        status: 'signed',
        employer_signature_url: employerSignature,
        employee_signature_url: employeeSignature,
        signed_at: new Date().toISOString()
      })
      .eq('id', contractId);

    if (error) {
      throw new Error(`계약서 서명 완료 처리 실패: ${error.message}`);
    }
  } catch (error) {
    console.error('계약서 서명 완료 처리 오류:', error);
    throw error;
  }
}

/**
 * 서명된 계약서 조회
 */
export async function getSignedContract(contractId: string) {
  try {
    const { data, error } = await supabase
      .from('labor_contracts')
      .select(`
        *,
        contract_signatures (*)
      `)
      .eq('id', contractId)
      .eq('status', 'signed')
      .single();

    if (error) {
      throw new Error(`서명된 계약서 조회 실패: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('서명된 계약서 조회 오류:', error);
    throw error;
  }
}

/**
 * 서명 검증 (무결성 확인)
 */
export async function verifySignature(signatureId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('contract_signatures')
      .select('*')
      .eq('id', signatureId)
      .single();

    if (error || !data) {
      return false;
    }

    // 서명 이미지 URL이 유효한지 확인
    const response = await fetch(data.signature_image_url);
    return response.ok;
  } catch (error) {
    console.error('서명 검증 오류:', error);
    return false;
  }
}

/**
 * 서명 패드 기본 설정
 */
export const DEFAULT_SIGNATURE_OPTIONS: SignaturePadOptions = {
  width: 400,
  height: 200,
  backgroundColor: '#ffffff',
  penColor: '#000000',
  penWidth: 2
};

/**
 * 브라우저 정보 수집 (서명 시 기록용)
 */
export function getBrowserInfo() {
  return {
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  };
}
