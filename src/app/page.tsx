import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Pain } from "@/sections/Pain";
import { Product } from "@/sections/Product";
import { Funnel } from "@/sections/Funnel";
import { Proof } from "@/sections/Proof";
import { Form } from "@/sections/Form";
import { FloatingWhatsApp } from "@/sections/Floating/FloatingWhatsApp";
import { TrackSection } from "@/components/analytics/TrackSection";
import { ScrollDepthTracker } from "@/components/analytics/ScrollDepthTracker";

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <TrackSection section="hero">
          <Hero />
        </TrackSection>
        <TrackSection section="pain">
          <Pain />
        </TrackSection>
        <TrackSection section="product">
          <Product />
        </TrackSection>
        <TrackSection section="funnel">
          <Funnel />
        </TrackSection>
        <TrackSection section="proof">
          <Proof />
        </TrackSection>
        <TrackSection section="form">
          <Form />
        </TrackSection>
      </main>
      <Footer />
      <ScrollDepthTracker />
      <FloatingWhatsApp />
    </>
  );
}
