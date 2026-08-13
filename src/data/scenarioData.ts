import { Agent, RecoveryAction, GridAsset, TransmissionLine } from '../types';

export const ANALYSIS_STAGES = [
  'RECEIVING INCIDENT DATA',
  'MAPPING DEPENDENCIES',
  'FORECASTING SECONDARY FAILURES',
  'EVALUATING RESPONSE OPTIONS',
  'IDENTIFYING CONFLICTS',
  'COORDINATING RECOVERY STRATEGY',
  'RECOMMENDATION COMPLETE',
];

export const INCIDENT_STATE_LABELS: Record<string, { label: string; color: string }> = {
  MONITORING: { label: 'MONITORING', color: '#22c55e' },
  DISASTER_DETECTED: { label: 'DISASTER DETECTED', color: '#f97316' },
  CASCADE_IN_PROGRESS: { label: 'CASCADE IN PROGRESS', color: '#ef4444' },
  AI_ANALYSIS: { label: 'AI ANALYSIS', color: '#8b5cf6' },
  AWAITING_HUMAN_AUTHORIZATION: { label: 'AWAITING AUTHORIZATION', color: '#eab308' },
  RECOVERY_ACTIVE: { label: 'RECOVERY ACTIVE', color: '#3b82f6' },
  STABILIZED: { label: 'STABILIZED', color: '#22c55e' },
};

export function getIncidentSummary(state: string, stability: number): string {
  switch (state) {
    case 'MONITORING':
      return 'All systems nominal. Grid is operating within normal parameters. No incidents detected.';
    case 'DISASTER_DETECTED':
      return 'Category 4 Hurricane has made landfall. Coastal infrastructure sustaining damage. Monitoring cascading effects.';
    case 'CASCADE_IN_PROGRESS':
      return `Grid stability at ${stability}%. Failures propagating through eastern distribution corridor. Multiple substations at risk.`;
    case 'AI_ANALYSIS':
      return 'AI coordination active. Five specialist agents analyzing incident data and formulating recovery strategy.';
    case 'AWAITING_HUMAN_AUTHORIZATION':
      return 'Recovery strategy ready. Human authorization required to begin grid restoration operations.';
    case 'RECOVERY_ACTIVE':
      return `Recovery operations in progress. Grid stability recovering at ${stability}%.`;
    case 'STABILIZED':
      return 'Incident stabilized. Grid restored to safe operating parameters. All critical infrastructure protected.';
    default:
      return '';
  }
}

export function createInitialAssets(): GridAsset[] {
  return [
    { id: 1, name: 'North Ridge Generation Station', shortName: 'North Ridge Gen', type: 'generation', x: 250, y: 60, state: 'OPERATIONAL' },
    { id: 2, name: 'Harbor Gas Plant', shortName: 'Harbor Gas', type: 'generation', x: 700, y: 80, state: 'OPERATIONAL' },
    { id: 3, name: 'Central Substation', shortName: 'Central Sub', type: 'substation', x: 450, y: 190, state: 'OPERATIONAL' },
    { id: 4, name: 'East Junction', shortName: 'East Junction', type: 'substation', x: 720, y: 280, state: 'OPERATIONAL' },
    { id: 5, name: 'West Valley Substation', shortName: 'West Valley', type: 'substation', x: 200, y: 280, state: 'OPERATIONAL' },
    { id: 6, name: 'Riverbend Substation', shortName: 'Riverbend', type: 'substation', x: 380, y: 390, state: 'OPERATIONAL' },
    { id: 7, name: 'Metro Distribution Hub', shortName: 'Metro Hub', type: 'distribution', x: 570, y: 410, state: 'OPERATIONAL' },
    { id: 8, name: 'Coastal Transfer Station', shortName: 'Coastal Trans.', type: 'substation', x: 700, y: 160, state: 'OPERATIONAL' },
    { id: 9, name: 'Saint Anne Medical Center', shortName: 'Saint Anne Med', type: 'critical', x: 150, y: 490, state: 'OPERATIONAL' },
    { id: 10, name: 'Regional Trauma Hospital', shortName: 'Regional Trauma', type: 'critical', x: 420, y: 530, state: 'OPERATIONAL' },
    { id: 11, name: "Children's Medical Center", shortName: "Children's Med", type: 'critical', x: 620, y: 530, state: 'OPERATIONAL' },
    { id: 12, name: 'North Water Treatment Plant', shortName: 'Water Treatment', type: 'critical', x: 250, y: 380, state: 'OPERATIONAL' },
    { id: 13, name: 'Metro Communications Hub', shortName: 'Comms Hub', type: 'critical', x: 560, y: 300, state: 'OPERATIONAL' },
    { id: 14, name: 'Riverside Emergency Shelter', shortName: 'Riverside Shelter', type: 'critical', x: 760, y: 490, state: 'OPERATIONAL' },
  ];
}

