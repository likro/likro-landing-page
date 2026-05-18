import { Header } from "@/components/layout/Header";
import { Hero } from "@/sections/Hero";
import { Proof } from "@/sections/Proof";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Proof />
      </main>
    </>
  );
}
