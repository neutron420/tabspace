import BentoGrid from "@/components/BentoGrid";
import FolderReveal from "@/components/FolderReveal";
import Sponsor from "@/components/Sponsor";
import Footer from "@/components/Footer";
import { SponsorSuccessModal } from "@/components/SponsorSuccessModal";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-white text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
      {/* Main Content Area */}
      <main className="flex-1">
        {/* Personalized Workspace Folders upper the Bento Grid */}
        <FolderReveal />
        <BentoGrid />
        <Sponsor />
      </main>

      {/* Footer */}
      <Footer />

      {/* Sponsor Checkout/Inquiry Success Handler */}
      <SponsorSuccessModal />
    </div>
  );
}