export function createInitialLines(): TransmissionLine[] {
  return [
    { id: 'l1', fromId: 1, toId: 3, fromName: 'North Ridge', toName: 'Central Sub', state: 'OPERATIONAL' },
    { id: 'l2', fromId: 1, toId: 5, fromName: 'North Ridge', toName: 'West Valley', state: 'OPERATIONAL' },
    { id: 'l3', fromId: 2, toId: 8, fromName: 'Harbor Gas', toName: 'Coastal Trans.', state: 'OPERATIONAL' },
    { id: 'l4', fromId: 2, toId: 4, fromName: 'Harbor Gas', toName: 'East Junction', state: 'OPERATIONAL' },
    { id: 'l5', fromId: 3, toId: 4, fromName: 'Central Sub', toName: 'East Junction', state: 'OPERATIONAL' },
    { id: 'l6', fromId: 3, toId: 5, fromName: 'Central Sub', toName: 'West Valley', state: 'OPERATIONAL' },
    { id: 'l7', fromId: 3, toId: 6, fromName: 'Central Sub', toName: 'Riverbend', state: 'OPERATIONAL' },
    { id: 'l8', fromId: 5, toId: 12, fromName: 'West Valley', toName: 'Water Treatment', state: 'OPERATIONAL' },
    { id: 'l9', fromId: 5, toId: 9, fromName: 'West Valley', toName: 'Saint Anne Med', state: 'OPERATIONAL' },
    { id: 'l10', fromId: 4, toId: 7, fromName: 'East Junction', toName: 'Metro Hub', state: 'OPERATIONAL' },
    { id: 'l11', fromId: 4, toId: 13, fromName: 'East Junction', toName: 'Comms Hub', state: 'OPERATIONAL' },
    { id: 'l12', fromId: 8, toId: 4, fromName: 'Coastal Trans.', toName: 'East Junction', state: 'OPERATIONAL' },
    { id: 'l13', fromId: 8, toId: 7, fromName: 'Coastal Trans.', toName: 'Metro Hub', state: 'OPERATIONAL' },
    { id: 'l14', fromId: 6, toId: 7, fromName: 'Riverbend', toName: 'Metro Hub', state: 'OPERATIONAL' },
    { id: 'l15', fromId: 6, toId: 10, fromName: 'Riverbend', toName: 'Regional Trauma', state: 'OPERATIONAL' },
    { id: 'l16', fromId: 7, toId: 11, fromName: 'Metro Hub', toName: "Children's Med", state: 'OPERATIONAL' },
    { id: 'l17', fromId: 7, toId: 13, fromName: 'Metro Hub', toName: 'Comms Hub', state: 'OPERATIONAL' },
    { id: 'l18', fromId: 7, toId: 14, fromName: 'Metro Hub', toName: 'Riverside Shelter', state: 'OPERATIONAL' },
    { id: 'l19', fromId: 6, toId: 12, fromName: 'Riverbend', toName: 'Water Treatment', state: 'OPERATIONAL' },
  ];
}

