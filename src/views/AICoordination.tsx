import { useEffect, useRef } from 'react';
import AgentCard from '../components/AgentCard';
import { useSimulation } from '../state/SimulationContext';
import { ANALYSIS_STAGES } from '../data/scenarioData';
import { RECOVERY_COMMANDER_FUNCTION, SUPABASE_ANON_KEY } from '../lib/supabase';
import type { SimulationState } from '../types';

const STAGE_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#ef4444',
  '#f97316',
  '#22c55e',
];

/**
 * Builds a bounded snapshot of the simulation for the LLM. Only ground-truth
 * data is included — never any credentials.
 */
function buildSnapshot(state: SimulationState) {
  return {
    incidentState: state.incidentState,
    scenario: state.scenario,
    severity: state.severity,
    timeOfDay: state.timeOfDay,
    gridStability: state.gridStability,
    customersWithoutPower: state.customersWithoutPower,
    criticalFacilitiesAtRisk: state.criticalFacilitiesAtRisk,
    estimatedRestorationTime: state.estimatedRestorationTime,
    clockSeconds: state.clockSeconds,
    assets: state.assets.map(a => ({ name: a.name, type: a.type, state: a.state })),
    lines: state.transmissionLines.map(l => ({ from: l.fromName, to: l.toName, state: l.state })),
    agents: state.agents.map(a => ({
      name: a.name,
      concern: a.concern,
      finding: a.finding,
      recommendation: a.recommendation,
      confidence: a.confidence,
      isRecoveryCommander: a.isRecoveryCommander,
    })),
    recoveryPlan: state.recoveryPlan.map(a => ({
      title: a.title,
      team: a.team,
      benefit: a.benefit,
      risk: a.risk,
      estTime: a.estTime,
      status: a.status,
      order: a.order,
    })),
    deliberationFeed: state.deliberationFeed.map(e => ({
      agentName: e.agentName,
      finding: e.finding,
      recommendation: e.recommendation,
      confidence: e.confidence,
      isConflict: e.isConflict,
    })),
  };
}

