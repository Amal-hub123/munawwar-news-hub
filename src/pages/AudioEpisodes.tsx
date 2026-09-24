import { TopBar } from "@/components/TopBar";
import { Header } from "@/components/Header";
import Footer from "@/components/Footer";
import AudioSection from "@/components/home/AudioSection";

const AudioEpisodes = () => (
  <div className="min-h-screen bg-background overflow-x-clip">
    <TopBar />
    <Header />
    <main className="editorial-home">
      <AudioSection showAll />
    </main>
    <Footer />
  </div>
);

export default AudioEpisodes;
