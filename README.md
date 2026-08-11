# Grid Disaster AI

**Predict the cascade. Protect the critical. Restore the grid.**

Grid Disaster AI is a human-governed, agentic emergency command center for cascading electrical-grid disasters.

The system combines deterministic grid-failure simulation, cascading-risk forecasting, specialist AI agents, live LLM advisory, critical-infrastructure prioritization, and human authorization to demonstrate how AI can support operators during a major grid emergency without removing human control.

Grid Disaster AI is now being extended with **AWS serverless execution and CockroachDB persistent incident memory**, allowing the system to learn from prior simulated incidents and retrieve relevant historical decisions during future emergencies.

---

## The Problem

Large-scale grid failures rarely happen as isolated events.

A hurricane, transmission failure, generation loss, or overloaded substation can trigger secondary failures across:

* Electrical distribution
* Hospitals
* Water treatment
* Communications
* Emergency shelters
* Transportation
* Public safety infrastructure

During these incidents, operators must rapidly answer several questions:

* What is failing now?
* What is likely to fail next?
* Which critical facilities are most exposed?
* Which failures could trigger additional cascading outages?
* Where should repair crews be sent first?
* Where should mobile generation be deployed?
* What tradeoffs exist between grid stability and public safety?
* Have similar incidents happened before?
* What actions worked during those incidents?
* Should the AI recommendation actually be executed?

Grid Disaster AI brings those questions together in a single operational command-center simulation.

---

# Core Demo Scenario

The primary demonstration scenario is:

**Category 4 Hurricane — Catastrophic Severity — Night**

The simulation progresses through:

**MONITORING → DISASTER → CASCADE → CRITICAL INFRASTRUCTURE AT RISK → AI COORDINATION → AGENT DISAGREEMENT → RECOVERY COMMANDER ADVISORY → HUMAN AUTHORIZATION → RECOVERY → STABILIZED**

The system deliberately creates conflicting operational priorities so that the AI agents must expose tradeoffs rather than simply produce identical recommendations.

---

# Command Center

The Command Center provides a real-time operational overview of the simulated electrical grid.

Key indicators include:

* Grid Stability
* Customers Without Power
* Critical Facilities at Risk
* Estimated Restoration Time
* Cascade Probability
* Repair Crews Available
* Mobile Generators Available
* Highest-Risk Facility
* Cascading Failure Forecast
* Lives and Infrastructure at Immediate Risk

A representative hurricane simulation can move from:

### Normal Operations

* Grid Stability: 96%
* Customers Without Power: 0
* Critical Facilities at Risk: 0
* Cascade Probability: 2%

to approximately:

### Major Grid Emergency

* Grid Stability: 46%
* Customers Without Power: 462,840
* Critical Facilities at Risk: 8
* Cascade Probability: 81%
* Estimated Restoration: 26–34 hours

Following an authorized recovery operation, the system progresses toward:

**STABILIZED / RESOLVED**

with critical facilities protected and cascade probability returning to safe levels.

---

# Cascading Failure Forecast

Grid Disaster AI forecasts secondary failures across three operational windows:

* **NOW**
* **NEXT 15 MINUTES**
* **NEXT 60 MINUTES**

Forecast information can include:

* Grid asset
* Failure probability
* Estimated time to failure
* Population impact
* Critical dependencies
* Risk severity
* Recommended operational response

Example high-risk assets include:

* East Junction
* Metro Distribution Hub
* North Water Treatment Plant
* Saint Anne Medical Center

This allows the system to focus not only on what has already failed, but on **what is likely to fail next**.

---

# Lives and Infrastructure at Immediate Risk

Critical infrastructure is dynamically ranked during an active disaster.

Representative facilities include:

* Saint Anne Medical Center
* North Water Treatment Plant
* Metro Communications Hub
* Children's Medical Center
* Riverside Emergency Shelter
* Regional Trauma Hospital

Each facility can be evaluated according to factors such as:

* Current electrical status
* Grid dependency
* Population served
* Backup-power availability
* Predicted failure risk
* Restoration priority

When the incident is stabilized, the active-risk panel clears and reports that critical infrastructure is protected.

---

# Grid Network

The Grid Network provides an interactive visualization of generation assets, substations, distribution infrastructure, and critical facilities.