function AdvisoryPanel() {
  const { state, dispatch } = useSimulation();
  const inFlightRef = useRef(false);
  const incidentStateRef = useRef(state.incidentState);
  incidentStateRef.current = state.incidentState;

  const canRequest = state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';

  useEffect(() => {
    // Trigger the live advisory exactly once per simulation run.
    // llmRequestAttempted (shared state) survives rerenders AND view changes,
    // so navigating away and back can never cause a second call.
    if (!canRequest || state.llmRequestAttempted || inFlightRef.current) return;

    // Synchronous ref guard prevents double-fire on the same render cycle
    // (e.g. React 18 StrictMode double-invoking effects in dev).
    inFlightRef.current = true;
    dispatch({ type: 'SET_ADVISORY_LOADING' });

    fetch(RECOVERY_COMMANDER_FUNCTION, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({ snapshot: buildSnapshot(state) }),
    })
      .then(async res => {
        const data = await res.json().catch(() => null);
        if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
        return data;
      })
      .then(data => {
        // Ignore the response if the simulation has moved past the
        // authorization gate (e.g. user hit RESET while the LLM was busy).
        if (incidentStateRef.current !== 'AWAITING_HUMAN_AUTHORIZATION') return;
        if (data?.advisory) {
          dispatch({ type: 'SET_LIVE_ADVISORY', advisory: data.advisory });
        } else {
          dispatch({ type: 'SET_ADVISORY_ERROR' });
        }
      })
      .catch(() => {
        if (incidentStateRef.current === 'AWAITING_HUMAN_AUTHORIZATION') {
          dispatch({ type: 'SET_ADVISORY_ERROR' });
        }
      })
      .finally(() => {
        inFlightRef.current = false;
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canRequest, state.llmRequestAttempted, dispatch]);

  // Only show the panel once the human decision gate is reached.
  if (
    state.incidentState !== 'AWAITING_HUMAN_AUTHORIZATION' &&
    state.incidentState !== 'RECOVERY_ACTIVE' &&
    state.incidentState !== 'STABILIZED'
  ) {
    return null;
  }

  const { liveAdvisory, advisoryLoading, advisoryError } = state;

  return (
    <div className="bg-[#0f1729] border border-[#8b5cf6]/40 rounded-lg p-4 mb-4 relative overflow-hidden">
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#8b5cf6] via-[#a855f7] to-[#8b5cf6]" />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h2 className="text-xs font-semibold text-[#e2e8f0] tracking-wide">LIVE RECOVERY COMMANDER ADVISORY</h2>
          {!advisoryError && !liveAdvisory && (
            <span className="text-[8px] font-bold text-[#a855f7] bg-[#a855f7]/10 border border-[#a855f7]/30 rounded px-1.5 py-0.5 uppercase tracking-wider animate-pulse">
              Groq LLM
            </span>
          )}
          {liveAdvisory && (
            <span className="text-[8px] font-bold text-[#22c55e] bg-[#22c55e]/10 border border-[#22c55e]/30 rounded px-1.5 py-0.5 uppercase tracking-wider">
              LIVE LLM · Powered by Groq
            </span>
          )}
        </div>
        {advisoryLoading && (
          <span className="text-[9px] font-mono text-[#64748b] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#a855f7] animate-ping" />
            consulting LLM…
          </span>
        )}
      </div>

      {/* Loading state */}
      {advisoryLoading && !liveAdvisory && (
        <div className="space-y-2">
          <div className="h-3 bg-[#1e3a5f]/60 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-[#1e3a5f]/60 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-[#1e3a5f]/60 rounded animate-pulse w-2/3" />
          <p className="text-[10px] text-[#64748b] mt-3 flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 border-2 border-[#a855f7] border-t-transparent rounded-full animate-spin" />
            Recovery Commander Agent is generating a live advisory from the current grid snapshot…
          </p>
        </div>
      )}

      {/* Error state — no automatic retry, no retry button */}
      {advisoryError && !liveAdvisory && (
        <div className="bg-[#ef4444]/5 border border-[#ef4444]/20 rounded-md p-3">
          <p className="text-xs font-semibold text-[#ef4444] mb-1">Live advisory unavailable</p>
          <p className="text-[11px] text-[#94a3b8] leading-relaxed">
            The Recovery Commander Agent could not reach the language model. You can still review the
            agent recommendations below and proceed with the pre-generated recovery plan, or reset the
            simulation to try a fresh run.
          </p>
        </div>
      )}

      {/* Result state */}
      {liveAdvisory && !advisoryLoading && (
        <div className="space-y-3">
          <div className="bg-[#8b5cf6]/10 border border-[#8b5cf6]/40 rounded px-3 py-2">
            <p className="text-[10px] font-bold text-[#c4b5fd] tracking-wider text-center">
              AI-GENERATED ADVISORY — HUMAN AUTHORIZATION REQUIRED
            </p>
          </div>
          <div>
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">SITUATION ASSESSMENT</div>
            <p className="text-xs text-[#e2e8f0] leading-relaxed">{liveAdvisory.situationAssessment}</p>
          </div>
          <div>
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">PRIMARY PRIORITY</div>
            <p className="text-xs text-[#fbbf24] leading-relaxed">{liveAdvisory.primaryPriority}</p>
          </div>
          <div>
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">RECOMMENDED SEQUENCE</div>
            <pre className="text-xs text-[#e2e8f0] whitespace-pre-wrap font-mono leading-relaxed bg-[#060b14] border border-[#1e3a5f]/60 rounded p-3">
              {liveAdvisory.recommendedSequence}
            </pre>
          </div>
          <div>
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">KEY TRADEOFF</div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{liveAdvisory.majorTradeoff}</p>
          </div>
          <div>
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">WHY THIS PLAN</div>
            <p className="text-xs text-[#94a3b8] leading-relaxed">{liveAdvisory.whyThisPlan}</p>
          </div>
          <div className="border-t border-[#1e3a5f]/60 pt-3">
            <div className="text-[9px] text-[#8b5cf6] font-bold tracking-wider mb-1">DECISION REQUIRED</div>
            <p className="text-xs text-[#e2e8f0] font-semibold leading-relaxed">“{liveAdvisory.humanDecisionRequired}”</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AICoordination() {
  const { state } = useSimulation();

  const isAnalyzing = state.incidentState === 'AI_ANALYSIS' || state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';
  const currentStage = state.currentAnalysisStage;

  return (
    <div className="p-5 overflow-y-auto h-[calc(100vh-52px)]">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-[#e2e8f0] tracking-wide">AI COORDINATION</h1>
        <p className="text-xs text-[#64748b] mt-0.5">Specialist agent deliberation and conflict resolution</p>
      </div>

      {/* Live Recovery Commander Advisory (Groq LLM via Supabase Edge Function) */}
      <AdvisoryPanel />

      {/* Analysis Progress */}
      {isAnalyzing && (
        <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold text-[#e2e8f0]">ANALYSIS PROGRESS</h2>
            <span className="text-[10px] font-mono text-[#64748b]">
              Stage {Math.min(currentStage + 1, ANALYSIS_STAGES.length)}/{ANALYSIS_STAGES.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {ANALYSIS_STAGES.map((stage, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className={`w-full h-1.5 rounded-full transition-all duration-300 ${
                    i <= currentStage ? 'opacity-100' : 'opacity-20'
                  }`}
                  style={{
                    backgroundColor: i <= currentStage ? STAGE_COLORS[i] : '#1e3a5f',
                    boxShadow: i === currentStage ? `0 0 6px ${STAGE_COLORS[i]}` : 'none',
                  }}
                />
                <span
                  className={`text-[7px] text-center leading-tight ${
                    i <= currentStage ? 'text-[#94a3b8]' : 'text-[#1e3a5f]'
                  }`}
                >
                  {stage}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <span
              className="text-[10px] font-bold tracking-wide"
              style={{ color: currentStage < ANALYSIS_STAGES.length ? STAGE_COLORS[currentStage] : '#22c55e' }}
            >
              {currentStage < ANALYSIS_STAGES.length
                ? `► ${ANALYSIS_STAGES[currentStage]}`
                : '✓ ANALYSIS COMPLETE'}
            </span>
          </div>
        </div>
      )}

      {/* Agent Grid */}
      {!isAnalyzing && state.incidentState === 'MONITORING' && (
        <div className="bg-[#0f1729] border border-[#1e3a5f] rounded-lg p-8 flex items-center justify-center">
          <div className="text-center">
            <span className="text-3xl mb-2 block">🤖</span>
            <p className="text-sm text-[#64748b]">AI agents are standing by</p>
            <p className="text-xs text-[#475569] mt-1">Launch a disaster scenario to activate agent coordination</p>
          </div>
        </div>
      )}

      {/* Recovery Commander highlighted differently */}
      {state.agents.length > 0 && (isAnalyzing || state.incidentState !== 'MONITORING') && (
        <div className="space-y-4">
          {/* Commander card full width */}
          <div className="w-full">
            <AgentCard agentId={5} />
          </div>

          {/* Four specialist agents in grid */}
          <div className="grid grid-cols-2 gap-4">
            <AgentCard agentId={1} />
            <AgentCard agentId={2} />
            <AgentCard agentId={3} />
            <AgentCard agentId={4} />
          </div>
        </div>
      )}
    </div>
  );
}
