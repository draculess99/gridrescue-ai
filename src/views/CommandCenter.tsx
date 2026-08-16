import { useSimulation } from '../state/SimulationContext';

import MetricsPanel from '../components/MetricsPanel';
import DeliberationFeed from '../components/DeliberationFeed';
import CascadeForecast from '../components/CascadeForecast';
import RiskRanking from '../components/RiskRanking';
import SecondaryMetrics from '../components/SecondaryMetrics';
import { getIncidentSummary, INCIDENT_STATE_LABELS } from '../data/scenarioData';

export default function CommandCenter() {
  const { state, dispatch } = useSimulation();

  const isRunning = state.incidentState !== 'MONITORING' && state.incidentState !== 'STABILIZED';
  const isPausable = isRunning && !state.isPaused;
  const isResumable = isRunning && state.isPaused;
  const isReset = state.incidentState === 'MONITORING' || state.incidentState === 'STABILIZED' || isRunning;

  return (
    <div className="p-5 space-y-5 overflow-y-auto h-[calc(100vh-52px)]">
      {/* Header */}
      <div>
        <h1 className="text-lg font-bold text-[#e2e8f0] tracking-wide">COMMAND CENTER</h1>
        <p className="text-xs text-[#64748b] mt-0.5">GridRescue AI Incident Management</p>
      </div>

      {/* Scenario Control Panel */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-xs font-semibold text-[#e2e8f0]">SCENARIO</h2>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060b14] rounded border border-[#1e3a5f]">
              <span className="text-sm">🌪️</span>
              <span className="text-xs font-medium text-[#e2e8f0]">Category 4 Hurricane</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060b14] rounded border border-[#1e3a5f]/50">
              <span className="text-[9px] text-[#64748b]">Severity:</span>
              <span className="text-[10px] font-semibold text-[#ef4444]">CATASTROPHIC</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#060b14] rounded border border-[#1e3a5f]/50">
              <span className="text-[9px] text-[#64748b]">Time:</span>
              <span className="text-[10px] font-semibold text-[#e2e8f0]">🌙 NIGHT</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {state.incidentState === 'MONITORING' && (
              <button
                onClick={() => dispatch({ type: 'RUN_DISASTER' })}
                className="px-4 py-2 rounded text-xs font-bold text-white bg-[#ef4444] hover:bg-[#dc2626]
                  active:scale-[0.97] transition-all duration-150 shadow-lg shadow-[#ef4444]/25"
              >
                ▶ RUN DISASTER SIMULATION
              </button>
            )}
            {isPausable && (
              <button
                onClick={() => dispatch({ type: 'PAUSE' })}
                className="px-3 py-2 rounded text-xs font-medium text-[#eab308] border border-[#eab308]/40
                  hover:bg-[#eab308]/10 active:scale-[0.97] transition-all duration-150"
              >
                ⏸ PAUSE
              </button>
            )}
            {isResumable && (
              <button
                onClick={() => dispatch({ type: 'RESUME' })}
                className="px-3 py-2 rounded text-xs font-medium text-[#22c55e] border border-[#22c55e]/40
                  hover:bg-[#22c55e]/10 active:scale-[0.97] transition-all duration-150"
              >
                ▶ RESUME
              </button>
            )}
            {isReset && (
              <button
                onClick={() => dispatch({ type: 'RESET' })}
                className="px-3 py-2 rounded text-xs font-medium text-[#ef4444] border border-[#ef4444]/40
                  hover:bg-[#ef4444]/10 active:scale-[0.97] transition-all duration-150"
              >
                ↺ RESET
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Metrics + Secondary */}
      <div className="space-y-3">
        <MetricsPanel />
        <SecondaryMetrics />
      </div>

      {/* Tier 2A Grid: Forecast + Risk Ranking */}
      <div className="grid grid-cols-2 gap-5">
        <CascadeForecast />
        <RiskRanking />
      </div>

      {/* Active Incident Status */}
      <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs font-semibold text-[#e2e8f0]">ACTIVE INCIDENT STATUS</span>
          <div
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: INCIDENT_STATE_LABELS[state.incidentState]?.color || '#22c55e' }}
          />
        </div>
        <p className="text-xs text-[#94a3b8] leading-relaxed">
          {getIncidentSummary(state.incidentState, state.gridStability)}
        </p>
      </div>

      {/* Deliberation Feed */}
      <DeliberationFeed />
    </div>
  );
}