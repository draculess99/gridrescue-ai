import { useSimulation } from '../state/SimulationContext';

const FILTERS = [
  { id: 'ALL', label: 'All' },
  { id: 'FAILED', label: 'Failed' },
  { id: 'AT_RISK', label: 'At Risk' },
  { id: 'CRITICAL', label: 'Critical' },
  { id: 'RESTORED', label: 'Restored' },
];

export default function GridFilters() {
  const { state, dispatch } = useSimulation();
  const active = state.gridFilter;

  return (
    <div className="flex items-center gap-1.5">
      {FILTERS.map((f) => {
        const isActive = active === f.id;
        return (
          <button
            key={f.id}
            onClick={() => dispatch({ type: 'SET_GRID_FILTER', filter: f.id })}
            className={`px-2.5 py-1 rounded text-[10px] font-medium tracking-wide transition-all duration-150
              ${isActive
                ? 'bg-[#3b82f6]/20 text-[#3b82f6] border border-[#3b82f6]/40 shadow-sm'
                : 'text-[#64748b] border border-[#1e3a5f]/50 hover:border-[#3b82f6]/30 hover:text-[#94a3b8]'
              }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}