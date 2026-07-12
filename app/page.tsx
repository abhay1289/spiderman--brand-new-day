import ScrollProvider from "@/components/ScrollProvider";
import Navbar from "@/components/Navbar";
import Preloader from "@/components/Preloader";
import HeroSection from "@/components/HeroSection";
import StorySection from "@/components/StorySection";
import CharactersSection from "@/components/CharactersSection";
import GallerySection from "@/components/GallerySection";
import CountdownSection from "@/components/CountdownSection";

import TrailerSection from "@/components/TrailerSection";
import FilmographySection from "@/components/FilmographySection";
import AudioManager from "@/components/AudioManager";

function SectionDivider() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-6 md:py-10">
      <div className="section-divider-line h-px origin-center" style={{ background: "linear-gradient(to right, transparent 5%, var(--fg-08) 30%, var(--fg-08) 70%, transparent 95%)" }} />
    </div>
  );
}

export default function Home() {
  return (
    <ScrollProvider>
      <Preloader />
      <Navbar />

      <main>
        <HeroSection />

        <SectionDivider />

        <CharactersSection />

        <SectionDivider />

        <StorySection />

        <TrailerSection />

        <SectionDivider />

        <FilmographySection />

        <SectionDivider />

        <GallerySection />

        <SectionDivider />

        <CountdownSection />
      </main>

      <AudioManager />
    </ScrollProvider>
  );
}
