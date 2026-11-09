import { Hero, Nav } from "@/components/Hero";
import { MediaProvider } from "@/components/Media";
import { ScrollBand, ScrollProgress, SmoothScroll } from "@/components/motion";
import { About, Achievements, Contact, Experience, Leadership, Process, Projects, Skills } from "@/components/Sections";

export default function Home() {
  return (
    <MediaProvider>
      <SmoothScroll />
      <ScrollProgress />
      <Nav />
      <main>
        <Hero />
        <About />
        <Process />
        <ScrollBand words={["Propulsion", "Aerial Robotics", "Automation", "CFD"]} />
        <Experience />
        <Projects />
        <Achievements />
        <ScrollBand reverse words={["Design", "Build", "Test", "Fly"]} />
        <Leadership />
        <Skills />
        <Contact />
      </main>
    </MediaProvider>
  );
}
