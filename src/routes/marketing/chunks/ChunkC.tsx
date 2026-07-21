
import { TeamSection } from "../../../components/organisms/TeamSection";
import { ContactSection } from "../../../components/organisms/ContactSection";
import { GoldenLightningVeins } from "../../../components/ui/GoldenLightningVeins";

export default function ChunkC() {
  return (
    <>
      <TeamSection />
      <ContactSection />
      <div className="relative overflow-hidden w-full h-36 pointer-events-none -mt-16 z-0">
        <GoldenLightningVeins variant="footer" />
      </div>
    </>
  );
}
