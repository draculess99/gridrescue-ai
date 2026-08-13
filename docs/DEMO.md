Grid Disaster AI — 3-Minute Demo Runbook

Demo Goal

Tell one clear story:

DISASTER → CASCADE → CRITICAL INFRASTRUCTURE AT RISK → AGENTS DISAGREE → LIVE GROQ ADVISORY → HUMAN AUTHORIZES → GRID RECOVERS

Before Recording

Reset Simulation

Confirm MONITORING

Confirm Grid Stability = 96%

Confirm Customers Without Power = 0

Confirm Facilities at Risk = 0

Confirm Category 4 Hurricane

Confirm Catastrophic severity

Confirm Night

Confirm Groq/Supabase integration is available

Close unnecessary browser tabs

Test one complete run before recording

Reset again immediately before recording

0:00–0:20 — Introduce the Problem

Start on Command Center.

Say:

“Grid Disaster AI is a human-governed emergency command center for cascading electrical-grid disasters. A localized failure can threaten hospitals, water systems, communications, and hundreds of thousands of people within minutes.”

Point out:

MONITORING

Grid Stability: 96%

Customers Without Power: 0

Critical Facilities at Risk: 0

0:20–0:45 — Trigger the Disaster

Use:

Category 4 Hurricane

Catastrophic

Night

Click RUN DISASTER SIMULATION.

Say:

“A Category 4 hurricane damages the coastal transmission corridor. Grid Disaster AI now models how that initial failure propagates through the interconnected grid.”

0:45–1:10 — Show the Cascade

Open Grid Network.

Show:

failed assets

overloaded assets

stressed critical infrastructure

transmission-path changes

Briefly demonstrate a filter such as FAILED or AT RISK.

If time permits, click one asset to show live operational details.

Say:

“The system tracks how one local failure becomes a regional cascade and exposes dependencies between generation, substations, hospitals, water, and communications.”

1:10–1:30 — Show Prediction and Risk

Return briefly to Command Center.

Point out:

Cascade Probability

Cascading Failure Forecast

Highest-Risk Facility

Lives and Infrastructure at Immediate Risk

Say:

“The system is not only showing what has failed. It is forecasting what is likely to fail next and prioritizing the infrastructure with the greatest life-safety impact.”

1:30–2:10 — Show AI Coordination + Real LLM

Open AI Coordination.

Show the deterministic specialist agents and their competing priorities.

Explain the conflict:

Grid Stability wants isolation to prevent broader collapse

Public Safety warns about population impact

Critical Infrastructure prioritizes Saint Anne Medical Center

Repair and Resources prioritizes feasible crew and generator deployment

Then point to:

LIVE RECOVERY COMMANDER ADVISORYLIVE LLM · Powered by GroqAI-GENERATED ADVISORY — HUMAN AUTHORIZATION REQUIRED

Say:

“The specialist agents are deterministic and auditable. Their incident snapshot is then sent through a secure Supabase Edge Function to a live Groq model, which synthesizes the competing recommendations into an advisory.”

Briefly show:

Situation Assessment

Primary Priority

Recommended Sequence

Major Tradeoff

Why This Plan

Human Decision Required

Then say:

“The LLM is advisory only. It cannot execute recovery or bypass the human operator.”

2:10–2:35 — Human Authorization

Open Recovery Plan.

Say:

“Even after the AI produces a coordinated strategy, recovery cannot execute automatically.”

Show HUMAN AUTHORIZATION REQUIRED.

Check the authorization box.

Say:

“The incident commander remains accountable for the final decision.”

Click APPROVE RECOVERY PLAN.

2:35–2:52 — Show Recovery

Watch the recovery sequence.

Point out:

actions becoming authorized

actions moving in progress

actions completing

Grid Stability improving

Facilities at Risk falling

Cascade Probability falling

final status reaching STABILIZED / RESOLVED

Say:

“Once authorized, the system executes the deterministic recovery sequence and updates the operational picture.”

2:52–3:00 — Close

Briefly show Incident Timeline if time allows.

Say:

“Every prediction, specialist recommendation, live LLM advisory, human decision, and recovery action is auditable.

Grid Disaster AI: Predict the cascade. Protect the critical. Restore the grid.”

What Judges Should Remember

Do not try to demonstrate every feature.

The five ideas to make memorable are:

Cascading grid failure

Critical infrastructure at risk

Specialist agents with competing priorities

Real Groq LLM advisory with mandatory human authorization

Grid recovery to STABILIZED

Architecture Line for Q&A

If asked how the AI works:

“Grid Disaster AI combines a deterministic grid simulation and specialist-agent layer with one live Groq inference per disaster. The incident snapshot is sent through a Supabase Edge Function so the Groq API key stays server-side. The live advisory is cached for the incident, and the deterministic Recovery Commander remains the fail-safe. Only a human can authorize recovery.”

Fail-Safe Line for Q&A

If asked what happens when the LLM fails:

“The live LLM is non-critical. If Groq or the network is unavailable, Grid Disaster AI immediately continues with the deterministic Recovery Commander. The AI advisory never controls execution.”

Recording Safety Checklist

Reset before recording

MONITORING / 96% / 0 outages

Category 4 Hurricane selected

Run disaster once

Grid cascade visible

Forecast/risk panels populated

AI Coordination populated

LIVE LLM · Powered by Groq visible

Human authorization checkbox required

Approve Recovery Plan works

STABILIZED reached

Incident Timeline populated

No unfinished features shown