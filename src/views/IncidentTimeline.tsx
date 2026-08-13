import { useEffect, useState } from 'react';
import { useSimulation } from '../state/SimulationContext';
import {
  getIncidentMemory,
  type IncidentMemory
} from '../lib/memoryApi';

const EVENT_TYPES: Record<string, { color: string; label: string }> = {
  DETECTION: { color: '#ef4444', label: 'DETECTION' },
  PREDICTION: { color: '#f97316', label: 'PREDICTION' },
  AGENT_DECISION: { color: '#8b5cf6', label: 'AGENT DECISION' },
  HUMAN_DECISION: { color: '#eab308', label: 'HUMAN DECISION' },
  FIELD_ACTION: { color: '#3b82f6', label: 'FIELD ACTION' },
  RECOVERY: { color: '#22c55e', label: 'RECOVERY' },
};

export default function IncidentTimeline() {
  const { state } = useSimulation();

  const [incidentMemories, setIncidentMemories] = useState<IncidentMemory[]>([]);

  useEffect(() => {
   getIncidentMemory()
    .then((result) => {
      setIncidentMemories(result.incidents);
    })
    .catch((error) => {
      console.error('Failed to load CockroachDB incident history:', error);
    });
  }, []);

  const timeline = [...state.timeline].reverse();

  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-52px)]">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[#e2e8f0] tracking-wide">INCIDENT TIMELINE</h1>
        <p className="text-xs text-[#64748b] mt-0.5">Chronological event log — all incident activity</p>
      </div>
      <div className="mb-5 bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4">
  <div className="flex items-center justify-between mb-3">
    <div>
      <h2 className="text-sm font-bold text-[#e2e8f0] tracking-wide">
        PERSISTENT INCIDENT MEMORY
      </h2>
      <p className="text-xs text-[#64748b] mt-0.5">
        Recent incidents retrieved from CockroachDB through AWS Lambda
      </p>
    </div>

    <span className="text-xs font-mono text-[#22c55e]">
      {incidentMemories.length} memories loaded
    </span>
  </div>

  {incidentMemories.length === 0 ? (
    <p className="text-xs text-[#64748b]">
      No persistent incident memories available.
    </p>
  ) : (
    <div className="space-y-2">
      {incidentMemories.map((incident) => (
        <div
          key={incident.id}
          className="bg-[#0b1220] border border-[#1e3a5f] rounded p-3"
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-[#e2e8f0]">
                {incident.incident_type}
              </div>

              <div className="text-xs text-[#94a3b8] mt-1">
                {incident.scenario_summary || 'Stored disaster incident'}
              </div>
            </div>

            <span className="text-[10px] font-bold text-[#f97316]">
              {incident.severity}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3 text-xs">
            <div>
              <span className="text-[#64748b]">Grid Stability</span>
              <div className="font-mono text-[#e2e8f0]">
                {incident.grid_stability ?? '—'}%
              </div>
            </div>

            <div>
              <span className="text-[#64748b]">Without Power</span>
              <div className="font-mono text-[#e2e8f0]">
                {incident.customers_without_power.toLocaleString()}
              </div>
            </div>

            <div>
              <span className="text-[#64748b]">Facilities at Risk</span>
              <div className="font-mono text-[#e2e8f0]">
                {incident.facilities_at_risk}
              </div>
            </div>

            <div>
              <span className="text-[#64748b]">Cascade Risk</span>
              <div className="font-mono text-[#e2e8f0]">
                {incident.cascade_probability ?? '—'}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

      {timeline.length === 0 && (
        <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl mb-2 block">📜</span>
            <p className="text-sm text-[#64748b]">No events recorded</p>
            <p className="text-xs text-[#475569] mt-1">Launch a disaster scenario to populate the timeline</p>
          </div>
        </div>
      )}

      {timeline.length > 0 && (
        <div className="space-y-2">
          {timeline.map((entry) => {
            const eventType = EVENT_TYPES[entry.type] || EVENT_TYPES.DETECTION;
            return (
              <div
                key={entry.id}
                className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-3 flex items-start gap-3 animate-fade-in"
              >
                {/* Timestamp */}
                <div className="shrink-0 w-14 pt-0.5">
                  <span className="font-mono text-[10px] font-bold text-[#e2e8f0]">{entry.timestamp}</span>
                </div>

                {/* Event Type Badge */}
                <div
                  className="shrink-0 px-2 py-0.5 rounded text-[9px] font-bold tracking-wider"
                  style={{
                    backgroundColor: eventType.color + '22',
                    color: eventType.color,
                    border: `1px solid ${eventType.color}44`,
                  }}
                >
                  {eventType.label}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-[#e2e8f0]">{entry.title}</p>
                  <p className="text-[10px] text-[#64748b] mt-0.5">{entry.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}