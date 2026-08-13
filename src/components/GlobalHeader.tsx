import { useSimulation } from '../state/SimulationContext';
import { INCIDENT_STATE_LABELS } from '../data/scenarioData';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function GlobalHeader() {
  const { state, dispatch } = useSimulation();
  const incidentLabel = INCIDENT_STATE_LABELS[state.incidentState];

  const stabilityColor =
    state.gridStability >= 80 ? '#22c55e' :
    state.gridStability >= 60 ? '#eab308' :
    state.gridStability >= 40 ? '#f97316' : '#ef4444';

  return (
    <header className="h-[52px] min-h-[52px] bg-[#060b14] border-b border-[#1e3a5f] flex items-center px-5 gap-4 select-none">
      {/* Title */}
      <span className="text-[#3b82f6] font-bold text-sm tracking-widest mr-2">GRID DISASTER AI</span>

      <div className="h-4 w-px bg-[#1e3a5f]" />

      {/* Incident State Badge */}
      <div
        className="px-2.5 py-0.5 rounded text-[10px] font-bold tracking-wider"
        style={{
          backgroundColor: incidentLabel.color + '22',
          color: incidentLabel.color,
          border: `1px solid ${incidentLabel.color}44`,
        }}
      >
        {incidentLabel.label}
      </div>

      <div className="h-4 w-px bg-[#1e3a5f]" />

      {/* Simulation Clock */}
      <div className="flex items-center gap-1.5">
        <span className="text-[#64748b] text-[10px]">CLOCK</span>
        <span className="font-mono text-sm font-bold text-[#e2e8f0]">{formatTime(state.clockSeconds)}</span>
      </div>

      <div className="h-4 w-px bg-[#1e3a5f]" />

      {/* Grid Stability */}
      <div className="flex items-center gap-1.5">
        <span className="text-[#64748b] text-[10px]">STABILITY</span>
        <span className="font-mono text-sm font-bold" style={{ color: stabilityColor }}>
          {state.gridStability}%
        </span>
        <div className="w-16 h-1.5 bg-[#1e3a5f] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${state.gridStability}%`, backgroundColor: stabilityColor }}
          />
        </div>
      </div>

      {/* Severity indicator */}
      <div className="flex items-center gap-1.5">
        <span
          className={`inline-block w-2 h-2 rounded-full ${
            state.incidentState === 'MONITORING' || state.incidentState === 'STABILIZED'
              ? 'bg-[#22c55e]'
              : 'animate-pulse-glow bg-[#ef4444]'
          }`}
        />
        <span className="text-[#64748b] text-[10px]">
          {state.incidentState === 'MONITORING' ? 'NORMAL' :
           state.incidentState === 'STABILIZED' ? 'RESOLVED' : 'EMERGENCY'}
        </span>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Reset Button */}
      <button
        onClick={() => dispatch({ type: 'RESET' })}
        className="px-3 py-1.5 rounded text-xs font-medium text-[#ef4444] border border-[#ef4444]/40
          hover:bg-[#ef4444]/10 active:scale-[0.97] transition-all duration-150"
      >
        RESET SIMULATION
      </button>
    </header>
  );
}