import { useSimulation } from '../state/SimulationContext';

const NAV_ITEMS = [
  { id: 'command-center', label: 'Command Center', icon: '⚡' },
  { id: 'grid-network', label: 'Grid Network', icon: '🔌' },
  { id: 'ai-coordination', label: 'AI Coordination', icon: '🤖' },
  { id: 'recovery-plan', label: 'Recovery Plan', icon: '📋' },
  { id: 'incident-timeline', label: 'Incident Timeline', icon: '📜' },
];

export default function Sidebar() {
  const { state, dispatch } = useSimulation();

  return (
    <aside className="w-[220px] min-w-[220px] h-screen bg-[#060b14] border-r border-[#1e3a5f] flex flex-col select-none">
      {/* App title */}
      <div className="px-4 pt-5 pb-3 border-b border-[#1e3a5f]/50">
        <h1 className="text-[#3b82f6] text-sm font-bold tracking-wider">GRID DISASTER</h1>
        <h2 className="text-[#3b82f6] text-sm font-bold tracking-wider">AI</h2>
        <p className="text-[#64748b] text-[10px] mt-1 leading-tight">
          Predict the cascade.<br />
          Protect the critical.<br />
          Restore the grid.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(item => {
          const isActive = state.selectedView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => dispatch({ type: 'SET_VIEW', view: item.id })}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all duration-150
                ${isActive
                  ? 'bg-[#1e3a5f]/40 text-white border-r-2 border-[#3b82f6]'
                  : 'text-[#64748b] hover:bg-[#1e3a5f]/20 hover:text-[#94a3b8]'
                }`}
              style={isActive ? { boxShadow: 'inset 2px 0 0 #3b82f6' } : {}}
            >
              <span className="text-sm">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Bottom status */}
      <div className="px-4 py-3 border-t border-[#1e3a5f]/50">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse-glow" />
          <span className="text-[#64748b] text-[10px]">System Online</span>
        </div>
      </div>
    </aside>
  );
}