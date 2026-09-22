import { Navbar } from "@/components/ui/Navbar";
import { Footer } from "@/components/ui/Footer";
import { Hero } from "@/components/landing/Hero";
import { ScrollStory } from "@/components/landing/ScrollStory";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main id="main">
        <Hero />
        <ScrollStory />
      </main>
      <Footer />
    </>
  );
}
