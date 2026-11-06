import { Suspense } from "react";
import { OverviewCardsSkeleton } from "./_components/overview-cards/skeleton";
import { RealOverviewCardsGroup } from "./_components/overview-cards/real-overview-cards";
import { StatusBreakdownPanels } from "./_components/status-breakdown-panel";

export default async function Home() {
  return (
    <div className="space-y-4">

      <Suspense fallback={<OverviewCardsSkeleton />}>
        <RealOverviewCardsGroup />
      </Suspense>

      <div className="grid grid-cols-12 gap-4 md:gap-6">
        <Suspense fallback={null}>
          <StatusBreakdownPanels />
        </Suspense>
      </div>
    </div>
  );
}
