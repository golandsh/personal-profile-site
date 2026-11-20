import type { ReactElement } from "react";
import { AboutSection } from "@/components/AboutSection";
import { CapabilitiesMatrix } from "@/components/CapabilitiesMatrix";
import { CareerTimeline } from "@/components/CareerTimeline";
import { ContactSection } from "@/components/ContactSection";
import { HeroSection } from "@/components/HeroSection";
import { PortfolioPreviewSection } from "@/components/PortfolioPreviewSection";
import { PROFILE } from "@/data/profile";

export default function HomePage(): ReactElement {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <CareerTimeline roles={PROFILE.career} />
      <CapabilitiesMatrix />
      <PortfolioPreviewSection />
      <ContactSection />
    </>
  );
}
