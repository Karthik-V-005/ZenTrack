import LiveUsageMonitor from "../components/LiveUsageMonitor";
import { useActivityEmitter } from "../hooks/useActivityEmitter";

export const LiveUsage = () => {
  useActivityEmitter({ enabled: true });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold text-white mb-2">Live Usage</h1>
        <p className="text-slate-500">
          Real-time digital behavior parameters (privacy-safe).
        </p>
      </header>

      <LiveUsageMonitor source="web" />
    </div>
  );
};
