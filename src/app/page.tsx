import CloudShaderHero from "@/components/CloudShaderHero";
import FolderReveal from "@/components/FolderReveal";
import BentoGrid from "@/components/BentoGrid";
import Sponsor from "@/components/Sponsor";
import Footer from "@/components/Footer";
import { SponsorSuccessModal } from "@/components/SponsorSuccessModal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Dynamic Atmospheric Cloud Shader Hero & Navbar in the Upper Section */}
        <CloudShaderHero />

        {/* Personalized Workspace Folders upper the Bento Grid */}
        <FolderReveal />

        {/* Tactile Bento Grid */}
        <BentoGrid />

        {/* Community Sponsor Slots */}
        <Sponsor />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sponsor Checkout/Inquiry Success Handler */}
      <SponsorSuccessModal />
    </div>
  );
}
