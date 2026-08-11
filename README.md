# Grid Disaster AI

**Predict the cascade. Protect the critical. Restore the grid.**

Grid Disaster AI is a human-governed emergency command center for cascading electrical-grid disasters. It combines deterministic grid-failure simulation and risk forecasting with a live LLM-powered Recovery Commander advisory, while keeping final authority with a human incident commander.

## Core Demo

The primary scenario is:

**Category 4 Hurricane — Catastrophic Severity — Night**

The demo follows this sequence:

**MONITORING → DISASTER → CASCADE → CRITICAL INFRASTRUCTURE AT RISK → AI COORDINATION → AGENT DISAGREEMENT → LIVE GROQ ADVISORY → HUMAN AUTHORIZATION → RECOVERY → STABILIZED**

## What the System Does

Grid Disaster AI helps answer:

- What is failing now?
- What is likely to fail next?
- Which hospitals and critical facilities are most exposed?
- What tradeoffs exist between grid stability and public safety?
- How should crews and mobile generation be prioritized?
- What does a live LLM recommend after specialist agents disagree?
- Has a human explicitly authorized the recovery plan?

## Command Center

The Command Center provides a live operational overview including:

- Grid Stability
- Customers Without Power
- Critical Facilities at Risk
- Estimated Restoration Time
- Cascade Probability
- Repair Crews Available
- Mobile Generators Available
- Highest-Risk Facility
- Cascading Failure Forecast
- Lives and Infrastructure at Immediate Risk

A representative hurricane run can move from:

- Grid Stability: 96%
- Customers Without Power: 0
- Critical Facilities at Risk: 0

to approximately:

- Grid Stability: 46%
- Customers Without Power: 462,840
- Critical Facilities at Risk: 8
- Cascade Probability: 81%
- Estimated Restoration: 26–34 hours

After recovery, the incident reaches **STABILIZED / RESOLVED**, Cascade Probability falls to 0%, and critical facilities are protected.

## Cascading Failure Forecast

Grid Disaster AI predicts secondary failures across:

- NOW
- NEXT 15 MINUTES
- NEXT 60 MINUTES

Predictions can include:

- Asset
- Failure probability
- Estimated time to failure
- Population impact
- Critical dependency
- Risk severity

Example forecast risks include East Junction, Metro Distribution Hub, North Water Treatment Plant, and Saint Anne Medical Center.

## Lives and Infrastructure at Immediate Risk

Critical infrastructure is dynamically ranked during an active incident.

Representative facilities include:

- Saint Anne Medical Center
- North Water Treatment Plant
- Metro Communications Hub
- Children's Medical Center
- Riverside Emergency Shelter
- Regional Trauma Hospital

When the incident is stabilized, the active-risk panel clears and reports that critical infrastructure is protected.

## Grid Network

The Grid Network visualizes generation, substations, distribution, and critical facilities.

Example grid assets:

- North Ridge Generation
- Harbor Gas Plant
- Central Substation
- East Junction
- West Valley
- Riverbend
- Metro Distribution Hub
- Coastal Transfer Station

Critical infrastructure includes hospitals, water treatment, communications, and emergency shelter assets.

Asset states include:

- Operational
- Stressed
- Overloaded
- Failed
- Protected
- Restoring
- Restored

### Grid Filters

Operators can filter the network by:

- ALL
- FAILED
- AT RISK
- CRITICAL
- RESTORED

Filtering affects visualization only and does not change simulation state.

### Interactive Asset Details

Clicking an asset opens operational details such as:

- Current status
- Capacity
- Current load
- Population served
- Dependencies
- Risk score
- Predicted failure time/status
- Recommended response

## Deterministic Specialist Agents

Grid Disaster AI uses several specialist decision perspectives:

### Grid Stability Agent
Focuses on preventing broader grid collapse.

### Critical Infrastructure Agent
Prioritizes hospitals, water treatment, communications, and other essential services.

### Public Safety Agent
Evaluates population exposure and community consequences.

### Repair and Resources Agent
Evaluates crews, generators, repair priorities, and resource constraints.

### Deterministic Recovery Commander
Reconciles specialist recommendations into a safe fallback recovery strategy.

The specialists are intentionally allowed to disagree so tradeoffs remain visible.

## Live Recovery Commander Advisory

At the AI Coordination stage, Grid Disaster AI makes one live LLM request through a secure server-side integration.

The interface clearly identifies:

**LIVE RECOVERY COMMANDER ADVISORY**  
**LIVE LLM · Powered by Groq**  
**AI-GENERATED ADVISORY — HUMAN AUTHORIZATION REQUIRED**

