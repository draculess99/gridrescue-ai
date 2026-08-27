G# GridRescue AI

**Predict the cascade. Protect the critical. Restore the grid.**

GridRescue AI is a human-governed, agentic emergency command center for cascading electrical-grid disasters. It combines deterministic grid-failure simulation, specialist AI agents, persistent incident memory, semantic vector retrieval, live database access through MCP, and a Recovery Commander LLM to support human operators during major grid emergencies without removing human control.

For the CockroachDB × AWS Agentic Memory hackathon, GridRescue AI extends the original disaster-response simulation with an AWS-hosted agentic-memory backend. Historical incidents are stored in CockroachDB, embedded with Gemini, retrieved by semantic similarity using CockroachDB vector search, queried through the CockroachDB Cloud Managed MCP Server, and supplied to the Groq-powered Recovery Commander before a human operator authorizes recovery.

---

## Hackathon Integration Summary

GridRescue AI currently integrates:

- **AWS Lambda** — serverless agent/memory API.
- **CockroachDB persistent memory** — durable incident records and operational history.
- **CockroachDB Distributed Vector Indexing** — `VECTOR(384)` incident embeddings with cosine-distance retrieval.
- **CockroachDB Cloud Managed MCP Server** — live read-only access to incident data through the MCP `select_query` tool.
- **Gemini `gemini-embedding-001`** — generates 384-dimensional incident/query embeddings.
- **Groq `llama-3.3-70b-versatile`** — synthesizes the Recovery Commander advisory.
- **Human authorization gate** — the AI recommends; a human operator retains final authority over recovery execution.

### Verified agentic-memory loop

```text
Current disaster snapshot
        |
        v
AWS Lambda
        |
        +--> Gemini embedding (384 dimensions)
        |          |
        |          v
        |    CockroachDB VECTOR(384)
        |          |
        |          v
        |    Semantic similarity retrieval
        |          |
        |          +--> Relevant historical incidents
        |
        +--> CockroachDB Managed MCP Server
        |          |
        |          +--> select_query --> live incident context
        |
        v
Groq Recovery Commander
        |
        v
Memory-informed recovery advisory
        |
        v
Human authorization required
```

---

## Production Architecture

### Frontend

- React
- TypeScript
- Vite
- Interactive grid/disaster visualization

### Backend

- AWS Lambda (Node.js)
- CockroachDB Cloud
- PostgreSQL-compatible `pg` driver
- Model Context Protocol TypeScript SDK using `StreamableHTTPClientTransport`

### AI services

- **Gemini `gemini-embedding-001`** for 384-dimensional embeddings
- **Groq `llama-3.3-70b-versatile`** for Recovery Commander generation

### CockroachDB agentic-memory capabilities

- Persistent incident table
- `VECTOR(384)` embedding column
- Cosine-distance semantic retrieval using `<=>`
- Distributed vector index optimized for cosine similarity
- CockroachDB Cloud Managed MCP Server
- MCP `select_query` for live, read-only incident context

---

## How Agentic Memory Works

GridRescue AI does not simply retrieve the latest incidents. It can retrieve incidents whose meaning is closest to the crisis currently unfolding.

### 1. Store the incident

When an incident is persisted, the AWS Lambda builds a textual representation of the disaster and requests a **384-dimensional embedding** from `gemini-embedding-001`. The Lambda verifies the vector length before inserting it into the CockroachDB `embedding VECTOR(384)` column along with the incident record.

### 2. Retrieve relevant memories

For a new crisis, Lambda generates another 384-dimensional embedding from the current scenario and performs cosine-distance retrieval:

```sql
ORDER BY embedding <=> $1::VECTOR
LIMIT 5
```

The result includes a similarity score and returns semantically related historical incidents rather than relying only on chronological order.

### 3. Query CockroachDB through MCP

The Lambda connects to the **CockroachDB Cloud Managed MCP Server** using the official MCP TypeScript SDK and `StreamableHTTPClientTransport`.

The MCP connection uses:

- Bearer authentication from `COCKROACHDB_MCP_API_KEY`
- cluster scoping through `mcp-cluster-id`
- the server-advertised `select_query` tool

The agent performs a read-only query against the application `incidents` table to provide current database context to the Recovery Commander.

### 4. Generate the Recovery Commander advisory

The Groq-powered Recovery Commander receives:

1. the current grid snapshot,
2. semantically similar historical incidents from CockroachDB vector retrieval, and
3. live incident context retrieved through CockroachDB MCP.

It then generates a structured recovery advisory including situation assessment, primary priority, recommended sequence, major trade-off, rationale, and the decision requiring human approval.

### 5. Human authorization

The LLM cannot directly execute recovery. GridRescue AI stops at the human authorization gate until the incident commander explicitly approves the coordinated recovery plan.

---

## Core Demo Scenario

The primary demo scenario is:

**Category 4 Hurricane — Catastrophic Severity — Night**

The simulation progresses through:

**MONITORING → DISASTER → CASCADE → CRITICAL INFRASTRUCTURE AT RISK → AI COORDINATION → AGENT DISAGREEMENT → MEMORY-INFORMED RECOVERY COMMANDER → HUMAN AUTHORIZATION → RECOVERY → STABILIZED**

The scenario deliberately creates competing operational priorities so the specialist agents expose meaningful trade-offs rather than identical recommendations.

---

## Multi-Agent Decision System

### Grid Stability Agent

Focuses on preventing broader grid collapse, transmission stability, and load shedding.

### Critical Infrastructure Agent

