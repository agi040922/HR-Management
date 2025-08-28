import LandingHeader from '@/components/(page)/landing/landing-header'
import HeroSection from '@/components/(page)/landing/hero-section'
import FeaturesSection from '@/components/(page)/landing/features-section'
import DiscountSection from '@/components/(page)/landing/discount-section'
import VideoSection from '@/components/(page)/landing/video-section'
import TestimonialsSection from '@/components/(page)/landing/testimonials-section'
import LandingFooter from '@/components/(page)/landing/landing-footer'

export default function Landing() {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      <LandingHeader />
      <main>
        <HeroSection />
        <FeaturesSection />
        <DiscountSection />
        <VideoSection />
        <TestimonialsSection />
      </main>
      <LandingFooter />
    </div>
  )
}
