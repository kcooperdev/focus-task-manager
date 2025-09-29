import React from 'react';
import { HeroSection } from './components/HeroSection';
import { HowItWorksSection } from './components/HowItWorksSection';
import { PricingSection } from './components/PricingSection';
export function App() {
  return <main className="w-full">
      <HeroSection />
      <HowItWorksSection />
      <PricingSection />
    </main>;
}