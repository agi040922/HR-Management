'use client'

import React, { useState } from 'react'
import HelpHeader from '@/components/(page)/help/HelpHeader'
import HelpOverview from '@/components/(page)/help/HelpOverview'
import HelpTutorials from '@/components/(page)/help/HelpTutorials'
import HelpFeatures from '@/components/(page)/help/HelpFeatures'
import HelpFAQ from '@/components/(page)/help/HelpFAQ'

export default function HelpPage() {
  const [activeSection, setActiveSection] = useState('overview')

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return <HelpOverview />
      case 'tutorials':
        return <HelpTutorials />
      case 'features':
        return <HelpFeatures />
      case 'faq':
        return <HelpFAQ />
      default:
        return <HelpOverview />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <HelpHeader 
          activeSection={activeSection} 
          onSectionChange={setActiveSection} 
        />
        
        <div className="bg-white rounded border shadow-sm p-6">
          {renderContent()}
        </div>
      </div>
    </div>
  )
}
