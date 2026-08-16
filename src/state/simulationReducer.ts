import { SimulationState, SimulationAction, TimelineEntry, DeliberationEntry } from '../types';
import {
  createInitialAssets,
  createInitialLines,
  createInitialAgents,
  createInitialRecoveryPlan,
  ANALYSIS_STAGES,
} from '../data/scenarioData';

function createInitialState(): SimulationState {
  return {
    incidentState: 'MONITORING',
    scenario: 'hurricane',
    severity: 'catastrophic',
    timeOfDay: 'night',
    gridStability: 96,
    customersWithoutPower: 0,
    criticalFacilitiesAtRisk: 0,
    estimatedRestorationTime: 'Stable',
    clockSeconds: 0,
    isPaused: false,
    simulationPhase: 0,
    recoveryPhase: 0,
    isAuthorized: false,
    isAuthorizing: false,
    selectedView: 'command-center',
    assets: createInitialAssets(),
    transmissionLines: createInitialLines(),
    agents: createInitialAgents(),
    deliberationFeed: [],
    currentAnalysisStage: 0,
    recoveryPlan: createInitialRecoveryPlan(),
    timeline: [],
    timelineIdCounter: 0,
    recoveryActionTimer: 0,
    recoveryCompleted: false,
    analysisComplete: false,
    conflictsLogged: false,
    selectedAssetId: null,
    gridFilter: 'ALL',
    liveAdvisory: null,
    advisoryLoading: false,
    advisoryError: false,
    llmRequestAttempted: false,
  };
}

