import { useSimulation } from '../state/SimulationContext';
import { GridAsset, TransmissionLine, LineState } from '../types';
import GridFilters from '../components/GridFilters';
import AssetDetailPanel from '../components/AssetDetailPanel';

const ASSET_WIDTH = 130;
const ASSET_HEIGHT = 44;
const ASSET_RX = 6;

const STATE_STYLES: Record<string, { fill: string; stroke: string; textFill: string }> = {
  OPERATIONAL: { fill: '#22c55e22', stroke: '#22c55e', textFill: '#22c55e' },
  STRESSED: { fill: '#eab30822', stroke: '#eab308', textFill: '#eab308' },
  OVERLOADED: { fill: '#f9731622', stroke: '#f97316', textFill: '#f97316' },
  FAILED: { fill: '#ef444422', stroke: '#ef4444', textFill: '#ef4444' },
  PROTECTED: { fill: '#3b82f622', stroke: '#3b82f6', textFill: '#3b82f6' },
  RESTORING: { fill: '#06b6d422', stroke: '#06b6d4', textFill: '#06b6d4' },
  RESTORED: { fill: '#22c55e22', stroke: '#22c55e', textFill: '#22c55e' },
};

function getLineStyle(state: LineState): { stroke: string; strokeDasharray: string; animation?: string } {
  switch (state) {
    case 'OPERATIONAL':
      return { stroke: '#22c55e', strokeDasharray: 'none' };
    case 'STRESSED':
      return { stroke: '#eab308', strokeDasharray: '8 4', animation: 'line-flow 1s linear infinite' };
    case 'OVERLOADED':
      return { stroke: '#f97316', strokeDasharray: '8 4', animation: 'line-flow 0.5s linear infinite' };
    case 'FAILED':
      return { stroke: '#ef4444', strokeDasharray: '4 6' };
    case 'RESTORING':
      return { stroke: '#06b6d4', strokeDasharray: '8 4', animation: 'line-flow 1s linear infinite' };
    case 'RESTORED':
      return { stroke: '#22c55e', strokeDasharray: 'none' };
    default:
      return { stroke: '#22c55e', strokeDasharray: 'none' };
  }
}

function AssetNode({ asset, selected, onClick }: { asset: GridAsset; selected: boolean; onClick: () => void }) {
  const style = STATE_STYLES[asset.state] || STATE_STYLES.OPERATIONAL;
  const cx = asset.x + ASSET_WIDTH / 2;
  const cy = asset.y + ASSET_HEIGHT / 2;

  return (
    <g className="transition-all duration-500" onClick={onClick} style={{ cursor: 'pointer' }}>
      {/* Selection highlight ring */}
      {selected && (
        <rect
          x={asset.x - 3} y={asset.y - 3}
          width={ASSET_WIDTH + 6} height={ASSET_HEIGHT + 6}
          rx={ASSET_RX + 2}
          fill="none" stroke="#3b82f6" strokeWidth={2} opacity={0.8}
          className="animate-pulse-glow"
        />
      )}
      <rect
        x={asset.x}
        y={asset.y}
        width={ASSET_WIDTH}
        height={ASSET_HEIGHT}
        rx={ASSET_RX}
        fill={selected ? '#3b82f622' : style.fill}
        stroke={selected ? '#3b82f6' : style.stroke}
        strokeWidth={selected ? 2 : 1.5}
        className={
          asset.state === 'STRESSED' || asset.state === 'OVERLOADED' || asset.state === 'RESTORING'
            ? 'animate-pulse-glow' : ''
        }
      />
      <text
        x={cx}
        y={cy - 3}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={style.textFill}
        fontSize="9"
        fontFamily="monospace"
        fontWeight="bold"
      >
        {asset.shortName}
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        dominantBaseline="middle"
        fill={style.textFill}
        fontSize="7"
        fontFamily="sans-serif"
        opacity={0.7}
      >
        {asset.state}
      </text>
      {/* Status dot */}
      <circle cx={asset.x + ASSET_WIDTH - 10} cy={asset.y + 10} r={4} fill={style.stroke} />
      {/* Pulse ring for non-operational */}
      {(asset.state === 'STRESSED' || asset.state === 'OVERLOADED' || asset.state === 'RESTORING') && (
        <circle
          cx={asset.x + ASSET_WIDTH - 10}
          cy={asset.y + 10}
          r={4}
          fill="none"
          stroke={style.stroke}
          strokeWidth={1}
          opacity={0.5}
          className="animate-pulse-glow"
        />
      )}
    </g>
  );
}

function LineElement({ line, assets }: { line: TransmissionLine; assets: GridAsset[] }) {
  const from = assets.find(a => a.id === line.fromId);
  const to = assets.find(a => a.id === line.toId);
  if (!from || !to) return null;

  const lStyle = getLineStyle(line.state);
  const x1 = from.x + ASSET_WIDTH / 2;
  const y1 = from.y + ASSET_HEIGHT / 2;
  const x2 = to.x + ASSET_WIDTH / 2;
  const y2 = to.y + ASSET_HEIGHT / 2;

  return (
    <line
      x1={x1}
      y1={y1}
      x2={x2}
      y2={y2}
      stroke={lStyle.stroke}
      strokeWidth={2.5}
      strokeDasharray={lStyle.strokeDasharray === 'none' ? undefined : lStyle.strokeDasharray}
      className="transition-all duration-500"
      style={lStyle.animation ? { animation: lStyle.animation } : undefined}
      opacity={line.state === 'FAILED' ? 0.5 : 0.9}
    />
  );
}