Representative assets include:

### Generation

* North Ridge Generation
* Harbor Gas Plant

### Transmission and Distribution

* Central Substation
* East Junction
* West Valley
* Riverbend
* Metro Distribution Hub
* Coastal Transfer Station

### Critical Infrastructure

* Hospitals
* Water treatment facilities
* Communications infrastructure
* Emergency shelters

Asset states include:

* Operational
* Stressed
* Overloaded
* Failed
* Protected
* Restoring
* Restored

---

## Grid Filters

Operators can filter the network by:

* ALL
* FAILED
* AT RISK
* CRITICAL
* RESTORED

Filtering affects visualization only and does not alter the underlying simulation state.

---

## Interactive Asset Details

Selecting an asset displays operational information including:

* Current status
* Capacity
* Current load
* Population served
* Dependencies
* Risk score
* Predicted failure status
* Recommended response

---

# Multi-Agent Decision System

Grid Disaster AI uses multiple specialist decision perspectives rather than relying on a single AI recommendation.

This allows operational conflicts to remain visible.

## Grid Stability Agent

Focuses on preventing broader grid collapse.

Its priorities include:

* Transmission stability
* Generation balance
* Load shedding
* Cascade prevention
* Isolation of damaged infrastructure

---

## Critical Infrastructure Agent

Prioritizes essential services including:

* Hospitals
* Water treatment
* Communications
* Emergency shelters
* Other life-safety infrastructure

---

## Public Safety Agent

Evaluates:

* Population exposure
* Community impact
* Emergency-service dependencies
* Potential life-safety consequences

---

## Repair and Resources Agent

Evaluates operational constraints including:

* Available repair crews
* Mobile generators
* Repair priorities
* Travel and deployment requirements
* Resource limitations

---

## Recovery Commander

The Recovery Commander reconciles conflicting specialist recommendations into a coordinated recovery strategy.

The specialist agents are intentionally allowed to disagree.

For example:

**Grid Stability Agent**

may recommend isolating a damaged transmission corridor immediately.

while:

**Critical Infrastructure Agent**

may recommend keeping that corridor temporarily energized because it is still supplying a hospital.

The Recovery Commander must surface this conflict and recommend a safe operational compromise.

---

# Live LLM Recovery Advisory

During the AI Coordination phase, Grid Disaster AI can request a live LLM-generated Recovery Commander advisory.

The advisory interface clearly identifies the recommendation as:

**LIVE RECOVERY COMMANDER ADVISORY**

**AI-GENERATED ADVISORY — HUMAN AUTHORIZATION REQUIRED**

The advisory can synthesize:

1. Situation Assessment
2. Primary Priority
3. Recommended Sequence
4. Major Tradeoff
5. Infrastructure Risk
6. Resource Allocation
7. Why This Plan
8. Human Decision Required

The LLM recommendation is advisory only.

It cannot directly execute recovery actions.

---

# Human-Governed AI

Grid Disaster AI is intentionally designed around **human-in-the-loop control**.

Before recovery begins, the system reaches:

**AWAITING HUMAN AUTHORIZATION**

The incident commander must explicitly approve the proposed recovery strategy before execution can continue.

The design principle is:

> **AI can analyze, predict, remember, coordinate, and recommend — but accountable human operators retain final authority.**

The AI cannot bypass this authorization gate.

---

# Persistent Incident Memory

A major extension of Grid Disaster AI is the addition of **persistent incident memory using CockroachDB**.

Rather than treating every emergency as an isolated event, the system is being designed to retain structured information from previous incidents.

Persistent memory can include:

* Incident type
* Disaster severity
* Failed assets
* Cascading failures
* Critical facilities affected
* Specialist-agent recommendations
* Agent disagreements
* Recovery Commander recommendations
* Human approval or rejection
* Recovery actions
* Restoration sequence
* Final outcome

This transforms previous simulated emergencies into reusable operational memory.

---

# Memory Retrieval

During a future disaster, the Recovery Commander can retrieve relevant historical incidents before generating a recommendation.

Conceptually:

