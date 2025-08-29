'use client'

import React from 'react'
import Link from 'next/link'

export default function LandingFooter() {
  return (
    <footer className="bg-white border-t border-gray-200">
      {/* 메인 푸터 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* 회사 정보 */}
          <div className="col-span-1 md:col-span-2">
            <div className="mb-4">
              <span className="text-xl font-bold text-gray-900">FAIR인사노무</span>
            </div>
            <p className="text-gray-600 mb-6 max-w-md">
              스마트한 HR 관리 솔루션으로 더 효율적인 인사관리를 경험하세요. 
              전국 1,000여 기업이 선택한 믿을 수 있는 인사노무 파트너입니다.
            </p>
            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p><strong>주소:</strong> 서울특별시 강남구 테헤란로 123 (역삼동, FAIR빌딩) 15층</p>
              <p><strong>사업자등록번호:</strong> 123-45-67890 
                <button className="ml-2 text-blue-600 hover:underline">사업자정보확인</button>
              </p>
              <p><strong>통신판매업신고:</strong> 2025-서울강남-0001</p>
              <p><strong>인사노무서비스 등록번호:</strong> 제2025-000123호</p>
              <p><strong>호스팅서비스제공자:</strong> (주)FAIR인사노무 | 대표이사: 김대표</p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Facebook</span>
                📘
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Instagram</span>
                📷
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">YouTube</span>
                📺
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                <span className="sr-only">Blog</span>
                📝
              </a>
            </div>
          </div>

          {/* 서비스 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">서비스</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600 transition-colors flex items-center">근태관리 <span className="ml-1 text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">인기</span></Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">급여관리</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">인사관리</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">전자계약</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">성과관리</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">채용관리</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">교육관리</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">분석리포트</Link></li>
            </ul>
          </div>

          {/* 고객지원 */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">고객지원</h3>
            <ul className="space-y-3 text-sm text-gray-600">
              <li><Link href="#" className="hover:text-blue-600 transition-colors">공지사항</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">자주묻는질문</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">1:1 문의</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">이용가이드</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">API 문서</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">원격지원</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">교육신청</Link></li>
              <li><Link href="#" className="hover:text-blue-600 transition-colors">제휴문의</Link></li>
            </ul>
          </div>
        </div>

        {/* 고객센터 정보 */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">고객센터</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>HR솔루션:</strong> <a href="tel:1588-3443" className="text-blue-600 hover:underline">1588-3443</a></p>
                <p><strong>인사노무:</strong> <a href="tel:1544-1555" className="text-blue-600 hover:underline">1544-1555</a></p>
                <p><strong>팩스:</strong> <a href="tel:02-830-7807" className="text-blue-600 hover:underline">02-830-7807</a></p>
                <p><strong>이메일:</strong> <a href="mailto:help.fair@fair-universe.com" className="text-blue-600 hover:underline">help.fair@fair-universe.com</a></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">운영시간</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>평일:</strong> 09:00 ~ 18:00</p>
                <p><strong>토요일:</strong> 09:00 ~ 13:00</p>
                <p><strong>일요일 및 공휴일:</strong> 휴무</p>
                <p><strong>점심시간:</strong> 12:00 ~ 13:00</p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">전자금융거래 분쟁처리</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>HR솔루션:</strong> <a href="tel:1588-3443" className="text-blue-600 hover:underline">1588-3443</a></p>
                <p><strong>인사노무:</strong> <a href="tel:1544-1555" className="text-blue-600 hover:underline">1544-1555</a></p>
                <p><strong>팩스:</strong> <a href="tel:02-830-8295" className="text-blue-600 hover:underline">02-830-8295</a></p>
                <p><strong>이메일:</strong> <a href="mailto:fair_ef@fair-universe.com" className="text-blue-600 hover:underline">fair_ef@fair-universe.com</a></p>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">개인정보보호책임자</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <p><strong>이름:</strong> 김개인정보</p>
                <p><strong>이메일:</strong> <a href="mailto:privacy_i@fair-universe.com" className="text-blue-600 hover:underline">privacy_i@fair-universe.com</a></p>
                <p><strong>전화:</strong> <a href="tel:02-1234-5678" className="text-blue-600 hover:underline">02-1234-5678</a></p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 하단 링크 및 저작권 */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <nav className="flex flex-wrap items-center space-x-6 mb-4 md:mb-0">
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">회사소개</Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">이용약관</Link>
              <Link href="#" className="text-sm font-semibold text-gray-900 hover:text-blue-600 transition-colors">개인정보처리방침</Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">위치기반서비스 이용약관</Link>
              <Link href="#" className="text-sm text-gray-600 hover:text-blue-600 transition-colors">사업자정보확인</Link>
            </nav>
            <p className="text-sm text-gray-500">
              2025 FAIR HR Co., Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* 면책조항 */}
      <div className="bg-gray-100 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <p className="text-xs text-gray-500 text-center">
            (주)FAIR HR은 통신판매중개자로서 통신판매의 당사자가 아니므로, 상품의 예약, 이용 및 환불 등과 관련된 의무와 책임은 각 판매자에게 있습니다.
          </p>
        </div>
      </div>
    </footer>
  )
}
