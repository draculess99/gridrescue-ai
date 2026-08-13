import { useSimulation } from '../state/SimulationContext';
import { getSecondaryMetrics } from '../data/tier2Data';

export default function SecondaryMetrics() {
  const { state } = useSimulation();
  const metrics = getSecondaryMetrics(state);

  const cascadeColor =
    metrics.cascadeProbability >= 70 ? '#ef4444' :
    metrics.cascadeProbability >= 40 ? '#f97316' :
    metrics.cascadeProbability >= 10 ? '#eab308' : '#22c55e';

  const riskColor =
    metrics.highestRiskFacility === 'None' || metrics.highestRiskFacility === 'None detected'
      ? '#22c55e' : '#ef4444';

  return (
    <div className="grid grid-cols-2 gap-2">
      {/* Cascade Probability */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-3">
        <div className="text-[9px] text-[#64748b] font-medium tracking-wide mb-1">CASCADE PROBABILITY</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold" style={{ color: cascadeColor }}>
            {metrics.cascadeProbability}%
          </span>
          <div className="flex-1 h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${metrics.cascadeProbability}%`, backgroundColor: cascadeColor }}
            />
          </div>
        </div>
      </div>

      {/* Highest Risk Facility */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-3">
        <div className="text-[9px] text-[#64748b] font-medium tracking-wide mb-1">HIGHEST-RISK FACILITY</div>
        <div className="flex items-center gap-1.5">
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: riskColor }}
          />
          <span className="text-xs font-semibold text-[#e2e8f0] truncate" style={{ color: riskColor }}>
            {metrics.highestRiskFacility}
          </span>
        </div>
      </div>

      {/* Repair Crews Available */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-3">
        <div className="text-[9px] text-[#64748b] font-medium tracking-wide mb-1">REPAIR CREWS AVAILABLE</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-[#e2e8f0]">
            {metrics.repairCrewsAvailable}
          </span>
          <span className="text-[9px] text-[#64748b]">teams</span>
        </div>
      </div>

      {/* Mobile Generators */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-3">
        <div className="text-[9px] text-[#64748b] font-medium tracking-wide mb-1">MOBILE GENERATORS</div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-lg font-bold text-[#e2e8f0]">
            {metrics.mobileGeneratorsAvailable}
          </span>
          <span className="text-[9px] text-[#64748b]">available</span>
        </div>
      </div>
    </div>
  );
}