export function createInitialAgents(): Agent[] {
  return [
    {
      id: 1,
      name: 'Grid Stability Agent',
      color: '#06b6d4',
      concern: 'Grid load balance, transmission stress, cascade containment',
      finding: 'Eastern distribution zone is critically overloaded',
      recommendation: 'Immediately isolate the eastern distribution zone to prevent regional grid collapse',
      status: 'IDLE',
      confidence: 94,
      baseConfidence: 94,
      finalConfidence: 97,
      reasoning: 'Analysis of load distribution across the eastern corridor shows cascading overload conditions. The failure of Coastal Transfer Station has redirected 340 MW through East Junction, which is rated for only 220 MW. Without immediate isolation, the overload will cascade southward through Metro Distribution Hub, potentially affecting 200,000+ additional customers.',
      expanded: false,
      isRecoveryCommander: false,
    },
    {
      id: 2,
      name: 'Critical Infrastructure Agent',
      color: '#f43f5e',
      concern: 'Hospitals, water, communications, shelters',
      finding: 'Saint Anne Medical Center is within affected zone with 42 minutes backup power remaining',
      recommendation: 'Prioritize power restoration to medical and water infrastructure',
      status: 'IDLE',
      confidence: 87,
      baseConfidence: 87,
      finalConfidence: 91,
      reasoning: 'Saint Anne Medical Center has 42 minutes of backup generator fuel remaining. North Water Treatment Plant has no backup power and will lose pumping capacity within 30 minutes of failure. Metro Communications Hub serves emergency services radio and cellular backhaul — its UPS provides 15 minutes. Three of eight critical facilities are in the direct failure zone.',
      expanded: false,
      isRecoveryCommander: false,
    },
    {
      id: 3,
      name: 'Public Safety Agent',
      color: '#eab308',
      concern: 'Population impact, vulnerable communities, evacuation risk',
      finding: 'Isolation would interrupt power to approximately 82,000 residents',
      recommendation: 'Delay isolation until alternate power routed to affected residential areas',
      status: 'IDLE',
      confidence: 82,
      baseConfidence: 82,
      finalConfidence: 88,
      reasoning: 'The eastern district contains 82,000 residents including 12,000 in high-density housing, 3 skilled nursing facilities, and 2 schools. Isolation without notice would leave vulnerable populations without power during a hurricane. Nighttime evacuation is especially dangerous. We need at minimum 30 minutes advance notice and rerouted power to shelters before cutting the zone.',
      expanded: false,
      isRecoveryCommander: false,
    },
    {
      id: 4,
      name: 'Repair and Resources Agent',
      color: '#22c55e',
      concern: 'Repair crews, mobile generators, equipment, fuel',
      finding: 'Mobile generator available for deployment to Saint Anne Medical Center',
      recommendation: 'Deploy mobile generator to Saint Anne Medical Center before isolating the zone',
      status: 'IDLE',
      confidence: 90,
      baseConfidence: 90,
      finalConfidence: 94,
      reasoning: 'Inventory check: 2 mobile generators (500 kW each) available at Central Depot. One can reach Saint Anne Medical Center in 12 minutes. Crew Alpha (4 technicians) is stationed at West Valley. Crew Bravo (3 line workers) is at North Ridge. Harbor line 4 repair requires weather clearance — winds still at 65mph in that corridor. Estimated 45 min before safe to dispatch.',
      expanded: false,
      isRecoveryCommander: false,
    },
    {
      id: 5,
      name: 'Recovery Commander Agent',
      color: '#8b5cf6',
      concern: 'Coordinated strategy, conflict resolution, mission prioritization',
      finding: 'Conflicting priorities identified: isolation vs public impact vs medical risk',
      recommendation: 'Protect Saint Anne Medical Center with emergency generation first, then isolate the damaged corridor and reroute available power through Central Substation',
      status: 'IDLE',
      confidence: 93,
      baseConfidence: 93,
      finalConfidence: 93,
      reasoning: 'After evaluating all agent recommendations: Grid Stability requires isolation to prevent system collapse (urgent). Public Safety warns against cutting power to 82K residents without notice. Critical Infrastructure notes Saint Anne has 42 min of backup power. Optimal sequence: (1) Deploy mobile gen to Saint Anne (12 min), (2) Issue public alerts (3 min), (3) Isolate corridor (8 min), (4) Reroute through Central (15 min). This resolves all conflicts.',
      expanded: false,
      isRecoveryCommander: true,
    },
  ];
}

