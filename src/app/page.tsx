import LandingFull from "./_landing-full";
import LandingMinimal from "./_landing-minimal";
import LandingOriginal from "./_landing-original";

// NEXT_PUBLIC_LANDING_MODE controls which landing page to show:
// - "full": New complete landing with all sections
// - "minimal": Just logo + login button
// - "original": The original landing page
// Default: "minimal"

export default function Home() {
  const landingMode = process.env.NEXT_PUBLIC_LANDING_MODE || "minimal";

  switch (landingMode) {
    case "full":
      return <LandingFull />;
    case "original":
      return <LandingOriginal />;
    case "minimal":
    default:
      return <LandingMinimal />;
  }
}