Prioritizes essential services such as hospitals, water treatment, and emergency shelters.

### Public Safety Agent

Evaluates population exposure, community impact, and emergency-service dependencies.

### Recovery Commander

Reconciles the specialist recommendations and augments them with historical incident memory and MCP-retrieved database context.

The flow is:

```text
Specialist agents
      |
      v
Current incident snapshot
      |
      +--> CockroachDB semantic memory
      +--> CockroachDB MCP context
      |
      v
Groq Recovery Commander
      |
      v
Human-reviewed advisory
```

---

## Human-Governed AI

GridRescue AI is intentionally designed around **human-in-the-loop control**.

Before recovery begins, the system reaches:

**AWAITING HUMAN AUTHORIZATION**

The incident commander must explicitly approve the proposed strategy before execution can continue.

> **AI can analyze, predict, remember, coordinate, and recommend — but accountable human operators retain final authority.**

---

## AWS Lambda Environment Variables

Configure these variables in the Lambda function. Never commit real secrets to GitHub.

```env
# Direct CockroachDB application connection
DATABASE_URL=postgresql://...

# CockroachDB Cloud Managed MCP Server
COCKROACHDB_MCP_URL=https://cockroachlabs.cloud/mcp
COCKROACHDB_MCP_API_KEY=your_service_account_api_secret
COCKROACHDB_CLUSTER_ID=your_cluster_uuid

# Recovery Commander LLM
GROQ_API_KEY=your_groq_api_key

# Vector embeddings
GEMINI_API_KEY=your_gemini_api_key

# Optional frontend override
VITE_GRID_MEMORY_API_URL=https://your-lambda-function-url/
```

---

## CockroachDB Schema and Vector Index

The incident table requires an embedding column:

```sql
ALTER TABLE incidents
ADD COLUMN IF NOT EXISTS embedding VECTOR(384);
```

GridRescue uses cosine distance (`<=>`), so the CockroachDB vector index should use the cosine operator class.

For a non-empty table, CockroachDB may require safe updates to be disabled while the vector index is backfilled:

```sql
SET sql_safe_updates = false;
```

Create the distributed vector index:

```sql
CREATE VECTOR INDEX idx_incidents_embedding
ON incidents (embedding vector_cosine_ops);
```

If vector indexing is not already enabled for the cluster/version, enable it first:

```sql
SET CLUSTER SETTING feature.vector_index.enabled = true;
```

Verify the index exists before the final hackathon demo:

```sql
SHOW INDEXES FROM incidents;
```

The output should include `idx_incidents_embedding`.

---

## Lambda Routes

### Store an incident

`POST /`

Persists the incident and its Gemini-generated 384-dimensional embedding in CockroachDB.

### Retrieve/search memory

`GET /?query=<incident description>`

Embeds the query and retrieves semantically similar historical incidents using CockroachDB vector similarity search.

### Recovery Commander advisory

`POST /advisory`

Combines the current snapshot, vector-retrieved historical incidents, and CockroachDB MCP context before calling Groq.

---

## Live Verification Completed

The AWS Lambda test flow has verified:

- incident persistence returns HTTP `200`
- embeddings are generated and stored (`hasEmbedding: true`)
- semantic vector retrieval returns matching historical incidents
- the Recovery Commander successfully uses historical incident similarity context
- MCP connects using Streamable HTTP
- MCP tool discovery succeeds
- MCP `select_query` executes successfully
- Groq produces the final structured advisory

The final MCP verification log included:

```text
Selected MCP Tool: select_query
MCP Call succeeded for tool: select_query
```

---

## Demo Guidance

The demo should make the agentic-memory contribution unmistakable:

1. Trigger the Category 4 Hurricane simulation.
2. Show the cascade and specialist-agent disagreement.
3. Open AI Coordination and show the live Recovery Commander advisory.
4. Point out that the advisory is using a **similar historical incident** retrieved through CockroachDB vector search.
5. Explain that CockroachDB MCP gives the agent live read-only access to incident context through `select_query`.
6. Show the mandatory human authorization step.
7. Authorize recovery and show the grid stabilize.
8. Briefly show Incident Timeline / persistent memory if time permits.

---

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS

### Backend / Cloud

- AWS Lambda
- Node.js
- CockroachDB Cloud
- `pg`

### Agentic AI / Memory

- CockroachDB `VECTOR(384)`
- CockroachDB Distributed Vector Indexing
- CockroachDB Cloud Managed MCP Server
- Model Context Protocol TypeScript SDK
- Gemini `gemini-embedding-001`
- Groq `llama-3.3-70b-versatile`

---

## Reliability and Safety

- Embedding failures are handled rather than silently inserting malformed vectors.
- The embedding dimension is checked before database use.
- MCP failure is non-fatal so the Recovery Commander can continue with available snapshot/vector context.
- Historical memory is advisory context, not an autonomous control signal.
- Recovery remains behind an explicit human authorization gate.

---

## Security

- API keys and database credentials are provided through Lambda environment variables.
- Secrets should never be committed to GitHub or included in demo screenshots.
- The MCP service account should use only the permissions required for the demo.
- MCP access used by GridRescue is read-only through `select_query`.

---

## Repository

GitHub: https://github.com/draculess99/gridrescue-ai

---

## Documentation

- [Agentic Memory Runbook (Implementation Guide)](docs/agentic_memory_runbook.md)

---

## Safety and Scope

GridRescue AI is a research and hackathon prototype intended to demonstrate AI-assisted emergency decision support. It does **not** control real electrical infrastructure.
