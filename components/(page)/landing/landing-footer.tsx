'use client'

import React from 'react'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react'

const footerLinks = {
  product: [
    { name: '근무일정', href: '#' },
    { name: '출퇴근기록', href: '#' },
    { name: '휴가관리', href: '#' },
    { name: '전자결재', href: '#' },
    { name: '메시지', href: '#' },
    { name: '전자계약', href: '#' },
    { name: '근태정산', href: '#' },
    { name: '연동', href: '#' },
    { name: '모바일 앱', href: '#' },
    { name: '시프티 데스크탑', href: '#' }
  ],
  solution: [
    { name: '엔터프라이즈', href: '#' },
    { name: '스타트업', href: '#' },
    { name: '주 52시간제', href: '#' },
    { name: '유연근무제', href: '#' },
    { name: '원격근무 / 재택근무', href: '#' },
    { name: 'PC오프제', href: '#' },
    { name: '주 52시간제 백서', href: '#' },
    { name: '휴가 백서', href: '#' },
    { name: '산업별 솔루션', href: '#' }
  ],
  resources: [
    { name: '고객센터', href: '#' },
    { name: '비디오 가이드', href: '#' },
    { name: '용어사전', href: '#' },
    { name: '보안', href: '#' }
  ],
  calculator: [
    { name: '주휴수당 계산기', href: '#' },
    { name: '연차 계산기', href: '#' },
    { name: '연차수당 계산기', href: '#' },
    { name: '퇴직금 계산기', href: '#' },
    { name: '4대보험료 계산기', href: '#' }
  ],
  company: [
    { name: '회사소개', href: '#' },
    { name: '블로그', href: '#' },
    { name: '도입문의', href: '#' },
    { name: '제휴 및 비즈니스 제안', href: '#' }
  ]
}

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* 메인 푸터 콘텐츠 */}
        <div className="grid lg:grid-cols-6 gap-8">
          {/* 회사 정보 */}
          <div className="lg:col-span-2">
            <div className="text-2xl font-bold text-blue-400 mb-6">SHIFTEE</div>
            <p className="text-gray-300 mb-6 leading-relaxed">
              시간과 비용을 절감하세요.<br />
              지금. 인사업무 변화가 시작됩니다.
            </p>
            
            {/* 연락처 정보 */}
            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-blue-400" />
                <span className="text-gray-300">(+82)02-6261-5319</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-blue-400" />
                <span className="text-gray-300">contact@shiftee.io</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-400" />
                <span className="text-gray-300">서울특별시 강남구 선릉로 818, 5층</span>
              </div>
            </div>

            {/* 소셜 미디어 */}
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 hover:bg-blue-600 rounded-lg flex items-center justify-center transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* 제품소개 */}
          <div>
            <h3 className="font-semibold text-white mb-4">제품소개</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 솔루션 */}
          <div>
            <h3 className="font-semibold text-white mb-4">솔루션</h3>
            <ul className="space-y-2">
              {footerLinks.solution.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* 리소스 */}
          <div>
            <h3 className="font-semibold text-white mb-4">리소스</h3>
            <ul className="space-y-2 mb-6">
              {footerLinks.resources.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>

            <h3 className="font-semibold text-white mb-4">자동계산기</h3>
            <ul className="space-y-2">
              {footerLinks.calculator.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* SHIFTEE */}
          <div>
            <h3 className="font-semibold text-white mb-4">SHIFTEE</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors text-sm">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 하단 구분선 */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* 회사 정보 */}
            <div className="text-sm text-gray-400">
              <div className="mb-2">
                <span className="mr-4">주식회사 시프티</span>
                <span className="mr-4">대표: 신승원</span>
              </div>
              <div className="mb-2">
                <span className="mr-4">사업자등록번호: 537-88-00567</span>
                <span>통신판매업신고번호: 2021-서울강남-05577</span>
              </div>
            </div>

            {/* 언어 선택 및 링크 */}
            <div className="flex items-center gap-6">
              <div className="flex gap-4 text-sm">
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">이용약관</a>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">개인정보처리방침</a>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-gray-400 text-sm">한국어</span>
                <div className="w-6 h-4 bg-gray-600 rounded-sm"></div>
              </div>
            </div>
          </div>

          {/* 저작권 */}
          <div className="text-center mt-8 pt-8 border-t border-gray-800">
            <p className="text-gray-400 text-sm">
              © 2024 SHIFTEE. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
