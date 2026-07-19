import SurvivalTargetTracker from './SurvivalTargetTracker';
import WorkingCapitalMonitor from './WorkingCapitalMonitor';
import LogisticsOffsetWidget from './LogisticsOffsetWidget';
import LiabilityLossWidget from './LiabilityLossWidget';
import { getTodayStats, getStoreConfig, getDripFeedStats } from '@/app/actions/dashboard';

export default async function DailyScoreboard() {
  const { totalGrossProfit, totalHamali, totalFreight } = await getTodayStats();
  const storeConfig = await getStoreConfig();
  const { totalLoss } = await getDripFeedStats();

  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Today's Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <div className="xl:col-span-1">
          <SurvivalTargetTracker currentProfit={totalGrossProfit} initialTarget={storeConfig.survivalTarget} />
        </div>
        
        <div className="xl:col-span-1">
          <WorkingCapitalMonitor 
            workingCapital={storeConfig.workingCapital} 
            protectedFloor={storeConfig.protectedFloor} 
          />
        </div>
        
        <div className="xl:col-span-1">
          <LogisticsOffsetWidget hamaliCollected={totalHamali} freightCollected={totalFreight} />
        </div>

        <div className="xl:col-span-1">
          <LiabilityLossWidget totalLoss={totalLoss} />
        </div>
      </div>
    </div>
  );
}
