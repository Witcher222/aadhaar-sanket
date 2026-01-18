import { useRef } from 'react';
import LandingNav from '@/components/landing/LandingNav';
import HeroSection from '@/components/landing/HeroSection';
import WorkflowSection from '@/components/landing/WorkflowSection';
import GuidelinesSection from '@/components/landing/GuidelinesSection';
import ContactSection from '@/components/landing/ContactSection';
import Footer from '@/components/landing/Footer';

const LandingPage = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-cream">
      <LandingNav onNavigate={scrollToSection} />
      <HeroSection />
      <WorkflowSection />
      <GuidelinesSection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