The advisory synthesizes the incident snapshot and specialist-agent recommendations into:

1. Situation Assessment
2. Primary Priority
3. Recommended Sequence
4. Major Tradeoff
5. Why This Plan
6. Human Decision Required

The live advisory is supplemental. It never directly controls the simulation.

## Real LLM Architecture

The LLM path is:

```text
Native.builder React Application
        |
        v
Deterministic Grid Simulation
        |
        v
Specialist Agent Recommendations
        |
        v
Compact Incident Snapshot
        |
        v
Supabase Edge Function
recovery-commander
        |
        v
Groq API
openai/gpt-oss-120b
        |
        v
Live Recovery Commander Advisory
        |
        v
Human Authorization Gate
        |
        v
Existing Deterministic Recovery
```

### Why Supabase?

The Groq API key is stored as a Supabase Edge Function secret named:

`GROQ_API_KEY`

The secret is never stored in React/browser code, committed to GitHub, or returned to the client.

### One-Call Guard

The live Groq advisory is requested only once per disaster simulation.

The advisory and request-attempt state are stored in shared application state so that:

- React rerenders do not generate extra LLM calls
- navigating away from AI Coordination does not generate another call
- returning to AI Coordination reuses the existing advisory
- RESET SIMULATION clears the advisory state so the next disaster may make one fresh request

## Fail-Safe Design

The live LLM is intentionally non-critical to application execution.

If Groq, Supabase, the API key, rate limits, or inference fail, Grid Disaster AI continues using the deterministic Recovery Commander.

The LLM can never:

- authorize recovery
- execute recovery actions
- change grid assets
- change simulation metrics
- bypass the human confirmation checkbox
- determine whether recovery approval is enabled

The deterministic system remains the authoritative fail-safe.

## Human-Governed AI

The system reaches:

**AWAITING HUMAN AUTHORIZATION**

before recovery can begin.

The incident commander must explicitly confirm authorization before the recovery sequence can execute.

The design principle is:

> AI can analyze, predict, coordinate, and recommend — but accountable human operators retain final authority.

## Recovery Strategy

A representative recovery plan can include:

1. Deploy mobile generation to Saint Anne Medical Center
2. Preserve service to North Water Treatment Plant
3. Isolate the damaged coastal transmission corridor
4. Reroute available power through Central Substation
5. Dispatch Crew Alpha to East Junction
6. Dispatch Crew Bravo to Harbor Line 4
7. Reduce noncritical industrial demand
8. Issue emergency public alerts
9. Continuously reassess grid stability

## Incident Timeline

The Incident Timeline records important events such as:

- Initial disaster
- Asset failures
- Cascading impacts
- Forecast updates
- Specialist recommendations
- Agent conflict
- Live LLM advisory
- Human authorization
- Crew deployments
- Infrastructure protection
- Recovery actions
- Stabilization

## Application Views

1. Command Center
2. Grid Network
3. AI Coordination
4. Recovery Plan
5. Incident Timeline

Shared application state is preserved across navigation.

## Technology

- Native.builder
- React
- TypeScript
- Vite
- Supabase Edge Functions
- Groq API
- `openai/gpt-oss-120b`
- Deterministic local simulation and risk logic
- SVG-style grid visualization
- Human-in-the-loop authorization

No database is required for the core demo.

## Reset and Reproducibility

RESET SIMULATION restores the normal monitoring state:

- MONITORING
- Clock 00:00
- Grid Stability 96%
- Customers Without Power 0
- Facilities at Risk 0
- Cascade Probability 2%
- Normal grid asset states
- Cleared forecasts and risk rankings
- Cleared live LLM advisory state

This makes the demo reproducible.

## QA Status

Manual end-to-end testing has verified:

- Disaster simulation
- Cascading failures
- Forecasting
- Critical-infrastructure ranking
- Grid filters
- Asset details
- Navigation state preservation
- Specialist-agent coordination
- Agent disagreement
- Live Groq advisory
- One-call-per-disaster LLM guard
- Human authorization
- Recovery actions
- STABILIZED state
- Reset behavior

See `docs/QA_CHECKLIST.md`.

## Demo

The recommended three-minute presentation sequence is in:

`docs/DEMO.md`

## Safety and Scope

Grid Disaster AI is a hackathon prototype and decision-support simulation. It does not control real electrical infrastructure and should not be used for real-world emergency operations without appropriate engineering validation, operational data integration, cybersecurity controls, testing, and regulatory oversight.

---

# Grid Disaster AI

**Predict the cascade. Protect the critical. Restore the grid.**
"# gridrescue-ai" 
