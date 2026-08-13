import { SimulationState } from '../types';

/* ─── FORECAST HELPERS ──────────────────────────────────────── */

export interface ForecastItem {
  assetName: string;
  probability: number;
  timeToFailure: string;
  populationImpact: number;
  criticalDependency: string;
  riskSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface ForecastHorizon {
  label: string;
  items: ForecastItem[];
}

export function getForecastData(state: SimulationState): ForecastHorizon[] {
  const phase = state.simulationPhase;
  const isCascade = phase >= 1 && phase < 11;
  const isAnalysis = state.incidentState === 'AI_ANALYSIS' || state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';
  const isRecovery = state.incidentState === 'RECOVERY_ACTIVE';
  const isStable = state.incidentState === 'STABILIZED';
  const monitoring = state.incidentState === 'MONITORING';

  // Monitoring: all clear
  if (monitoring) {
    return [
      {
        label: 'NOW',
        items: [{ assetName: 'All systems nominal', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
      {
        label: 'NEXT 15 MINUTES',
        items: [{ assetName: 'No predicted failures', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
      {
        label: 'NEXT 60 MINUTES',
        items: [{ assetName: 'No predicted failures', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
    ];
  }

  if (isStable) {
    return [
      {
        label: 'NOW',
        items: [{ assetName: 'Grid stabilized', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
      {
        label: 'NEXT 15 MINUTES',
        items: [{ assetName: 'Monitoring only', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
      {
        label: 'NEXT 60 MINUTES',
        items: [{ assetName: 'Full restoration expected', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }],
      },
    ];
  }

  // Derive predictions based on current phase
  const nowItems: ForecastItem[] = [];
  const next15Items: ForecastItem[] = [];
  const next60Items: ForecastItem[] = [];

  // Always present during cascade
  const getAsset = (id: number) => state.assets.find(a => a.id === id);
  const eastJct = getAsset(4);
  const metroHub = getAsset(7);
  const waterPlant = getAsset(12);
  const saintAnne = getAsset(9);
  const commsHub = getAsset(13);

  // East Junction
  if (eastJct && (eastJct.state === 'STRESSED' || eastJct.state === 'OVERLOADED' || eastJct.state === 'FAILED')) {
    nowItems.push({
      assetName: 'East Junction',
      probability: eastJct.state === 'FAILED' ? 100 : eastJct.state === 'OVERLOADED' ? 92 : 78,
      timeToFailure: eastJct.state === 'FAILED' ? 'FAILED' : eastJct.state === 'OVERLOADED' ? '3 min' : '7 min',
      populationImpact: 142000,
      criticalDependency: 'Metro Distribution Hub',
      riskSeverity: 'CRITICAL',
    });
  } else if (isCascade || isAnalysis) {
    nowItems.push({
      assetName: 'East Junction', probability: 65, timeToFailure: '~12 min', populationImpact: 142000, criticalDependency: 'Metro Distribution Hub', riskSeverity: 'HIGH',
    });
  }

  // Metro Distribution Hub
  if (metroHub && (metroHub.state === 'STRESSED' || metroHub.state === 'OVERLOADED' || metroHub.state === 'FAILED')) {
    nowItems.push({
      assetName: 'Metro Distribution Hub',
      probability: metroHub.state === 'FAILED' ? 100 : metroHub.state === 'OVERLOADED' ? 85 : 68,
      timeToFailure: metroHub.state === 'FAILED' ? 'FAILED' : metroHub.state === 'OVERLOADED' ? '5 min' : '14 min',
      populationImpact: 198000,
      criticalDependency: 'Children\'s Medical Center',
      riskSeverity: 'CRITICAL',
    });
  } else if (isCascade || isAnalysis) {
    next15Items.push({
      assetName: 'Metro Distribution Hub', probability: 78, timeToFailure: '14 min', populationImpact: 198000, criticalDependency: 'Children\'s Medical Center', riskSeverity: 'CRITICAL',
    });
  }

  // Water Treatment Plant
  if (waterPlant && (waterPlant.state === 'STRESSED' || waterPlant.state === 'FAILED')) {
    nowItems.push({
      assetName: 'North Water Treatment Plant',
      probability: waterPlant.state === 'FAILED' ? 100 : 67,
      timeToFailure: waterPlant.state === 'FAILED' ? 'FAILED' : '22 min',
      populationImpact: 215000,
      criticalDependency: 'West Valley Substation',
      riskSeverity: 'HIGH',
    });
  } else if (phase >= 7 && !state.recoveryCompleted) {
    next15Items.push({
      assetName: 'North Water Treatment Plant', probability: 67, timeToFailure: '22 min', populationImpact: 215000, criticalDependency: 'West Valley Substation', riskSeverity: 'HIGH',
    });
  }

  // Saint Anne Medical Center
  if (saintAnne && (saintAnne.state === 'STRESSED' || saintAnne.state === 'FAILED')) {
    nowItems.push({
      assetName: 'Saint Anne Medical Center',
      probability: saintAnne.state === 'FAILED' ? 100 : 61,
      timeToFailure: saintAnne.state === 'FAILED' ? 'FAILED' : '42 min (backup)',
      populationImpact: 3400,
      criticalDependency: 'Backup generators',
      riskSeverity: 'HIGH',
    });
  } else if (saintAnne && saintAnne.state !== 'PROTECTED' && saintAnne.state !== 'RESTORED' && (phase >= 6)) {
    next15Items.push({
      assetName: 'Saint Anne Medical Center', probability: 61, timeToFailure: '35 min (backup)', populationImpact: 3400, criticalDependency: 'Backup generators', riskSeverity: 'HIGH',
    });
  }

  // Comms Hub
  if (commsHub && (commsHub.state === 'STRESSED' || commsHub.state === 'FAILED')) {
    next15Items.push({
      assetName: 'Metro Communications Hub',
      probability: commsHub.state === 'FAILED' ? 100 : 55,
      timeToFailure: commsHub.state === 'FAILED' ? 'FAILED' : '18 min',
      populationImpact: 480000,
      criticalDependency: 'Emergency Services Radio',
      riskSeverity: 'HIGH',
    });
  } else if (phase >= 8 && !state.recoveryCompleted) {
    next15Items.push({
      assetName: 'Metro Communications Hub', probability: 55, timeToFailure: '18 min', populationImpact: 480000, criticalDependency: 'Emergency Services Radio', riskSeverity: 'HIGH',
    });
  }

  // Children's Medical Center
  if (isCascade && !state.recoveryCompleted) {
    next60Items.push({
      assetName: 'Children\'s Medical Center', probability: 43, timeToFailure: '50 min', populationImpact: 2200, criticalDependency: 'Metro Distribution Hub', riskSeverity: 'MEDIUM',
    });
  }

  // Riverside Shelter
  if (isCascade && !state.recoveryCompleted) {
    next60Items.push({
      assetName: 'Riverside Emergency Shelter', probability: 35, timeToFailure: '55 min', populationImpact: 1800, criticalDependency: 'Metro Distribution Hub', riskSeverity: 'MEDIUM',
    });
  }

  // During recovery, reduce forecasts
  if (isRecovery) {
    // Lower probabilities as recovery progresses
    const recoveryProgress = state.recoveryPlan.filter(a => a.status === 'COMPLETED').length / state.recoveryPlan.length;
    const multiplier = Math.max(0.1, 1 - recoveryProgress * 0.8);

    nowItems.forEach(item => {
      if (item.assetName !== 'East Junction') {
        item.probability = Math.round(item.probability * multiplier);
      }
    });
    next15Items.forEach(item => {
      item.probability = Math.round(item.probability * multiplier);
    });
    next60Items.forEach(item => {
      item.probability = Math.round(item.probability * multiplier);
    });
  }

  const horizons: ForecastHorizon[] = [
    { label: 'NOW', items: nowItems.length ? nowItems : [{ assetName: 'Monitoring', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }] },
    { label: 'NEXT 15 MINUTES', items: next15Items.length ? next15Items : [{ assetName: 'No immediate threats', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }] },
    { label: 'NEXT 60 MINUTES', items: next60Items.length ? next60Items : [{ assetName: 'Extended monitoring', probability: 0, timeToFailure: '—', populationImpact: 0, criticalDependency: '—', riskSeverity: 'LOW' }] },
  ];

  return horizons;
}

/* ─── RISK RANKING HELPERS ───────────────────────────────────── */

export interface RiskRankingItem {
  facility: string;
  type: string;
  state: string;
  peopleAffected: number;
  backupRemaining: string;
  riskScore: number;
  priority: number;
}

export function getRiskRanking(state: SimulationState): RiskRankingItem[] {
  const phase = state.simulationPhase;
  const isCascade = phase >= 1 && phase < 11;
  const isAnalysis = state.incidentState === 'AI_ANALYSIS' || state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';
  const isRecovery = state.incidentState === 'RECOVERY_ACTIVE';
  const monitoring = state.incidentState === 'MONITORING';
  const isStable = state.incidentState === 'STABILIZED';

  if (monitoring) return [];
  if (isStable) return [];

  const getAsset = (id: number) => state.assets.find(a => a.id === id);

  const saintAnne = getAsset(9);
  const waterPlant = getAsset(12);
  const commsHub = getAsset(13);
  const childrensMed = getAsset(11);
  const riversideShelter = getAsset(14);

  const ranking: RiskRankingItem[] = [];

  function scoreFacility(asset: { state: string } | undefined, baseScore: number, priority: number, name: string, type: string, people: number, backup: string): void {
    if (!asset) return;
    if (asset.state === 'RESTORED' || asset.state === 'PROTECTED') {
      ranking.push({ facility: name, type, state: asset.state, peopleAffected: people, backupRemaining: backup, riskScore: Math.round(baseScore * 0.1), priority: 99 });
      return;
    }
    let adjustedScore = baseScore;
    if (asset.state === 'FAILED') adjustedScore = Math.min(100, baseScore + 25);
    else if (asset.state === 'OVERLOADED' || asset.state === 'STRESSED') adjustedScore = Math.min(100, baseScore + 10);
    else if (isRecovery) adjustedScore = Math.round(baseScore * 0.4);
    ranking.push({ facility: name, type, state: asset.state, peopleAffected: people, backupRemaining: backup, riskScore: adjustedScore, priority });
  }

  if (!isAnalysis && !isCascade && !isRecovery && !isStable) return [];

  scoreFacility(saintAnne, 95, 1, 'Saint Anne Medical Center', 'Hospital', 3400, saintAnne?.state === 'PROTECTED' || saintAnne?.state === 'RESTORED' ? 'N/A (secured)' : '42 min');
  scoreFacility(waterPlant, 88, 2, 'North Water Treatment Plant', 'Water Infrastructure', 215000, 'None');
  scoreFacility(commsHub, 82, 3, 'Metro Communications Hub', 'Communications', 480000, '15 min (UPS)');
  scoreFacility(childrensMed, 70, 4, 'Children\'s Medical Center', 'Hospital', 2200, '55 min');
  scoreFacility(riversideShelter, 58, 5, 'Riverside Emergency Shelter', 'Shelter', 1800, 'None');

  // Sort by risk score descending, but keep priority as marker
  ranking.sort((a, b) => b.riskScore - a.riskScore);

  return ranking;
}

/* ─── SECONDARY METRICS HELPERS ──────────────────────────────── */

export interface SecondaryMetrics {
  cascadeProbability: number;
  repairCrewsAvailable: number;
  mobileGeneratorsAvailable: number;
  highestRiskFacility: string;
}

export function getSecondaryMetrics(state: SimulationState): SecondaryMetrics {
  const monitoring = state.incidentState === 'MONITORING';
  const isStable = state.incidentState === 'STABILIZED';
  const isRecovery = state.incidentState === 'RECOVERY_ACTIVE';
  const isCascade = state.simulationPhase >= 1 && state.simulationPhase < 11;
  const isAnalysis = state.incidentState === 'AI_ANALYSIS' || state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';
  const isAuth = state.incidentState === 'AWAITING_HUMAN_AUTHORIZATION';

  if (monitoring) {
    return {
      cascadeProbability: 2,
      repairCrewsAvailable: 4,
      mobileGeneratorsAvailable: 2,
      highestRiskFacility: 'None detected',
    };
  }

  if (isStable) {
    return {
      cascadeProbability: 0,
      repairCrewsAvailable: 4,
      mobileGeneratorsAvailable: 2,
      highestRiskFacility: 'None',
    };
  }

  // Determine cascade probability
  let cascadeProb = 2;
  if (isCascade) {
    const phase = state.simulationPhase;
    cascadeProb = Math.min(95, 35 + phase * 6);
  } else if (isAnalysis || isAuth) {
    cascadeProb = 81;
  } else if (isRecovery) {
    const done = state.recoveryPlan.filter(a => a.status === 'COMPLETED').length;
    const total = state.recoveryPlan.length;
    const progress = done / total;
    cascadeProb = Math.round(81 - progress * 70);
  }

  // Determine repair crews available
  let crews = 4;
  if (isCascade) {
    crews = Math.max(1, 4 - Math.floor(state.simulationPhase / 3));
  } else if (isAnalysis || isAuth) {
    crews = 2;
  } else if (isRecovery) {
    const deployedCrews = state.recoveryPlan.filter(a => a.status === 'IN_PROGRESS' || a.status === 'COMPLETED').length;
    crews = Math.max(1, 4 - Math.floor(deployedCrews / 2));
  }

  // Mobile generators
  let generators = 2;
  if (isRecovery) {
    const genDeployed = state.recoveryPlan.find(a => a.id === 1)?.status === 'COMPLETED' ? 1 : 0;
    generators = 2 - genDeployed;
  }

  // Highest risk facility
  let highestRisk = 'None';
  if (isCascade || isAnalysis || isAuth) {
    const sa = state.assets.find(a => a.id === 9);
    if (sa && (sa.state === 'STRESSED' || sa.state === 'FAILED')) {
      highestRisk = 'Saint Anne Medical Center';
    } else if (sa && (sa.state === 'PROTECTED' || sa.state === 'RESTORED')) {
      const wp = state.assets.find(a => a.id === 12);
      if (wp && (wp.state === 'STRESSED' || wp.state === 'FAILED')) {
        highestRisk = 'North Water Treatment Plant';
      } else {
        highestRisk = 'Metro Communications Hub';
      }
    }
  } else if (isRecovery) {
    const sa = state.assets.find(a => a.id === 9);
    if (sa && sa.state !== 'RESTORED' && sa.state !== 'PROTECTED') {
      highestRisk = 'Saint Anne Medical Center';
    } else {
      highestRisk = 'North Water Treatment Plant';
    }
  }

  return { cascadeProbability: cascadeProb, repairCrewsAvailable: crews, mobileGeneratorsAvailable: generators, highestRiskFacility: highestRisk };
}

/* ─── ASSET DETAIL HELPERS ───────────────────────────────────── */

export interface AssetDetail {
  id: number;
  name: string;
  type: string;
  state: string;
  capacity: string;
  currentLoad: string;
  populationServed: number;
  dependencies: string[];
  riskScore: number;
  predictedFailureTime: string;
  recommendedResponse: string;
}

const ASSET_METADATA: Record<number, {
  capacity: string;
  load: string;
  populationServed: number;
  dependencies: string[];
  response: Record<string, string>;
}> = {
  1: { capacity: '400 MW', load: '320 MW', populationServed: 0, dependencies: ['Natural gas pipeline'], response: { default: 'Monitor output. Reduce load if stress detected.' } },
  2: { capacity: '350 MW', load: '280 MW', populationServed: 0, dependencies: ['LNG terminal'], response: { default: 'Monitor coastal weather. Prepare for islanding.' } },
  3: { capacity: '500 MVA', load: '380 MVA', populationServed: 280000, dependencies: ['North Ridge Gen', 'Harbor Gas Plant'], response: { default: 'Monitor load distribution. Reroute if overloaded.' } },
  4: { capacity: '220 MVA', load: '340 MVA', populationServed: 142000, dependencies: ['Central Substation', 'Coastal Transfer Station'], response: { default: 'CRITICAL OVERLOAD — Immediately shed load or isolate.', FAILED: 'Isolated. Requires repair before re-energizing.' } },
  5: { capacity: '260 MVA', load: '195 MVA', populationServed: 98000, dependencies: ['North Ridge Gen', 'Central Substation'], response: { default: 'Stable operations. Monitor downstream loads.' } },
  6: { capacity: '240 MVA', load: '180 MVA', populationServed: 125000, dependencies: ['Central Substation', 'Metro Distribution Hub'], response: { default: 'Monitor load balancing.' } },
  7: { capacity: '600 MVA', load: '450 MVA', populationServed: 380000, dependencies: ['East Junction', 'Riverbend Substation', 'Coastal Transfer Station'], response: { default: 'Critical distribution node. Protect at all costs.' } },
  8: { capacity: '200 MVA', load: '160 MVA', populationServed: 0, dependencies: ['Harbor Gas Plant', 'Coastal corridor'], response: { default: 'Coastal asset. Weather-dependent operations.', FAILED: 'Structural damage. Requires full assessment.' } },
  9: { capacity: '5 MW', load: '3.2 MW', populationServed: 3400, dependencies: ['West Valley Substation', 'Backup generators'], response: { default: 'CRITICAL — Protect medical facility. Deploy backup generation if risk detected.', PROTECTED: 'Mobile generator active. Medical center secured.' } },
  10: { capacity: '8 MW', load: '5.1 MW', populationServed: 5600, dependencies: ['Riverbend Substation'], response: { default: 'Critical medical facility. Monitor power feed.' } },
  11: { capacity: '4 MW', load: '2.8 MW', populationServed: 2200, dependencies: ['Metro Distribution Hub'], response: { default: 'Pediatric facility. Ensure uninterrupted power.' } },
  12: { capacity: '15 MW', load: '11 MW', populationServed: 215000, dependencies: ['West Valley Substation', 'Riverbend Substation'], response: { default: 'Critical water infrastructure. No backup power available.' } },
  13: { capacity: '3 MW', load: '2.1 MW', populationServed: 480000, dependencies: ['East Junction', 'Metro Distribution Hub'], response: { default: 'Emergency communications. UPS provides 15 min backup.' } },
  14: { capacity: '1.5 MW', load: '0.9 MW', populationServed: 1800, dependencies: ['Metro Distribution Hub'], response: { default: 'Emergency shelter. Ensure power for evacuees.' } },
};

export function getAssetDetail(state: SimulationState, assetId: number | null): AssetDetail | null {
  if (assetId === null) return null;
  const asset = state.assets.find(a => a.id === assetId);
  if (!asset) return null;

  const meta = ASSET_METADATA[assetId];
  if (!meta) return null;

  // Determine load label based on state
  let loadLabel = meta.load;
  if (asset.state === 'OVERLOADED') loadLabel = `${meta.load} ⚠️ OVERLOAD`;
  else if (asset.state === 'FAILED') loadLabel = '0 — OFFLINE';
  else if (asset.state === 'STRESSED') loadLabel = `${meta.load} ⚠️ NEAR LIMIT`;
  else if (asset.state === 'PROTECTED' || asset.state === 'RESTORED' || asset.state === 'RESTORING') loadLabel = `${meta.load} (stable)`;

  // Risk score
  const riskScores: Record<string, number> = {
    OPERATIONAL: 5, STRESSED: 45, OVERLOADED: 78, FAILED: 95, PROTECTED: 15, RESTORING: 25, RESTORED: 5,
  };
  const riskScore = riskScores[asset.state] || 5;

  // Predicted failure time
  const failureTimes: Record<string, string> = {
    OPERATIONAL: 'Not predicted',
    STRESSED: '~15 min',
    OVERLOADED: '~5 min',
    FAILED: 'FAILED',
    PROTECTED: 'Secured',
    RESTORING: 'Restoring',
    RESTORED: 'Operational',
  };
  const predictedFailureTime = failureTimes[asset.state] || 'Not predicted';

  // Recommended response
  const responseKey = asset.state === 'FAILED' ? 'FAILED' : asset.state === 'PROTECTED' ? 'PROTECTED' : 'default';
  const recommendedResponse = meta.response[responseKey] || meta.response.default;

  const typeLabel: Record<string, string> = {
    generation: 'Power Generation',
    substation: 'Electrical Substation',
    distribution: 'Distribution Hub',
    critical: 'Critical Infrastructure',
  };

  return {
    id: asset.id,
    name: asset.name,
    type: typeLabel[asset.type] || asset.type,
    state: asset.state,
    capacity: meta.capacity,
    currentLoad: loadLabel,
    populationServed: meta.populationServed,
    dependencies: meta.dependencies,
    riskScore,
    predictedFailureTime,
    recommendedResponse,
  };
}