'use client'

import React, { useState } from 'react'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'

interface VideoItem {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  category: string
  views: string
  publishedAt: string
}

const categories = [
  { id: 'featured', name: '추천영상', color: 'bg-blue-500' },
  { id: 'hr-solution', name: 'HR 솔루션', color: 'bg-green-500' },
  { id: 'payroll', name: '급여관리', color: 'bg-purple-500' },
  { id: 'attendance', name: '근태관리', color: 'bg-orange-500' },
  { id: 'tutorials', name: '사용법 가이드', color: 'bg-teal-500' },
  { id: 'webinar', name: '웨비나', color: 'bg-indigo-500' }
]

const videoData: { [key: string]: VideoItem[] } = {
  'featured': [
    {
      id: '1',
      title: 'FAIR HR 솔루션 완벽 가이드',
      description: 'AI 기반 인사관리 시스템의 모든 기능을 한눈에 알아보세요',
      thumbnail: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=225&fit=crop',
      duration: '12:35',
      category: 'HR 솔루션',
      views: '2.1만',
      publishedAt: '2일 전'
    },
    {
      id: '2',
      title: '스마트 근태관리로 업무 효율성 200% 향상',
      description: '출퇴근부터 휴가관리까지, 모든 근태업무를 자동화하는 방법',
      thumbnail: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=400&h=225&fit=crop',
      duration: '08:42',
      category: '근태관리',
      views: '1.5만',
      publishedAt: '1주 전'
    },
    {
      id: '3',
      title: '급여계산 자동화로 인사팀 업무량 90% 감소',
      description: '복잡한 급여계산을 AI가 자동으로 처리하는 혁신적인 시스템',
      thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=225&fit=crop',
      duration: '15:20',
      category: '급여관리',
      views: '3.2만',
      publishedAt: '3일 전'
    },
    {
      id: '4',
      title: '전자계약으로 완전한 페이퍼리스 오피스 구현',
      description: '계약서부터 전자서명까지, 모든 계약 프로세스를 디지털로',
      thumbnail: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=225&fit=crop',
      duration: '10:18',
      category: '전자계약',
      views: '967',
      publishedAt: '5일 전'
    }
  ]
}

const VideoThumbnail = ({ video, onClick }: { video: VideoItem, onClick: () => void }) => {
  return (
    <div 
      className="group cursor-pointer"
      onClick={onClick}
    >
      <div className="relative mb-3">
        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
          <div 
            className="w-full h-full bg-cover bg-center bg-gray-300 flex items-center justify-center"
            style={{ backgroundImage: `linear-gradient(45deg, #667eea 0%, #764ba2 100%)` }}
          >
            <div className="text-white text-center">
              <div className="text-4xl mb-2">📹</div>
              <div className="text-sm font-medium">HR 솔루션 데모</div>
            </div>
          </div>
        </div>
        
        {/* 재생 버튼 오버레이 */}
        <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center backdrop-blur-sm">
            <Play className="w-6 h-6 text-gray-900 ml-1" />
          </div>
        </div>

        {/* 재생시간 */}
        <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
          {video.duration}
        </div>

        {/* HOT 배지 (첫 번째 비디오) */}
        {video.id === '1' && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-bold animate-pulse">
            HOT
          </div>
        )}
      </div>

      {/* 비디오 정보 */}
      <div className="space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {video.title}
        </h3>
        <p className="text-sm text-gray-600 line-clamp-2">
          {video.description}
        </p>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>{video.category}</span>
          <div className="flex items-center space-x-2">
            <span>조회수 {video.views}</span>
            <span>•</span>
            <span>{video.publishedAt}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VideoSection() {
  const [activeCategory, setActiveCategory] = useState('featured')
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null)
  const [isPlayerOpen, setIsPlayerOpen] = useState(false)

  const currentVideos = videoData[activeCategory] || videoData['featured']
  const mainVideo = currentVideos[0]
  const sideVideos = currentVideos.slice(1)

  const handleVideoClick = (video: VideoItem) => {
    setSelectedVideo(video)
    setIsPlayerOpen(true)
  }

  const closePlayer = () => {
    setIsPlayerOpen(false)
    setSelectedVideo(null)
  }

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 섹션 헤더 */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            FAIR PLAY
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            실제 사용 사례와 전문가 인터뷰를 통해 FAIR HR 솔루션의 효과를 확인해보세요
          </p>
        </div>

        {/* 카테고리 탭 */}
        <div className="mb-8">
          <nav className="flex space-x-1 bg-gray-100 rounded-lg p-1 max-w-2xl mx-auto">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`flex-1 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeCategory === category.id
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {category.name}
              </button>
            ))}
          </nav>
        </div>

        {/* 비디오 그리드 - 개선된 레이아웃 */}
        <div className="space-y-8">
          {/* 메인 비디오 - 전체 너비 */}
          <div className="w-full">
            <VideoThumbnail 
              video={mainVideo} 
              onClick={() => handleVideoClick(mainVideo)}
            />
          </div>

          {/* 그리드 비디오들 - 반응형 그리드 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sideVideos.map((video) => (
              <VideoThumbnail 
                key={video.id}
                video={video} 
                onClick={() => handleVideoClick(video)}
              />
            ))}
          </div>
        </div>

        {/* 더보기 버튼 */}
        <div className="text-center mt-12">
          <button className="inline-flex items-center px-6 py-3 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors font-medium">
            더 많은 영상 보기
            <ChevronRight className="w-4 h-4 ml-2" />
          </button>
        </div>
      </div>

      {/* 비디오 플레이어 모달 */}
      {isPlayerOpen && selectedVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {selectedVideo.title}
              </h3>
              <button
                onClick={closePlayer}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* 비디오 플레이어 영역 */}
            <div className="aspect-video bg-gray-900 flex items-center justify-center">
              <div className="text-white text-center">
                <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">비디오 플레이어</p>
                <p className="text-sm opacity-75">실제 환경에서는 여기에 비디오가 재생됩니다</p>
              </div>
            </div>

            {/* 비디오 정보 */}
            <div className="p-4">
              <p className="text-gray-600 mb-2">{selectedVideo.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>카테고리: {selectedVideo.category}</span>
                <span>조회수: {selectedVideo.views}</span>
                <span>업로드: {selectedVideo.publishedAt}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
