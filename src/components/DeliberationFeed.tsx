import { useSimulation } from '../state/SimulationContext';

export default function DeliberationFeed() {
  const { state } = useSimulation();
  const feed = state.deliberationFeed.slice(-8).reverse();

  if (feed.length === 0) {
    return (
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
        <h3 className="text-xs font-semibold text-[#e2e8f0] mb-3">AGENT DELIBERATION FEED</h3>
        <div className="flex items-center justify-center h-20">
          <p className="text-xs text-[#64748b]">Awaiting agent deliberation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
      <h3 className="text-xs font-semibold text-[#e2e8f0] mb-3">AGENT DELIBERATION FEED</h3>
      <div className="space-y-2 max-h-[240px] overflow-y-auto">
        {feed.map((entry, i) => (
          <div
            key={i}
            className={`flex items-start gap-2.5 p-2 rounded text-[11px] animate-fade-in
              ${entry.isConflict
                ? 'bg-[#ef4444]/5 border-l-2 border-[#ef4444]/60'
                : 'bg-[#060b14]/50 border-l-2 border-transparent'
              }`}
          >
            {/* Agent badge */}
            <div
              className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold text-white"
              style={{ backgroundColor: entry.agentColor }}
            >
              {entry.agentName.substring(0, 2).toUpperCase()}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#e2e8f0]">{entry.agentName}</span>
                <span className="text-[9px] text-[#64748b] font-mono">{entry.timestamp}</span>
                <span className="text-[9px] font-mono text-[#64748b]">conf: {entry.confidence}%</span>
              </div>
              <p className="text-[#94a3b8] mt-0.5 leading-tight">{entry.finding}</p>
              <p className="text-[#e2e8f0] mt-0.5 leading-tight font-medium">{entry.recommendation}</p>
            </div>

            {/* Conflict indicator */}
            {entry.isConflict && (
              <span className="shrink-0 text-[9px] px-1.5 py-0.5 rounded bg-[#ef4444]/15 text-[#ef4444] font-bold tracking-wider">
                CONFLICT
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}