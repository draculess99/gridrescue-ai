import { useSimulation } from '../state/SimulationContext';
import { getRiskRanking } from '../data/tier2Data';

const RISK_COLOR = (score: number) => {
  if (score >= 85) return '#ef4444';
  if (score >= 65) return '#f97316';
  if (score >= 40) return '#eab308';
  return '#22c55e';
};

export default function RiskRanking() {
  const { state } = useSimulation();
  const ranking = getRiskRanking(state);

  const isInactive = state.incidentState === 'MONITORING';

  return (
    <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
      <h3 className="text-xs font-semibold text-[#e2e8f0] mb-3 tracking-wide">
        LIVES AND INFRASTRUCTURE AT IMMEDIATE RISK
      </h3>

      {isInactive && (
        <div className="flex items-center justify-center h-16">
          <p className="text-[10px] text-[#64748b]">Awaiting disaster scenario data...</p>
        </div>
      )}

      {!isInactive && ranking.length === 0 && (
        <div className="flex items-center justify-center h-16">
          <p className="text-[10px] text-[#22c55e]">✓ All critical infrastructure protected.</p>
        </div>
      )}

      {!isInactive && ranking.length > 0 && (
        <div className="space-y-1.5">
          {ranking.map((item, idx) => {
            const color = RISK_COLOR(item.riskScore);
            return (
              <div
                key={item.facility}
                className="flex items-center gap-2 bg-[#060b14]/60 rounded px-2.5 py-2 animate-fade-in"
                style={{ animationDelay: `${idx * 60}ms` }}
              >
                {/* Rank */}
                <span className="text-[9px] font-mono text-[#64748b] w-4 shrink-0">
                  {item.priority < 10 ? `${item.priority}.` : '—'}
                </span>

                {/* Priority indicator bar */}
                <div
                  className="w-1 h-8 rounded-full shrink-0"
                  style={{ backgroundColor: color }}
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[#e2e8f0] truncate">
                      {item.facility}
                    </span>
                    <span
                      className="text-[8px] px-1 py-px rounded font-bold shrink-0 uppercase tracking-wider"
                      style={{
                        backgroundColor: color + '22',
                        color,
                        border: `1px solid ${color}44`,
                      }}
                    >
                      {item.state}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[9px] text-[#64748b] mt-0.5">
                    <span>🏥 {item.type}</span>
                    <span>👥 {item.peopleAffected.toLocaleString()}</span>
                    {item.backupRemaining !== 'None' && item.backupRemaining !== 'N/A (secured)' && (
                      <span className="text-[#eab308]">🔋 {item.backupRemaining}</span>
                    )}
                    {item.backupRemaining === 'N/A (secured)' && (
                      <span className="text-[#22c55e]">✅ Secured</span>
                    )}
                    {item.backupRemaining === 'None' && (
                      <span className="text-[#ef4444]">⚠️ No backup</span>
                    )}
                  </div>
                </div>

                {/* Risk score */}
                <div className="shrink-0 text-right">
                  <div
                    className="text-[11px] font-mono font-bold"
                    style={{ color }}
                  >
                    {item.riskScore}
                  </div>
                  <div className="text-[7px] text-[#64748b]">RISK</div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}