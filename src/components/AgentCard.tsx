import { useSimulation } from '../state/SimulationContext';

const agentStatusColors: Record<string, string> = {
  IDLE: '#64748b',
  RECEIVING_DATA: '#3b82f6',
  ANALYZING: '#eab308',
  CONFLICT_DETECTED: '#ef4444',
  COMPLETE: '#22c55e',
};

export default function AgentCard({ agentId }: { agentId: number }) {
  const { state, dispatch } = useSimulation();
  const agent = state.agents.find(a => a.id === agentId);
  if (!agent) return null;

  const isCommander = agent.isRecoveryCommander;
  const statusColor = agentStatusColors[agent.status] || '#64748b';

  return (
    <div
      className={`bg-[#0f1729] border rounded-lg overflow-hidden transition-all duration-200
        ${isCommander ? 'border-[#8b5cf6] ring-1 ring-[#8b5cf6]/30' : 'border-[#1e3a5f]'}
        ${agent.expanded ? '' : 'cursor-pointer hover:border-[#3b82f6]/50'}
      `}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2.5 border-b border-[#1e3a5f]/50 cursor-pointer"
        onClick={() => dispatch({ type: 'EXPAND_AGENT', agentId: agent.id })}
      >
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: agent.color }} />
          <span className="text-xs font-semibold text-[#e2e8f0]">{agent.name}</span>
          {isCommander && (
            <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#8b5cf6]/20 text-[#8b5cf6] font-bold tracking-wider">
              COMMANDER
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold" style={{ color: statusColor }}>
              {agent.confidence}%
            </span>
            <span className="text-[9px] text-[#64748b]">conf</span>
          </div>
          <div
            className="w-2 h-2 rounded-full animate-pulse-glow"
            style={{ backgroundColor: statusColor }}
          />
        </div>
      </div>

      {/* Status & concern */}
      <div className="px-3 py-2 border-b border-[#1e3a5f]/30">
        <div className="flex items-center gap-2 text-[10px]">
          <span className="text-[#64748b]">Status:</span>
          <span className="font-semibold" style={{ color: statusColor }}>
            {agent.status === 'RECEIVING_DATA' ? 'Receiving Data' :
             agent.status === 'ANALYZING' ? 'Analyzing' :
             agent.status === 'CONFLICT_DETECTED' ? 'Conflict Detected' :
             agent.status === 'COMPLETE' ? 'Complete' : 'Idle'}
          </span>
          <span className="text-[#64748b] ml-1">| Concern:</span>
          <span className="text-[#94a3b8] truncate">{agent.concern}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-3 py-2 space-y-1.5">
        <div>
          <span className="text-[9px] text-[#64748b] font-medium tracking-wide">FINDING</span>
          <p className="text-xs text-[#e2e8f0] mt-0.5">{agent.finding}</p>
        </div>
        <div>
          <span className="text-[9px] text-[#64748b] font-medium tracking-wide">RECOMMENDATION</span>
          <p className="text-xs text-[#e2e8f0] mt-0.5">{agent.recommendation}</p>
        </div>

        {/* Expandable reasoning */}
        {agent.expanded && (
          <div className="mt-2 pt-2 border-t border-[#1e3a5f]/30 animate-fade-in">
            <span className="text-[9px] text-[#64748b] font-medium tracking-wide">REASONING</span>
            <p className="text-[11px] text-[#94a3b8] mt-1 leading-relaxed">{agent.reasoning}</p>
          </div>
        )}
      </div>

      {/* Expand/collapse indicator */}
      <div
        className="px-3 py-1.5 bg-[#060b14]/50 border-t border-[#1e3a5f]/30 cursor-pointer text-center"
        onClick={() => dispatch({ type: 'EXPAND_AGENT', agentId: agent.id })}
      >
        <span className="text-[9px] text-[#64748b]">
          {agent.expanded ? '▲ COLLAPSE' : '▼ EXPAND REASONING'}
        </span>
      </div>
    </div>
  );
}