export function createInitialRecoveryPlan(): RecoveryAction[] {
  return [
    { id: 1, title: 'Deploy mobile generation to Saint Anne Medical Center', team: 'Repair Crew Charlie', benefit: 'Restores backup power to critical medical facility', risk: 'Low', estTime: '12 min', status: 'PROPOSED', order: 1 },
    { id: 2, title: 'Preserve electrical service to North Water Treatment Plant', team: 'Grid Operations', benefit: 'Maintains water infrastructure', risk: 'Low', estTime: 'Ongoing', status: 'PROPOSED', order: 2 },
    { id: 3, title: 'Isolate the damaged coastal transmission corridor', team: 'Grid Operations', benefit: 'Stops cascade from spreading', risk: 'Medium — affects 82,000 customers', estTime: '8 min', status: 'PROPOSED', order: 3 },
    { id: 4, title: 'Reroute available power through Central Substation', team: 'Grid Operations', benefit: 'Restores partial service to affected zones', risk: 'Medium', estTime: '15 min', status: 'PROPOSED', order: 4 },
    { id: 5, title: 'Dispatch Crew Alpha to East Junction', team: 'Crew Alpha', benefit: 'Repairs overloaded substation equipment', risk: 'Low', estTime: '30 min', status: 'PROPOSED', order: 5 },
    { id: 6, title: 'Dispatch Crew Bravo to Harbor Line 4', team: 'Crew Bravo', benefit: 'Repairs damaged transmission line', risk: 'Low (weather-dependent)', estTime: '45 min', status: 'PROPOSED', order: 6 },
    { id: 7, title: 'Reduce noncritical industrial demand by 18%', team: 'Grid Operations', benefit: 'Reduces system load to prevent secondary failures', risk: 'Low — industrial only, no residential', estTime: '5 min', status: 'PROPOSED', order: 7 },
    { id: 8, title: 'Issue emergency alerts to eastern district', team: 'Public Safety', benefit: 'Informs affected residents', risk: 'None', estTime: '3 min', status: 'PROPOSED', order: 8 },
    { id: 9, title: 'Reassess grid stability after every major action', team: 'All teams', benefit: 'Ensures recovery stays on track', risk: 'None', estTime: 'Continuous', status: 'PROPOSED', order: 9 },
  ];
}

export const TIMELINE_EVENT_TEMPLATES: Array<{ type: 'DETECTION' | 'PREDICTION' | 'AGENT_DECISION' | 'HUMAN_DECISION' | 'FIELD_ACTION' | 'RECOVERY'; title: string; desc: string; phaseTrigger?: number }> = [
  { type: 'DETECTION', title: 'Hurricane-force winds detected along coastal corridor', desc: 'Wind speeds exceeding 130mph reported at Coastal Transfer Station.', phaseTrigger: 1 },
  { type: 'DETECTION', title: 'Coastal Transfer Station damaged by debris impact', desc: 'Debris impact reported at Coastal Transfer Station. Structural damage detected.', phaseTrigger: 2 },
  { type: 'PREDICTION', title: 'East Junction overload predicted within 7 minutes', desc: 'Load rerouted to East Junction exceeding rated capacity.', phaseTrigger: 3 },
  { type: 'DETECTION', title: 'Saint Anne Medical Center entered backup-power mode', desc: 'Medical center automatically switched to backup generators as primary feed degraded.', phaseTrigger: 6 },
  { type: 'PREDICTION', title: 'Water infrastructure at risk if cascade continues', desc: 'North Water Treatment Plant may lose pumping capacity within 30 minutes.', phaseTrigger: 7 },
  { type: 'AGENT_DECISION', title: 'AI coordination initiated — 5 agents analyzing', desc: 'All specialist agents activated and receiving incident data.', phaseTrigger: 11 },
  { type: 'AGENT_DECISION', title: 'Agent disagreement identified — isolation vs. public impact', desc: 'Grid Stability Agent recommends immediate isolation. Public Safety Agent warns of 82,000 affected residents.', phaseTrigger: 13 },
  { type: 'AGENT_DECISION', title: 'Recovery strategy generated — coordinated plan ready', desc: 'Recovery Commander Agent resolved all conflicts. Coordinated plan awaiting human authorization.', phaseTrigger: 14 },
  { type: 'HUMAN_DECISION', title: 'Human authorization received — recovery approved', desc: 'Incident Commander authorized the coordinated recovery plan.', phaseTrigger: 15 },
  { type: 'FIELD_ACTION', title: 'Mobile generator dispatched to Saint Anne Medical Center', desc: 'Repair Crew Charlie en route with 500kW mobile generator.', phaseTrigger: 15 },
];