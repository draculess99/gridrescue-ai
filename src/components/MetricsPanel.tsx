import { useSimulation } from '../state/SimulationContext';

interface MetricDef {
  key: string;
  label: string;
  unit: string;
  icon: string;
  formatter: (v: number | string) => string;
  high: boolean;
  isString?: boolean;
}

const METRICS: MetricDef[] = [
  {
    key: 'gridStability',
    label: 'Grid Stability',
    unit: '%',
    icon: '⚡',
    formatter: (v) => `${v}%`,
    high: true,
  },
  {
    key: 'customersWithoutPower',
    label: 'Without Power',
    unit: '',
    icon: '🏘️',
    formatter: (v) => Number(v).toLocaleString(),
    high: false,
  },
  {
    key: 'criticalFacilitiesAtRisk',
    label: 'Facilities at Risk',
    unit: '',
    icon: '🏥',
    formatter: (v) => v.toString(),
    high: false,
  },
  {
    key: 'estimatedRestorationTime',
    label: 'Est. Restoration',
    unit: '',
    icon: '⏱️',
    formatter: (v) => v.toString(),
    high: false,
    isString: true,
  },
] as const;

export default function MetricsPanel() {
  const { state } = useSimulation();

  return (
    <div className="grid grid-cols-4 gap-3">
      {METRICS.map(metric => {
        const raw = state[metric.key as keyof typeof state] as string | number;
        const value = metric.isString ? (raw as string) : metric.formatter(raw as number);
        let color = '#94a3b8';

        if (!metric.isString) {
          const v = raw as number;
          if (metric.high) {
            color = v >= 80 ? '#22c55e' : v >= 60 ? '#eab308' : v >= 40 ? '#f97316' : '#ef4444';
          } else {
            color = v === 0 ? '#22c55e' : v <= 1000 ? '#eab308' : '#ef4444';
          }
        } else {
          if (raw === 'Stable') color = '#22c55e';
          else if ((raw as string).includes('hrs')) color = '#eab308';
        }

        return (
          <div
            key={metric.key}
            className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4 flex flex-col gap-1.5"
          >
            <div className="flex items-center justify-between">
              <span className="text-[#64748b] text-[10px] font-medium tracking-wide">{metric.label}</span>
              <span className="text-sm">{metric.icon}</span>
            </div>
            <span
              className="font-mono text-2xl font-bold transition-all duration-300"
              style={{ color }}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
}