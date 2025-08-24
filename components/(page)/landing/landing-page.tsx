'use client'

import React from 'react'
import LandingLayout from './landing-layout'
import LandingHeader from './landing-header'
import HeroSection from './hero-section'
import FeaturesSection from './features-section'
import TestimonialsSection from './testimonials-section'
import LandingFooter from './landing-footer'

export default function LandingPage() {
  return (
    <LandingLayout>
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </LandingLayout>
  )
}