export function getInitialState(): SimulationState {
  return createInitialState();
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function addTimelineEntry(
  state: SimulationState,
  type: TimelineEntry['type'],
  title: string,
  description: string
): void {
  state.timeline.push({
    id: ++state.timelineIdCounter,
    timestamp: formatTime(state.clockSeconds),
    type,
    title,
    description,
    clockSeconds: state.clockSeconds,
  });
}

function addDeliberationEntry(
  state: SimulationState,
  agentId: number,
  agentName: string,
  agentColor: string,
  finding: string,
  recommendation: string,
  confidence: number,
  isConflict: boolean
): void {
  state.deliberationFeed.push({
    agentId,
    agentName,
    agentColor,
    timestamp: formatTime(state.clockSeconds),
    confidence,
    finding,
    recommendation,
    isConflict,
  });
}

export function simulationReducer(state: SimulationState, action: SimulationAction): SimulationState {
  switch (action.type) {
    case 'RUN_DISASTER': {
      const newState = { ...state };
      // Reset everything first
      const fresh = createInitialState();
      Object.assign(newState, fresh);
      newState.selectedView = state.selectedView;
      newState.timeline = [...newState.timeline];

      // Start disaster
      newState.incidentState = 'DISASTER_DETECTED';
      newState.simulationPhase = 1;
      newState.clockSeconds = 0;
      newState.isPaused = false;

      // Phase 1 changes
      const asset8 = newState.assets.find(a => a.id === 8)!;
      asset8.state = 'STRESSED';
      const lineL3 = newState.transmissionLines.find(l => l.id === 'l3')!;
      lineL3.state = 'STRESSED';

      // Add timeline entry
      addTimelineEntry(newState, 'DETECTION', 'Hurricane-force winds detected along coastal corridor', 'Wind speeds exceeding 130mph reported at Coastal Transfer Station.');

      return newState;
    }

    case 'PAUSE': {
      if (state.incidentState === 'MONITORING' || state.incidentState === 'STABILIZED') return state;
      return { ...state, isPaused: true };
    }

    case 'RESUME': {
      return { ...state, isPaused: false };
    }

    case 'RESET': {
      const fresh = createInitialState();
      return { ...fresh, selectedView: state.selectedView };
    }

    case 'SET_VIEW': {
      return { ...state, selectedView: action.view };
    }

    case 'TOGGLE_AUTHORIZATION': {
      return { ...state, isAuthorized: !state.isAuthorized };
    }

    case 'APPROVE_RECOVERY': {
      if (!state.isAuthorized) return state;

      const newState = { ...state, isAuthorizing: true, timeline: [...state.timeline] };

      // Authorize all recovery actions
      newState.recoveryPlan = newState.recoveryPlan.map(a => ({ ...a, status: 'AUTHORIZED' as const }));
      newState.incidentState = 'RECOVERY_ACTIVE';
      newState.recoveryPhase = 0;
      newState.recoveryActionTimer = 0;

      // Timeline entry
      addTimelineEntry(newState, 'HUMAN_DECISION', 'Human authorization received — recovery approved', 'Incident Commander authorized the coordinated recovery plan.');

      return newState;
    }

    case 'EXPAND_AGENT': {
      return {
        ...state,
        agents: state.agents.map(a =>
          a.id === action.agentId ? { ...a, expanded: !a.expanded } : a
        ),
      };
    }

    case 'SELECT_ASSET': {
      return { ...state, selectedAssetId: action.assetId };
    }

    case 'SET_GRID_FILTER': {
      return { ...state, gridFilter: action.filter };
    }

    /* Live Advisory reducer cases */
    case 'SET_LIVE_ADVISORY': {
      return { ...state, liveAdvisory: action.advisory, advisoryLoading: false, advisoryError: false };
    }

    case 'SET_ADVISORY_LOADING': {
      return { ...state, advisoryLoading: true, advisoryError: false, llmRequestAttempted: true };
    }

    case 'SET_ADVISORY_ERROR': {
      return { ...state, advisoryLoading: false, advisoryError: true };
    }

    case 'TICK': {
      if (state.incidentState === 'MONITORING' || state.incidentState === 'STABILIZED') return state;
      if (state.isPaused) return state;

      const newState = { ...state, clockSeconds: state.clockSeconds + 1 };
      // Deep clone mutable arrays
      newState.assets = newState.assets.map(a => ({ ...a }));
      newState.transmissionLines = newState.transmissionLines.map(l => ({ ...l }));
      newState.agents = newState.agents.map(a => ({ ...a }));
      newState.recoveryPlan = newState.recoveryPlan.map(a => ({ ...a }));
      newState.deliberationFeed = [...newState.deliberationFeed];
      newState.timeline = [...newState.timeline];

      const tick = newState.clockSeconds;

      // --- CASCADE PHASES ---
      if (newState.simulationPhase >= 1 && newState.simulationPhase < 11) {
        // Phase transitions based on time
        const assets = newState.assets;
        const lines = newState.transmissionLines;

        const getAsset = (id: number) => assets.find(a => a.id === id)!;

        function setLineState(fromId: number, toId: number, st: string) {
          const l = lines.find(l => (l.fromId === fromId && l.toId === toId) || (l.fromId === toId && l.toId === fromId));
          if (l) l.state = st as any;
        }

        // Phase 1: t=0 (DISASTER_DETECTED) - already handled
        // Phase 2: t=2s
        if (tick >= 2 && newState.simulationPhase < 2) {
          newState.simulationPhase = 2;
          getAsset(8).state = 'FAILED';
          setLineState(2, 8, 'FAILED');
          addTimelineEntry(newState, 'DETECTION', 'Coastal Transfer Station damaged by debris impact', 'Debris impact reported at Coastal Transfer Station. Structural damage detected.');
        }
        // Phase 3: t=4s
        else if (tick >= 4 && newState.simulationPhase < 3) {
          newState.simulationPhase = 3;
          getAsset(4).state = 'STRESSED';
          setLineState(2, 4, 'STRESSED');
          setLineState(3, 4, 'STRESSED');
          setLineState(8, 4, 'FAILED');
          addTimelineEntry(newState, 'PREDICTION', 'East Junction overload predicted within 7 minutes', 'Load rerouted to East Junction exceeding rated capacity.');
        }
        // Phase 4: t=6s
        else if (tick >= 6 && newState.simulationPhase < 4) {
          newState.simulationPhase = 4;
          getAsset(4).state = 'OVERLOADED';
          newState.incidentState = 'CASCADE_IN_PROGRESS';
        }
        // Phase 5: t=8s
        else if (tick >= 8 && newState.simulationPhase < 5) {
          newState.simulationPhase = 5;
          getAsset(7).state = 'STRESSED';
          setLineState(4, 7, 'STRESSED');
        }
        // Phase 6: t=10s
        else if (tick >= 10 && newState.simulationPhase < 6) {
          newState.simulationPhase = 6;
          getAsset(9).state = 'STRESSED';
          setLineState(5, 9, 'STRESSED');
          addTimelineEntry(newState, 'DETECTION', 'Saint Anne Medical Center entered backup-power mode', 'Medical center automatically switched to backup generators as primary feed degraded.');
        }
        // Phase 7: t=12s
        else if (tick >= 12 && newState.simulationPhase < 7) {
          newState.simulationPhase = 7;
          getAsset(12).state = 'STRESSED';
          setLineState(5, 12, 'STRESSED');
          addTimelineEntry(newState, 'PREDICTION', 'Water infrastructure at risk if cascade continues', 'North Water Treatment Plant may lose pumping capacity within 30 minutes.');
        }
        // Phase 8: t=14s
        else if (tick >= 14 && newState.simulationPhase < 8) {
          newState.simulationPhase = 8;
          getAsset(13).state = 'STRESSED';
          setLineState(4, 13, 'STRESSED');
        }
        // Phase 9: t=16s
        else if (tick >= 16 && newState.simulationPhase < 9) {
          newState.simulationPhase = 9;
          getAsset(6).state = 'STRESSED';
          setLineState(3, 6, 'STRESSED');
          setLineState(4, 7, 'OVERLOADED');
          setLineState(8, 7, 'FAILED');
        }
        // Phase 10: t=18s
        else if (tick >= 18 && newState.simulationPhase < 10) {
          newState.simulationPhase = 10;
          getAsset(4).state = 'FAILED';
          getAsset(7).state = 'OVERLOADED';
          getAsset(6).state = 'OVERLOADED';
          setLineState(4, 7, 'FAILED');
          setLineState(4, 13, 'FAILED');
        }
        // Phase 11: t=20s — transition to AI ANALYSIS
        else if (tick >= 20 && newState.simulationPhase < 11) {
          newState.simulationPhase = 11;
          newState.incidentState = 'AI_ANALYSIS';
          newState.currentAnalysisStage = 0;

          // Activate all agents
          newState.agents.forEach(a => {
            a.status = 'RECEIVING_DATA';
          });

          addTimelineEntry(newState, 'AGENT_DECISION', 'AI coordination initiated — 5 agents analyzing', 'All specialist agents activated and receiving incident data.');
        }
      }

      // --- METRICS UPDATE DURING CASCADE ---
      if (newState.incidentState === 'DISASTER_DETECTED' || newState.incidentState === 'CASCADE_IN_PROGRESS') {
        const progress = Math.min(1, tick / 20);
        newState.gridStability = Math.round(96 - (96 - 43) * progress);
        newState.customersWithoutPower = Math.round(487200 * progress);
        newState.criticalFacilitiesAtRisk = Math.round(8 * progress);
        if (tick >= 2) {
          const hrs = Math.round(18 + (26 - 18) * progress);
          newState.estimatedRestorationTime = `${hrs}-${hrs + 8} hrs`;
        }
      }

      // --- AI ANALYSIS PROGRESSION ---
      if (newState.incidentState === 'AI_ANALYSIS') {
        const analysisTick = tick - 20;

        // Progress through stages every ~1.5 seconds
        const stage = Math.min(Math.floor(analysisTick / 1.5), ANALYSIS_STAGES.length - 1);
        newState.currentAnalysisStage = stage;

        // Update agent statuses based on stage
        if (stage < 3) {
          newState.agents.forEach(a => { a.status = 'ANALYZING'; });
        } else if (stage === 4) {
          newState.agents.forEach(a => {
            a.status = a.id === 1 || a.id === 3 ? 'CONFLICT_DETECTED' : 'ANALYZING';
          });
        } else if (stage >= 5) {
          newState.agents.forEach(a => { a.status = a.isRecoveryCommander ? 'ANALYZING' : 'COMPLETE'; });
          if (stage >= 5 && !newState.conflictsLogged) {
            newState.conflictsLogged = true;
            // Add deliberation entries when agents complete
            const conflictEntry: DeliberationEntry = {
              agentId: 1,
              agentName: 'Grid Stability Agent',
              agentColor: '#06b6d4',
              timestamp: formatTime(newState.clockSeconds),
              confidence: 97,
              finding: 'Eastern distribution zone is critically overloaded',
              recommendation: 'Immediately isolate the eastern distribution zone to prevent regional grid collapse',
              isConflict: true,
            };
            newState.deliberationFeed.push(conflictEntry);

            const conflictEntry2: DeliberationEntry = {
              agentId: 3,
              agentName: 'Public Safety Agent',
              agentColor: '#eab308',
              timestamp: formatTime(newState.clockSeconds),
              confidence: 88,
              finding: 'Isolation would interrupt power to approximately 82,000 residents',
              recommendation: 'Delay isolation until alternate power routed to affected residential areas',
              isConflict: true,
            };
            newState.deliberationFeed.push(conflictEntry2);

            addTimelineEntry(newState, 'AGENT_DECISION', 'Agent disagreement identified — isolation vs. public impact', 'Grid Stability Agent recommends immediate isolation. Public Safety Agent warns of 82,000 affected residents.');
          }
        }

        // Update agent confidence progressively
        newState.agents.forEach(a => {
          if (a.baseConfidence !== a.finalConfidence) {
            const progress2 = Math.min(1, analysisTick / 12);
            a.confidence = Math.round(a.baseConfidence + (a.finalConfidence - a.baseConfidence) * progress2);
          }
        });

        // When analysis is complete, transition to AWAITING_HUMAN_AUTHORIZATION
        if (stage >= ANALYSIS_STAGES.length - 1 && !newState.analysisComplete) {
          newState.analysisComplete = true;
          newState.agents.forEach(a => {
            a.status = a.isRecoveryCommander ? 'COMPLETE' : 'COMPLETE';
          });

          // Add the recovery commander entry
          addDeliberationEntry(
            newState,
            5,
            'Recovery Commander Agent',
            '#8b5cf6',
            'Conflicting priorities identified: isolation vs public impact vs medical risk',
            'Protect Saint Anne Medical Center with emergency generation first, then isolate the damaged corridor and reroute available power through Central Substation',
            93,
            false
          );

          addTimelineEntry(newState, 'AGENT_DECISION', 'Recovery strategy generated — coordinated plan ready', 'Recovery Commander Agent resolved all conflicts. Coordinated plan awaiting human authorization.');

          newState.incidentState = 'AWAITING_HUMAN_AUTHORIZATION';
        }
      }

      // --- METRICS DURING AI ANALYSIS ---
      if (newState.incidentState === 'AI_ANALYSIS' || newState.incidentState === 'AWAITING_HUMAN_AUTHORIZATION') {
        // Stay at crisis levels
        newState.gridStability = Math.max(43, newState.gridStability);
      }

      // --- RECOVERY PHASES ---
      if (newState.incidentState === 'RECOVERY_ACTIVE' && !newState.recoveryCompleted) {
        newState.recoveryActionTimer = newState.recoveryActionTimer + 1;

        const currentlyActive = newState.recoveryPlan.find(a => a.status === 'IN_PROGRESS');
        const nextAction = newState.recoveryPlan.find(a => a.status === 'AUTHORIZED');

        // Each action: 3s IN_PROGRESS, then COMPLETED
        if (!currentlyActive && nextAction) {
          // Start next action
          nextAction.status = 'IN_PROGRESS';
          newState.recoveryActionTimer = 0;

          // Add timeline entry
          const actionDetails: Record<number, { type: TimelineEntry['type']; title: string; desc: string }> = {
            1: { type: 'FIELD_ACTION', title: 'Mobile generator dispatched to Saint Anne Medical Center', desc: 'Repair Crew Charlie en route with 500kW mobile generator.' },
            2: { type: 'FIELD_ACTION', title: 'Power secured to North Water Treatment Plant', desc: 'Grid Operations maintaining service to water infrastructure.' },
            3: { type: 'FIELD_ACTION', title: 'Damaged coastal corridor isolated', desc: 'Grid Operations isolating the coastal transmission corridor.' },
            4: { type: 'FIELD_ACTION', title: 'Power rerouted through Central Substation', desc: 'Alternate routing established through Central Substation.' },
            5: { type: 'FIELD_ACTION', title: 'Crew Alpha dispatched to East Junction', desc: 'Crew Alpha en route to repair overloaded substation.' },
            6: { type: 'FIELD_ACTION', title: 'Crew Bravo dispatched to Harbor Line 4', desc: 'Crew Bravo en route to repair damaged transmission line.' },
            7: { type: 'FIELD_ACTION', title: 'Noncritical industrial demand reduced by 18%', desc: 'Grid Operations reducing system load to prevent secondary failures.' },
            8: { type: 'FIELD_ACTION', title: 'Emergency alerts issued to eastern district', desc: 'Public Safety notifying affected residents.' },
            9: { type: 'RECOVERY', title: 'Grid stability reassessment initiated', desc: 'All teams monitoring recovery progress.' },
          };
          const details = actionDetails[nextAction.id];
          if (details) {
            addTimelineEntry(newState, details.type, details.title, details.desc);
          }
        } else if (currentlyActive && newState.recoveryActionTimer >= 3) {
          // Complete current action
          currentlyActive.status = 'COMPLETED';

          // Update asset states based on action completed
          if (currentlyActive.id === 1) {
            const saintAnne = newState.assets.find(a => a.id === 9);
            if (saintAnne) saintAnne.state = 'PROTECTED';
            addTimelineEntry(newState, 'RECOVERY', 'Saint Anne Medical Center secured', 'Mobile generator operational. Critical medical facility protected.');
          }
          if (currentlyActive.id === 2) {
            const water = newState.assets.find(a => a.id === 12);
            if (water) water.state = 'PROTECTED';
          }
          if (currentlyActive.id === 3) {
            // Isolate corridor - mark damaged lines as FAILED
            newState.transmissionLines.forEach(l => {
              if (l.id === 'l3' || l.id === 'l12' || l.id === 'l13') {
                if (l.state === 'FAILED') l.state = 'RESTORING';
              }
            });
            addTimelineEntry(newState, 'FIELD_ACTION', 'Damaged coastal corridor isolated', 'Cascade stopped. Further failures prevented.');
          }
          if (currentlyActive.id === 4) {
            newState.assets.forEach(a => {
              if (a.state === 'OVERLOADED') a.state = 'RESTORING';
            });
            addTimelineEntry(newState, 'FIELD_ACTION', 'Power rerouted through Central Substation', 'Alternate routing restoring partial service to affected zones.');
          }
          if (currentlyActive.id === 5) {
            const eastJct = newState.assets.find(a => a.id === 4);
            if (eastJct) eastJct.state = 'RESTORING';
          }
          if (currentlyActive.id === 6) {
            const lineL4 = newState.transmissionLines.find(l => l.id === 'l4');
            if (lineL4) lineL4.state = 'RESTORING';
            const lineL3 = newState.transmissionLines.find(l => l.id === 'l3');
            if (lineL3) lineL3.state = 'RESTORING';
          }

          // Check if all done
          const allDone = newState.recoveryPlan.every(a => a.status === 'COMPLETED');
          if (allDone) {
            newState.recoveryCompleted = true;
            newState.incidentState = 'STABILIZED';

            // Final asset restore
            newState.assets.forEach(a => {
              if (a.state === 'RESTORING' || a.state === 'PROTECTED') a.state = 'RESTORED';
              if (a.state === 'STRESSED' || a.state === 'OVERLOADED' || a.state === 'FAILED') a.state = 'RESTORED';
            });
            newState.transmissionLines.forEach(l => {
              if (l.state === 'RESTORING') l.state = 'RESTORED';
              if (l.state === 'FAILED' || l.state === 'STRESSED' || l.state === 'OVERLOADED') l.state = 'RESTORED';
            });

            addTimelineEntry(newState, 'RECOVERY', 'Grid stability improving — all systems nominal', `Grid stability at ${newState.gridStability}%.`);
            addTimelineEntry(newState, 'RECOVERY', 'Critical infrastructure protected — all major facilities', 'All hospitals, water treatment, and communications facilities secure.');
            addTimelineEntry(newState, 'RECOVERY', 'Incident stabilized — grid restored to safe operating parameters', 'GridRescue AI successfully coordinated recovery operations.');
          }
        }

        // Recovery metrics
        if (!newState.recoveryCompleted) {
          const totalActions = newState.recoveryPlan.length;
          const done = newState.recoveryPlan.filter(a => a.status === 'COMPLETED' || a.status === 'IN_PROGRESS').length;
          const recoveryProgress = Math.min(1, done / totalActions);

          newState.gridStability = Math.round(43 + (78 - 43) * recoveryProgress);
          newState.customersWithoutPower = Math.round(487200 - (487200 - 82000) * recoveryProgress);
          newState.criticalFacilitiesAtRisk = Math.max(0, Math.round(8 - 8 * recoveryProgress));
          newState.estimatedRestorationTime = `4-6 hrs`;
        } else {
          newState.gridStability = 78;
          newState.customersWithoutPower = 82000;
          newState.criticalFacilitiesAtRisk = 0;
          newState.estimatedRestorationTime = '4-6 hrs';
        }
      }

      return newState;
    }

    default:
      return state;
  }
}