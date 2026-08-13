import { useSimulation } from '../state/SimulationContext';
import { getAssetDetail } from '../data/tier2Data';

const STATE_COLORS: Record<string, string> = {
  OPERATIONAL: '#22c55e',
  STRESSED: '#eab308',
  OVERLOADED: '#f97316',
  FAILED: '#ef4444',
  PROTECTED: '#3b82f6',
  RESTORING: '#06b6d4',
  RESTORED: '#22c55e',
};

export default function AssetDetailPanel() {
  const { state, dispatch } = useSimulation();
  const detail = getAssetDetail(state, state.selectedAssetId);

  if (!detail) return null;

  const stateColor = STATE_COLORS[detail.state] || '#64748b';

  return (
    <div
      className="absolute right-0 top-0 bottom-0 w-[320px] bg-[#0f1729] border-l border-[#1e3a5f]
        overflow-y-auto z-10 animate-slide-in shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#1e3a5f] bg-[#060b14]/50">
        <h3 className="text-xs font-bold text-[#e2e8f0] tracking-wide">ASSET DETAILS</h3>
        <button
          onClick={() => dispatch({ type: 'SELECT_ASSET', assetId: null })}
          className="text-[#64748b] hover:text-[#e2e8f0] transition-colors text-sm leading-none px-1"
        >
          ✕
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Name & type */}
        <div>
          <h4 className="text-sm font-bold text-[#e2e8f0]">{detail.name}</h4>
          <span className="text-[10px] text-[#64748b]">{detail.type}</span>
        </div>

        {/* Status */}
        <div className="flex items-center gap-2">
          <div
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: stateColor }}
          />
          <span
            className="text-xs font-bold tracking-wider"
            style={{ color: stateColor }}
          >
            {detail.state}
          </span>
        </div>

        <div className="h-px bg-[#1e3a5f]/50" />

        {/* Detail grid */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[9px] text-[#64748b] block tracking-wide">CAPACITY</span>
            <span className="text-xs font-mono font-bold text-[#e2e8f0]">{detail.capacity}</span>
          </div>
          <div>
            <span className="text-[9px] text-[#64748b] block tracking-wide">CURRENT LOAD</span>
            <span className="text-xs font-mono font-bold text-[#e2e8f0]">{detail.currentLoad}</span>
          </div>
          <div>
            <span className="text-[9px] text-[#64748b] block tracking-wide">POPULATION SERVED</span>
            <span className="text-xs font-mono font-bold text-[#e2e8f0]">
              {detail.populationServed > 0 ? detail.populationServed.toLocaleString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="text-[9px] text-[#64748b] block tracking-wide">RISK SCORE</span>
            <span
              className="text-xs font-mono font-bold"
              style={{ color: detail.riskScore >= 50 ? '#ef4444' : detail.riskScore >= 20 ? '#eab308' : '#22c55e' }}
            >
              {detail.riskScore}/100
            </span>
          </div>
          <div className="col-span-2">
            <span className="text-[9px] text-[#64748b] block tracking-wide">PREDICTED FAILURE</span>
            <span
              className="text-xs font-mono font-bold"
              style={{
                color:
                  detail.predictedFailureTime === 'FAILED' ? '#ef4444' :
                  detail.predictedFailureTime === 'Not predicted' || detail.predictedFailureTime === 'Operational' || detail.predictedFailureTime === 'Secured'
                    ? '#22c55e' : '#eab308',
              }}
            >
              {detail.predictedFailureTime}
            </span>
          </div>
        </div>

        <div className="h-px bg-[#1e3a5f]/50" />

        {/* Dependencies */}
        <div>
          <span className="text-[9px] text-[#64748b] block mb-1 tracking-wide">DEPENDENCIES</span>
          <div className="flex flex-wrap gap-1">
            {detail.dependencies.map((dep) => (
              <span
                key={dep}
                className="text-[9px] px-1.5 py-0.5 rounded bg-[#1e3a5f]/40 text-[#94a3b8]"
              >
                {dep}
              </span>
            ))}
          </div>
        </div>

        <div className="h-px bg-[#1e3a5f]/50" />

        {/* Recommended Response */}
        <div>
          <span className="text-[9px] text-[#64748b] block mb-1 tracking-wide">RECOMMENDED RESPONSE</span>
          <p className="text-[11px] text-[#e2e8f0] leading-relaxed">{detail.recommendedResponse}</p>
        </div>
      </div>
    </div>
  );
}