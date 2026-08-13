import { useEffect, useRef } from 'react';
import { SimulationProvider, useSimulation } from './state/SimulationContext';
import { saveIncidentMemory, getIncidentMemory } from './lib/memoryApi';
import { getSecondaryMetrics } from './data/tier2Data';

import Sidebar from './components/Sidebar';
import GlobalHeader from './components/GlobalHeader';
import CommandCenter from './views/CommandCenter';
import GridNetwork from './views/GridNetwork';
import AICoordination from './views/AICoordination';
import RecoveryPlan from './views/RecoveryPlan';
import IncidentTimeline from './views/IncidentTimeline';

function MainContent() {
  const { state } = useSimulation();
  const incidentSavedRef = useRef(false);
  const secondaryMetrics = getSecondaryMetrics(state);

  useEffect(() => {
  getIncidentMemory()
    .then((result) => {
      console.log(
        `Loaded ${result.count} incident memories from CockroachDB`,
        result.incidents
      );
    })
    .catch((error) => {
      console.error(
        'Failed to load incident memory from CockroachDB:',
        error
      );
    });
  }, []);

  useEffect(() => {
  if (state.incidentState === 'MONITORING') {
    incidentSavedRef.current = false;
    return;
  }

  if (
    state.incidentState === 'AI_ANALYSIS' &&
    !incidentSavedRef.current
  ) {
    incidentSavedRef.current = true;

    saveIncidentMemory({
      incidentType: 'Category 4 Hurricane',
      severity: state.severity.toUpperCase(),
      status: state.incidentState,
      scenarioSummary:
        'Hurricane-driven cascading grid failure analyzed by GridRescue AI',
      gridStability: state.gridStability,
      customersWithoutPower: state.customersWithoutPower,
      facilitiesAtRisk: state.criticalFacilitiesAtRisk,
      cascadeProbability: secondaryMetrics.cascadeProbability,
      incidentData: {
        scenario: state.scenario,
        timeOfDay: state.timeOfDay,
        estimatedRestorationTime: state.estimatedRestorationTime,
        repairCrewsAvailable: secondaryMetrics.repairCrewsAvailable,
        mobileGeneratorsAvailable:
          secondaryMetrics.mobileGeneratorsAvailable,
        highestRiskFacility:
          secondaryMetrics.highestRiskFacility,
        source: 'GridRescue React App'
      }
    })
      .then((result) => {
        console.log(
          'GridRescue incident saved to CockroachDB:',
          result.incidentId
        );
      })
      .catch((error) => {
        console.error(
          'Failed to save GridRescue incident:',
          error
        );

        incidentSavedRef.current = false;
      });
  }
  }, [state.incidentState]);

  const renderView = () => {
    switch (state.selectedView) {
      case 'command-center':
        return <CommandCenter />;
      case 'grid-network':
        return <GridNetwork />;
      case 'ai-coordination':
        return <AICoordination />;
      case 'recovery-plan':
        return <RecoveryPlan />;
      case 'incident-timeline':
        return <IncidentTimeline />;
      default:
        return <CommandCenter />;
    }
  };

  return (
    <div className="flex h-screen bg-[#0a0e17] overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <GlobalHeader />
        <main className="flex-1 overflow-hidden">
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <SimulationProvider>
      <MainContent />
    </SimulationProvider>
  );
}