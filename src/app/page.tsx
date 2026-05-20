import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/sections/Hero";
import { Pain } from "@/sections/Pain";
import { Bridge } from "@/sections/Bridge";
import { Product } from "@/sections/Product";
import { HowItWorks } from "@/sections/HowItWorks";
import { Proof } from "@/sections/Proof";
import { Form } from "@/sections/Form";
import { FloatingWhatsApp } from "@/sections/Floating/FloatingWhatsApp";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Pain />
        <Bridge />
        <Product />
        <HowItWorks />
        <Proof />
        <Form />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