```text
New Grid Emergency
        |
        v
Current Incident Snapshot
        |
        v
CockroachDB Incident Memory
        |
        v
Retrieve Similar Historical Incidents
        |
        v
Specialist Agent Analysis
        |
        v
Recovery Commander Advisory
        |
        v
Human Authorization
```

The purpose is not to allow historical decisions to automatically control the grid.

Historical incidents provide **decision context** for the AI and human incident commander.

---

# AWS + CockroachDB Architecture

The original Grid Disaster AI prototype uses a React application, deterministic simulation logic, and a secure server-side LLM integration.

For the CockroachDB/AWS extension, the target architecture is:

```text
React / TypeScript Command Center
                |
                v
        Current Incident State
                |
                v
          AWS Lambda
      Agent Execution Layer
                |
        +-------+-------+
        |               |
        v               v
 CockroachDB          Groq LLM
Persistent Memory     Advisory
        |               |
        +-------+-------+
                |
                v
       Recovery Commander
                |
                v
      Human Authorization
                |
                v
    Deterministic Recovery
                |
                v
     CockroachDB Writeback
```

AWS provides the server-side execution layer while CockroachDB provides durable incident and agent memory.

---

# Why AWS Lambda?

AWS Lambda provides a lightweight serverless execution layer for the agent workflow.

Benefits include:

* No continuously running application server required
* Low infrastructure overhead
* Pay-per-use execution
* Secure server-side API access
* Environment-variable protection
* Simple integration with the React frontend
* Suitable architecture for event-driven agent workflows

The browser never needs direct access to protected LLM or database credentials.

---

# Why CockroachDB?

Emergency-response memory needs to survive individual browser sessions and individual AI calls.

CockroachDB provides persistent distributed storage for:

* Incident histories
* Agent state
* Recommendations
* Human decisions
* Recovery actions
* Outcomes
* Searchable operational memory

The database therefore becomes part of the AI reasoning workflow rather than simply serving as application storage.

---

# Planned Memory Workflow

Each disaster follows a continuous memory cycle:

```text
OBSERVE
   |
   v
RETRIEVE MEMORY
   |
   v
ANALYZE
   |
   v
AGENTS DELIBERATE
   |
   v
RECOMMEND
   |
   v
HUMAN AUTHORIZES
   |
   v
ACT
   |
   v
STORE OUTCOME
   |
   +--------------------+
                        |
                        v
                 FUTURE INCIDENT
```

The goal is for the system to become more context-aware as additional incidents are simulated.

---

# Fail-Safe Design

The LLM is deliberately non-critical to core application execution.

If the external LLM service fails, Grid Disaster AI can continue using deterministic Recovery Commander logic.

The LLM can never:

* Authorize recovery
* Directly execute grid actions
* Change simulation metrics
* Modify grid assets without application logic
* Bypass human confirmation
* Determine whether recovery authorization is enabled

The deterministic simulation remains the authoritative fail-safe.

---

# Recovery Strategy

A representative recovery plan may include:

1. Deploy mobile generation to Saint Anne Medical Center
2. Preserve service to North Water Treatment Plant
3. Isolate the damaged coastal transmission corridor
4. Reroute available power through Central Substation
5. Dispatch Crew Alpha to East Junction
6. Dispatch Crew Bravo to Harbor Line 4
7. Reduce noncritical industrial demand
8. Issue emergency public alerts
9. Continuously reassess grid stability
10. Store the incident, decisions, and outcome in persistent memory

---

# Incident Timeline

The Incident Timeline records significant operational events including:

* Initial disaster
* Asset failures
* Cascading impacts
* Forecast updates
* Critical-infrastructure risk
* Specialist recommendations
* Agent disagreement
* Historical-memory retrieval
* Recovery Commander advisory
* Human authorization
* Crew deployments
* Infrastructure protection
* Recovery actions
* Stabilization
* Incident-memory writeback

---

# Application Views

Grid Disaster AI contains five primary operational views:

1. **Command Center**
2. **Grid Network**
3. **AI Coordination**
4. **Recovery Plan**
5. **Incident Timeline**

Shared application state is preserved while navigating between operational views.

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Interactive SVG-style grid visualization

## Agent and Simulation Layer

* Deterministic grid-disaster simulation
* Cascading failure forecasting
* Multi-agent decision workflow
* Human-in-the-loop authorization
* Recovery Commander coordination