function shouldShowAsset(asset: GridAsset, filter: string): boolean {
  if (filter === 'ALL') return true;
  if (filter === 'FAILED') return asset.state === 'FAILED';
  if (filter === 'AT_RISK') return asset.state === 'STRESSED' || asset.state === 'OVERLOADED';
  if (filter === 'CRITICAL') return asset.type === 'critical';
  if (filter === 'RESTORED') return asset.state === 'RESTORED' || asset.state === 'RESTORING' || asset.state === 'PROTECTED';
  return true;
}

function shouldShowLine(line: TransmissionLine, assets: GridAsset[], filter: string): boolean {
  if (filter === 'ALL') return true;
  const from = assets.find(a => a.id === line.fromId);
  const to = assets.find(a => a.id === line.toId);
  if (filter === 'FAILED') return line.state === 'FAILED';
  if (filter === 'AT_RISK') return line.state === 'STRESSED' || line.state === 'OVERLOADED';
  if (filter === 'RESTORED') return line.state === 'RESTORED' || line.state === 'RESTORING';
  return true;
}

export default function GridNetwork() {
  const { state, dispatch } = useSimulation();
  const filter = state.gridFilter;

  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-52px)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-[#e2e8f0] tracking-wide">GRID NETWORK</h1>
          <p className="text-xs text-[#64748b] mt-0.5">Electrical grid schematic — live status</p>
        </div>
        <GridFilters />
      </div>

      <div className="bg-[#060b14] border border-[#1e3a5f] rounded-lg overflow-hidden relative">
        <svg
          viewBox="0 0 960 620"
          className="w-full"
          style={{ minHeight: '500px' }}
        >
          {/* Background grid pattern */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e3a5f" strokeWidth="0.5" opacity={0.3} />
            </pattern>
          </defs>
          <rect width="960" height="620" fill="#0a0e17" />
          <rect width="960" height="620" fill="url(#grid)" />

          {/* Title */}
          <text x={480} y={30} textAnchor="middle" fill="#64748b" fontSize="11" fontFamily="monospace" fontWeight="bold" letterSpacing="4">
            METROPOLITAN POWER GRID — SCHEMATIC OVERVIEW
          </text>

          {/* Region labels */}
          <text x={220} y={44} textAnchor="middle" fill="#1e3a5f" fontSize="9" fontFamily="monospace" letterSpacing="3">
            ← NORTHERN GENERATION →
          </text>
          <text x={700} y={50} textAnchor="middle" fill="#1e3a5f" fontSize="9" fontFamily="monospace" letterSpacing="3">
            ← COASTAL CORRIDOR →
          </text>
          <text x={250} y={350} textAnchor="middle" fill="#1e3a5f" fontSize="9" fontFamily="monospace" letterSpacing="3">
            ← WESTERN DISTRIBUTION →
          </text>
          <text x={660} y={235} textAnchor="middle" fill="#1e3a5f" fontSize="9" fontFamily="monospace" letterSpacing="3">
            ← EASTERN DISTRIBUTION →
          </text>

          {/* Transmission lines */}
          {state.transmissionLines
            .filter(line => shouldShowLine(line, state.assets, filter))
            .map(line => (
              <LineElement key={line.id} line={line} assets={state.assets} />
            ))}

          {/* Assets */}
          {state.assets
            .filter(asset => shouldShowAsset(asset, filter))
            .map(asset => (
              <AssetNode
                key={asset.id}
                asset={asset}
                selected={state.selectedAssetId === asset.id}
                onClick={() => dispatch({ type: 'SELECT_ASSET', assetId: asset.id })}
              />
            ))}

          {/* Filter count */}
          {filter !== 'ALL' && (
            <text x={480} y={610} textAnchor="middle" fill="#64748b" fontSize="9" fontFamily="monospace">
              Showing {state.assets.filter(a => shouldShowAsset(a, filter)).length} of {state.assets.length} assets
            </text>
          )}

          {/* Legend */}
          <g transform="translate(760, 560)">
            <rect x={0} y={0} width={190} height={56} rx={4} fill="#0a0e17" stroke="#1e3a5f" strokeWidth={1} opacity={0.9} />
            <text x={8} y={14} fill="#64748b" fontSize="8" fontFamily="monospace" fontWeight="bold" letterSpacing="1">STATUS LEGEND</text>
            {[
              { color: '#22c55e', label: 'Operational' },
              { color: '#eab308', label: 'Stressed' },
              { color: '#f97316', label: 'Overloaded' },
              { color: '#ef4444', label: 'Failed' },
              { color: '#3b82f6', label: 'Protected' },
              { color: '#06b6d4', label: 'Restoring' },
            ].map((item, i) => (
              <g key={i} transform={`translate(${8 + (i % 3) * 62}, ${24 + Math.floor(i / 3) * 14})`}>
                <circle cx={0} cy={0} r={3} fill={item.color} />
                <text x={7} y={3} fill="#94a3b8" fontSize="8" fontFamily="sans-serif">{item.label}</text>
              </g>
            ))}
          </g>
        </svg>

        {/* Asset Detail Panel */}
        <AssetDetailPanel />
      </div>
    </div>
  );
}