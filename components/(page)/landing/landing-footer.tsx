'use client'

import React from 'react'
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone, MapPin, Globe } from 'lucide-react'

const footerLinks = {
  company: [
    { name: '이용약관', href: '#' },
    { name: '위치기반서비스 이용약관', href: '#' },
    { name: '개인정보 처리방침', href: '#' },
    { name: '전자서명 가입안내', href: '#' },
    { name: '서비스약관', href: '#' },
    { name: '분쟁해결기준', href: '#' }
  ]
}

export default function LandingFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      {/* 하단 링크 네비게이션 */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <nav>
            <ul className="flex flex-wrap gap-6 text-sm">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <a href={link.href} className="text-gray-300 hover:text-blue-400 transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 회사 정보 섹션 */}
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          {/* (주)FAIR 유니버스 사업자 정보 */}
          <div>
            <h3 className="font-semibold text-white mb-4">(주)FAIR 유니버스 사업자 정보</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>주소: 경기도 성남시 수정구 금토로 70 (금토동, 텐엑스타워)</p>
              <p>
                사업자등록번호: 824-81-02515 
                <button className="ml-2 underline hover:text-blue-400 transition-colors">사업자정보확인</button>
              </p>
              <p>통신판매업신고: 2024-성남수정-0912</p>
              <p>HR서비스증 등록번호: 제2024-000024호</p>
              <p>호스팅서비스제공자: (주)FAIR 유니버스｜ 대표이사: 배보찬, 최휘영</p>
            </div>
          </div>

          {/* 고객센터 */}
          <div>
            <h3 className="font-semibold text-white mb-4">고객센터</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">HR솔루션</span>
                <a href="tel:1588-3443" className="text-white hover:text-blue-400 transition-colors">1588-3443</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">인사노무</span>
                <a href="tel:1544-1555" className="text-white hover:text-blue-400 transition-colors">1544-1555</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">팩스</span>
                <a href="tel:02-830-7807" className="text-white hover:text-blue-400 transition-colors">02-830-7807</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">이메일</span>
                <a href="mailto:help.fair@fair-universe.com" className="text-white hover:text-blue-400 transition-colors">help.fair@fair-universe.com</a>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">급여계산</span>
                  <a href="tel:02-3479-4399" className="text-white hover:text-blue-400 transition-colors">02-3479-4399</a>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">근태관리</span>
                  <a href="tel:02-3479-4340" className="text-white hover:text-blue-400 transition-colors">02-3479-4340</a>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                <div className="flex justify-between">
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">HR솔루션 1:1문의</a>
                </div>
                <div className="flex justify-between">
                  <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">인사노무 1:1문의</a>
                </div>
              </div>
            </div>
          </div>

          {/* 전자금융거래 분쟁처리 담당정보 */}
          <div>
            <h3 className="font-semibold text-white mb-4">전자금융거래 분쟁처리 담당정보</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">HR솔루션</span>
                <a href="tel:1588-3443" className="text-white hover:text-blue-400 transition-colors">1588-3443</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">인사노무</span>
                <a href="tel:1544-1555" className="text-white hover:text-blue-400 transition-colors">1544-1555</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">팩스</span>
                <a href="tel:02-830-8295" className="text-white hover:text-blue-400 transition-colors">02-830-8295</a>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">이메일</span>
                <a href="mailto:fair_ef@fair-universe.com" className="text-white hover:text-blue-400 transition-colors">fair_ef@fair-universe.com</a>
              </div>
              <div className="mt-4">
                <a href="mailto:privacy_i@fair-universe.com" className="text-blue-400 hover:text-blue-300 transition-colors">개인정보보호책임자 privacy_i@fair-universe.com</a>
              </div>
            </div>
          </div>
        </div>

        {/* 면책조항 */}
        <div className="border-t border-gray-800 pt-8">
          <p className="text-sm text-gray-400 mb-4">
            (주)FAIR 유니버스는 일부 상품의 통신판매중개자로서 통신판매의 당사자가 아니므로, 
            상품의 예약, 이용 및 환불 등 거래와 관련된 의무와 책임은 판매자에게 있으며 
            (주)FAIR 유니버스는 일체 책임을 지지 않습니다.
          </p>
          <p className="text-sm text-gray-400">
            ⓒ Fair Universe Co., Ltd. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
