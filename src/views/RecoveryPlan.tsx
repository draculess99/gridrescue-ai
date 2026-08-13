import { useSimulation } from '../state/SimulationContext';

const STATUS_STYLES: Record<string, { color: string; label: string }> = {
  PROPOSED: { color: '#64748b', label: 'PROPOSED' },
  AUTHORIZED: { color: '#eab308', label: 'AUTHORIZED' },
  IN_PROGRESS: { color: '#3b82f6', label: 'IN PROGRESS' },
  COMPLETED: { color: '#22c55e', label: 'COMPLETED' },
  DISABLED: { color: '#ef4444', label: 'DISABLED' },
};

export default function RecoveryPlan() {
  const { state, dispatch } = useSimulation();

  const isAwaitingAuth = state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';
  const isRecoveryActive = state.incidentState === 'RECOVERY_ACTIVE' || state.incidentState === 'STABILIZED';
  const showPlan = state.recoveryPlan.some(a => a.status !== 'PROPOSED' || isAwaitingAuth || isRecoveryActive);
  const allComplete = state.recoveryPlan.every(a => a.status === 'COMPLETED');

  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-52px)]">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[#e2e8f0] tracking-wide">RECOVERY PLAN</h1>
        <p className="text-xs text-[#64748b] mt-0.5">Prioritized recovery strategy for grid restoration</p>
      </div>

      {!showPlan && (
        <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl mb-2 block">📋</span>
            <p className="text-sm text-[#64748b]">No recovery plan generated yet</p>
            <p className="text-xs text-[#475569] mt-1">Complete the AI analysis phase to generate a recovery strategy</p>
          </div>
        </div>
      )}

      {showPlan && (
        <>
          {/* Predicted Outcomes */}
          {!isRecoveryActive && (
            <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4 mb-4">
              <h2 className="text-xs font-semibold text-[#e2e8f0] mb-3">PREDICTED OUTCOMES</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏘️</span>
                  <div>
                    <p className="text-xs font-bold text-[#22c55e]">138,000</p>
                    <p className="text-[9px] text-[#64748b]">customers restored w/in 2hrs</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏥</span>
                  <div>
                    <p className="text-xs font-bold text-[#22c55e]">Protected</p>
                    <p className="text-[9px] text-[#64748b]">all major hospitals</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📈</span>
                  <div>
                    <p className="text-xs font-bold text-[#22c55e]">43% → 68%</p>
                    <p className="text-[9px] text-[#64748b]">grid stability improvement</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Recovery Progress */}
          {isRecoveryActive && (
            <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4 mb-4">
              <h2 className="text-xs font-semibold text-[#e2e8f0] mb-3">RECOVERY PROGRESS</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-2 bg-[#1e3a5f] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#3b82f6] to-[#22c55e] rounded-full transition-all duration-500"
                    style={{
                      width: `${(state.recoveryPlan.filter(a => a.status === 'COMPLETED').length / state.recoveryPlan.length) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-xs font-mono font-bold text-[#e2e8f0]">
                  {state.recoveryPlan.filter(a => a.status === 'COMPLETED').length}/{state.recoveryPlan.length}
                </span>
              </div>
            </div>
          )}

          {/* Recovery Actions */}
          <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg overflow-hidden mb-4">
            <div className="px-4 py-3 border-b border-[#1e3a5f]">
              <h2 className="text-xs font-semibold text-[#e2e8f0]">RECOVERY ACTIONS</h2>
            </div>
            <div className="divide-y divide-[#1e3a5f]/50">
              {state.recoveryPlan.map((action, i) => {
                const statusStyle = STATUS_STYLES[action.status] || STATUS_STYLES.PROPOSED;
                return (
                  <div key={action.id} className="px-4 py-3 flex items-center gap-4">
                    <span className="text-[10px] font-mono text-[#64748b] w-5">{i + 1}.</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#e2e8f0]">{action.title}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[9px] text-[#64748b]">Team: {action.team}</span>
                        <span className="text-[9px] text-[#64748b]">Risk: {action.risk}</span>
                        <span className="text-[9px] text-[#64748b]">Time: {action.estTime}</span>
                      </div>
                    </div>
                    <div
                      className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                      style={{
                        backgroundColor: statusStyle.color + '22',
                        color: statusStyle.color,
                        border: `1px solid ${statusStyle.color}44`,
                      }}
                    >
                      {statusStyle.label}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Stabilized Message */}
          {allComplete && state.incidentState === 'STABILIZED' && (
            <div className="bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-lg p-6 text-center">
              <span className="text-4xl block mb-2">✅</span>
              <h2 className="text-lg font-bold text-[#22c55e] tracking-wide">INCIDENT STABILIZED</h2>
              <p className="text-xs text-[#94a3b8] mt-2 max-w-md mx-auto">
                All recovery actions completed. Grid restored to safe operating parameters.
                Critical infrastructure protected. Situation is under control.
              </p>
            </div>
          )}

          {/* Human Authorization */}
          {isAwaitingAuth && (
            <div className="bg-[#eab308]/10 border-2 border-[#eab308]/40 rounded-lg p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">⚠️</span>
                <div>
                  <h2 className="text-sm font-bold text-[#eab308] tracking-wide">HUMAN AUTHORIZATION REQUIRED</h2>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">
                    The coordinated recovery plan is ready. Human incident commander must authorize all actions.
                  </p>
                </div>
              </div>

              <label className="flex items-center gap-3 mb-4 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={state.isAuthorized}
                  onChange={() => dispatch({ type: 'TOGGLE_AUTHORIZATION' })}
                  className="w-4 h-4 rounded border-[#1e3a5f] bg-[#060b14] accent-[#3b82f6] cursor-pointer"
                />
                <span className="text-xs text-[#94a3b8] group-hover:text-[#e2e8f0] transition-colors">
                  I understand the operational impact and authorize this recovery plan.
                </span>
              </label>

              <button
                onClick={() => dispatch({ type: 'APPROVE_RECOVERY' })}
                disabled={!state.isAuthorized}
                className={`w-full py-3 rounded text-sm font-bold tracking-wide transition-all duration-150
                  ${state.isAuthorized
                    ? 'bg-[#eab308] text-black hover:bg-[#d97706] active:scale-[0.98] shadow-lg shadow-[#eab308]/25'
                    : 'bg-[#1e3a5f]/50 text-[#64748b] cursor-not-allowed'
                  }`}
              >
                {state.isAuthorized ? '▶ APPROVE RECOVERY PLAN' : 'CHECK BOX TO APPROVE'}
              </button>
            </div>
          )}

          {/* Recovery Active Banner */}
          {isRecoveryActive && (
            <div className="bg-[#3b82f6]/10 border border-[#3b82f6]/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-[#3b82f6] animate-pulse-glow" />
                <div>
                  <p className="text-xs font-bold text-[#3b82f6]">
                    {allComplete ? 'RECOVERY COMPLETE' : 'RECOVERY OPERATIONS IN PROGRESS'}
                  </p>
                  <p className="text-[10px] text-[#94a3b8] mt-0.5">
                    {allComplete
                      ? 'All actions completed. Grid has been restored to safe parameters.'
                      : 'Executing recovery actions. Monitor progress in the action list above.'
                    }
                  </p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}