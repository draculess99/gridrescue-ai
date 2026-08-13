import { useSimulation } from '../state/SimulationContext';
import { getForecastData } from '../data/tier2Data';

const SEVERITY_COLORS: Record<string, string> = {
  LOW: '#64748b',
  MEDIUM: '#eab308',
  HIGH: '#f97316',
  CRITICAL: '#ef4444',
};

export default function CascadeForecast() {
  const { state } = useSimulation();
  const horizons = getForecastData(state);

  const isInactive = state.incidentState === 'MONITORING' || state.incidentState === 'STABILIZED';

  return (
    <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
      <h3 className="text-xs font-semibold text-[#e2e8f0] mb-3 tracking-wide">
        CASCADING FAILURE FORECAST
      </h3>

      {isInactive && state.incidentState === 'MONITORING' && (
        <div className="flex items-center justify-center h-16">
          <p className="text-[10px] text-[#64748b]">Awaiting disaster scenario data...</p>
        </div>
      )}

      {isInactive && state.incidentState === 'STABILIZED' && (
        <div className="flex items-center justify-center h-16">
          <p className="text-[10px] text-[#22c55e]">✓ Grid stabilized — no cascading failures predicted.</p>
        </div>
      )}

      {!isInactive && (
        <div className="space-y-4">
          {horizons.map((horizon) => (
            <div key={horizon.label}>
              <div className="text-[9px] font-bold text-[#64748b] tracking-wider mb-1.5">
                {horizon.label}
              </div>
              <div className="space-y-1">
                {horizon.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-[#060b14]/60 rounded px-2.5 py-2 border-l-2 animate-fade-in"
                    style={{
                      borderLeftColor: SEVERITY_COLORS[item.riskSeverity] || '#64748b',
                    }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold text-[#e2e8f0] truncate">
                        {item.assetName}
                      </span>
                      {item.probability > 0 && (
                        <span
                          className="text-[9px] font-mono font-bold shrink-0"
                          style={{ color: SEVERITY_COLORS[item.riskSeverity] }}
                        >
                          {item.probability}%
                        </span>
                      )}
                    </div>
                    {item.probability > 0 && (
                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-[#64748b]">
                        <span>⏱ {item.timeToFailure}</span>
                        <span>👥 {item.populationImpact.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}