export type IncidentState =
  | 'MONITORING'
  | 'DISASTER_DETECTED'
  | 'CASCADE_IN_PROGRESS'
  | 'AI_ANALYSIS'
  | 'AWAITING_HUMAN_AUTHORIZATION'
  | 'RECOVERY_ACTIVE'
  | 'STABILIZED';

export type AssetState =
  | 'OPERATIONAL'
  | 'STRESSED'
  | 'OVERLOADED'
  | 'FAILED'
  | 'PROTECTED'
  | 'RESTORING'
  | 'RESTORED';

export type LineState =
  | 'OPERATIONAL'
  | 'STRESSED'
  | 'OVERLOADED'
  | 'FAILED'
  | 'RESTORING'
  | 'RESTORED';

export type AgentStatus =
  | 'IDLE'
  | 'RECEIVING_DATA'
  | 'ANALYZING'
  | 'CONFLICT_DETECTED'
  | 'COMPLETE';

export type ActionStatus =
  | 'PROPOSED'
  | 'AUTHORIZED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'DISABLED';

export type EventType =
  | 'DETECTION'
  | 'PREDICTION'
  | 'AGENT_DECISION'
  | 'HUMAN_DECISION'
  | 'FIELD_ACTION'
  | 'RECOVERY';

export interface GridAsset {
  id: number;
  name: string;
  shortName: string;
  type: 'generation' | 'substation' | 'distribution' | 'critical';
  x: number;
  y: number;
  state: AssetState;
}

export interface TransmissionLine {
  id: string;
  fromId: number;
  toId: number;
  fromName: string;
  toName: string;
  state: LineState;
}

export interface Agent {
  id: number;
  name: string;
  color: string;
  concern: string;
  finding: string;
  recommendation: string;
  status: AgentStatus;
  confidence: number;
  baseConfidence: number;
  finalConfidence: number;
  reasoning: string;
  expanded: boolean;
  isRecoveryCommander: boolean;
}

export interface DeliberationEntry {
  agentId: number;
  agentName: string;
  agentColor: string;
  timestamp: string;
  confidence: number;
  finding: string;
  recommendation: string;
  isConflict: boolean;
}

export interface RecoveryAction {
  id: number;
  title: string;
  team: string;
  benefit: string;
  risk: string;
  estTime: string;
  status: ActionStatus;
  order: number;
}

export interface TimelineEntry {
  id: number;
  timestamp: string;
  type: EventType;
  title: string;
  description: string;
  clockSeconds: number;
}

export interface LiveAdvisoryData {
  situationAssessment: string;
  primaryPriority: string;
  recommendedSequence: string;
  majorTradeoff: string;
  whyThisPlan: string;
  humanDecisionRequired: string;
  provider: string;
}

export interface SimulationState {
  incidentState: IncidentState;
  scenario: 'hurricane';
  severity: 'catastrophic';
  timeOfDay: 'night';
  gridStability: number;
  customersWithoutPower: number;
  criticalFacilitiesAtRisk: number;
  estimatedRestorationTime: string;
  clockSeconds: number;
  isPaused: boolean;
  simulationPhase: number;
  recoveryPhase: number;
  isAuthorized: boolean;
  isAuthorizing: boolean;
  selectedView: string;
  assets: GridAsset[];
  transmissionLines: TransmissionLine[];
  agents: Agent[];
  deliberationFeed: DeliberationEntry[];
  currentAnalysisStage: number;
  recoveryPlan: RecoveryAction[];
  timeline: TimelineEntry[];
  timelineIdCounter: number;
  recoveryActionTimer: number;
  recoveryCompleted: boolean;
  analysisComplete: boolean;
  conflictsLogged: boolean;
  /* Tier 2A UI state */
  selectedAssetId: number | null;
  gridFilter: string;
  /* Live Advisory */
  liveAdvisory: LiveAdvisoryData | null;
  advisoryLoading: boolean;
  advisoryError: boolean;
  llmRequestAttempted: boolean;
}

export type SimulationAction =
  | { type: 'RUN_DISASTER' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'TICK' }
  | { type: 'RESET' }
  | { type: 'SET_VIEW'; view: string }
  | { type: 'TOGGLE_AUTHORIZATION' }
  | { type: 'APPROVE_RECOVERY' }
  | { type: 'EXPAND_AGENT'; agentId: number }
  | { type: 'SELECT_ASSET'; assetId: number | null }
  | { type: 'SET_GRID_FILTER'; filter: string }
  /* Live Advisory actions */
  | { type: 'SET_LIVE_ADVISORY'; advisory: LiveAdvisoryData }
  | { type: 'SET_ADVISORY_LOADING' }
  | { type: 'SET_ADVISORY_ERROR' };