'use client'

import React from 'react'

interface LandingLayoutProps {
  children: React.ReactNode
}

export default function LandingLayout({ children }: LandingLayoutProps) {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {children}
    </div>
  )
}