## AI

* Groq API
* OpenAI-compatible inference
* Live Recovery Commander advisory

## Cloud Extension

* AWS
* AWS Lambda

## Persistent Memory

* CockroachDB
* Structured incident history
* Agent decision persistence
* Historical incident retrieval

---

# Security

Sensitive credentials must remain server-side.

API keys and database credentials should never be:

* Embedded in React source code
* Exposed in browser JavaScript
* Committed to GitHub
* Returned in API responses

AWS Lambda environment variables or equivalent protected secret-management mechanisms are used for server-side credentials.

---

# Reset and Reproducibility

**RESET SIMULATION** restores the system to its normal monitoring state.

Representative reset values include:

* Status: MONITORING
* Clock: 00:00
* Grid Stability: 96%
* Customers Without Power: 0
* Facilities at Risk: 0
* Cascade Probability: 2%
* Normal grid asset states
* Cleared forecasts
* Cleared risk rankings
* Cleared active LLM advisory

Persistent historical incident records may remain available in CockroachDB so previous simulations can serve as future agent memory.

This provides both:

**reproducible simulation state**

and

**persistent historical memory**.

---

# QA

Core application testing covers:

* Disaster simulation
* Cascading failures
* Forecasting
* Critical-infrastructure ranking
* Grid filters
* Asset details
* Navigation state preservation
* Specialist-agent coordination
* Agent disagreement
* Recovery Commander advisory
* Human authorization
* Recovery execution
* STABILIZED state
* Reset behavior

AWS and CockroachDB integration tests will additionally verify:

* Lambda invocation
* Database connectivity
* Incident-memory writes
* Historical-memory retrieval
* Failure handling
* Credential protection

See:

`docs/QA_CHECKLIST.md`

---

# Demo

The demonstration is designed to tell one clear story:

**A hurricane damages the grid → failures begin cascading → hospitals and infrastructure become threatened → specialist agents disagree → previous incident memory is retrieved → the Recovery Commander proposes a strategy → a human authorizes it → recovery begins → the outcome becomes memory for the next emergency.**

The presentation sequence is documented in:

`docs/DEMO.md`

---

# Prior Work and Hackathon Development

Grid Disaster AI began as a pre-existing grid-disaster simulation and human-governed multi-agent decision-support prototype.

The original system already included:

* React command-center interface
* Grid simulation
* Cascading failure logic
* Critical-infrastructure prioritization
* Specialist agents
* Recovery Commander logic
* Human authorization
* Live Groq advisory
* Recovery workflow

The CockroachDB/AWS hackathon extension introduces new cloud and persistent-agent-memory capabilities, including:

* AWS-hosted agent execution
* CockroachDB persistent incident memory
* Historical incident retrieval
* Persistent agent decisions
* Recovery-outcome storage
* Memory-informed future recommendations

This section is included to clearly distinguish the pre-existing prototype from work developed specifically for the hackathon extension.

---

# Project Philosophy

Grid Disaster AI is based on three principles.

### Predict the cascade.

Emergency systems should anticipate secondary failures rather than react only to assets that have already failed.

### Protect the critical.

Hospitals, water, communications, shelters, and life-safety infrastructure must remain visible throughout recovery planning.

### Keep humans accountable.

AI recommendations can improve situational awareness and coordination, but high-impact infrastructure decisions require explicit human authorization.

---

# Safety and Scope

Grid Disaster AI is a research and hackathon prototype intended to demonstrate AI-assisted emergency decision support.

It does **not** control real electrical infrastructure.

It should not be used for real-world emergency operations without:

* Engineering validation
* Production-grade operational data
* Cybersecurity controls
* Utility-system integration
* Extensive testing
* Human operational procedures
* Regulatory review
* Appropriate safety certification

---

## Status

**Current:** Working Grid Disaster AI simulation with multi-agent coordination, deterministic recovery logic, human authorization, and live LLM advisory.

**In Development:** AWS Lambda execution and CockroachDB persistent incident memory.

**Next Milestone:** Complete the full incident-memory loop:

**Retrieve → Analyze → Recommend → Human Authorize → Recover → Store Outcome**

---

**Grid Disaster AI**

**Predict the cascade. Protect the critical. Restore the grid.**
