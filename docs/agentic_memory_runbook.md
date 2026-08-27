# Agentic Memory Runbook (Implementation Guide)

![Agentic Memory Architecture Diagram](C:\Users\draculess99\.gemini\antigravity-ide\brain\f12ea7ab-d4c3-4528-bc52-eb6ccde3ea86\arch_diagram_1787818674182.jpg)

> [!TIP]
> This runbook abstracts the "Agentic Memory" architecture used in GridRescue AI so you can apply it to **any** project requiring an AI agent that remembers historical context and queries live data. It includes Node.js snippets for AWS Lambda.

This guide covers setting up semantic memory using **CockroachDB (Vector Search)**, **Gemini (Embeddings)**, **Groq/Llama (LLM Reasoning)**, and the **Model Context Protocol (MCP)**.

---

## 1. Prerequisites & Stack

Before starting your new project, ensure you have:
*   **Database:** A CockroachDB Cloud cluster with vector indexing enabled.
*   **Compute:** AWS Lambda, Vercel Functions, or a Node.js Express server.
*   **API Keys:** Gemini (for embeddings), Groq (for reasoning), CockroachDB MCP API key.

Install dependencies:
```bash
npm install pg @google/generative-ai groq-sdk @modelcontextprotocol/sdk
```

---

## 2. Database Schema Setup

![Vector Database Schema Illustration](C:\Users\draculess99\.gemini\antigravity-ide\brain\f12ea7ab-d4c3-4528-bc52-eb6ccde3ea86\vector_schema_1787818683898.jpg)

Determine your embedding model's output dimension (Gemini `gemini-embedding-001` outputs 384 dimensions).

```sql
-- 1. Add the vector column
ALTER TABLE incidents ADD COLUMN IF NOT EXISTS embedding VECTOR(384);

-- 2. Enable vector indexing (if not already enabled)
SET CLUSTER SETTING feature.vector_index.enabled = true;

-- 3. Create the cosine similarity index
SET sql_safe_updates = false;
CREATE VECTOR INDEX idx_incidents_embedding ON incidents (embedding vector_cosine_ops);
```

---

## 3. The "Write" Path: Generating and Storing Memory

When an event occurs, convert the textual summary into a vector and store it.

### A. Generate Embedding (Node.js)
```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

async function generateEmbedding(text) {
  const result = await embeddingModel.embedContent({
    content: { role: "user", parts: [{ text }] },
    outputDimensionality: 384
  });
  
  let vector = result.embedding.values;
  if (vector.length > 384) vector = vector.slice(0, 384);
  return vector;
}
```

### B. Insert into CockroachDB
```javascript
import pg from "pg";
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Inside your Lambda handler:
const embedding = await generateEmbedding("Incident summary text...");
const vectorStr = "[" + embedding.join(",") + "]";

await pool.query(
  `INSERT INTO incidents (incident_type, severity, embedding)
   VALUES ($1, $2, $3::VECTOR)
   RETURNING id`,
  ["Power Outage", "High", vectorStr]
);
```

---

## 4. The "Read" Path: Semantic Retrieval

![Cosine Similarity Vector Search Concept](C:\Users\draculess99\.gemini\antigravity-ide\brain\f12ea7ab-d4c3-4528-bc52-eb6ccde3ea86\cosine_search_1787818693913.jpg)

When the agent faces a new situation, recall *similar* past situations using Cosine Distance (`<=>`).

```javascript
// 1. Embed the current situation
const currentEmbedding = await generateEmbedding("Current crisis details...");
const queryVectorStr = "[" + currentEmbedding.join(",") + "]";

// 2. Query CockroachDB for nearest neighbors
const result = await pool.query(
  `SELECT id, incident_type, 
          1 - (embedding <=> $1::VECTOR) AS similarity
   FROM incidents
   WHERE embedding IS NOT NULL
   ORDER BY embedding <=> $1::VECTOR
   LIMIT 3`,
  [queryVectorStr]
);

const historicalMemories = result.rows; // Pass these to your LLM
```
> [!NOTE]
> `1 - (embedding <=> vector)` inverts the distance so a higher number means greater similarity.

---

## 5. Live Context via MCP

![Live Data Stream via Model Context Protocol](C:\Users\draculess99\.gemini\antigravity-ide\brain\f12ea7ab-d4c3-4528-bc52-eb6ccde3ea86\mcp_context_1787818704774.jpg)

Vector search finds *historical* patterns. Use MCP for the exact status of the system *right now*.

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

async function getLiveDatabaseContext() {
  const url = new URL(process.env.COCKROACHDB_MCP_URL);
  const transport = new StreamableHTTPClientTransport(url, {
    requestInit: {
      headers: { 
        "Authorization": `Bearer ${process.env.COCKROACHDB_MCP_API_KEY}`,
        "mcp-cluster-id": process.env.COCKROACHDB_CLUSTER_ID
      }
    }
  });

  const client = new Client({ name: "LambdaAgent", version: "1.0.0" }, { capabilities: {} });
  await client.connect(transport);

  // Execute a live query
  const mcpResult = await client.callTool({
    name: "select_query",
    arguments: { 
      query: "SELECT COUNT(*) FROM incidents WHERE status = 'ACTIVE'",
      database: "your_db_name" 
    },
  });

  await transport.close();
  return mcpResult.content[0].text;
}
```

---

## 6. Prompting the Reasoning LLM (Groq)

Combine everything into a prompt and call the LLM.

```javascript
import { Groq } from "groq-sdk";
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const prompt = `
CURRENT SITUATION: ${JSON.stringify(currentSnapshot)}
HISTORICAL MEMORY (Similar Past Events): ${JSON.stringify(historicalMemories)}
LIVE SYSTEM CONTEXT: ${liveMcpData}

Analyze this and return a JSON action plan.
`;

const completion = await groq.chat.completions.create({
  messages: [{ role: "user", content: prompt }],
  model: "llama-3.3-70b-versatile",
  response_format: { type: "json_object" },
  temperature: 0.2,
});

const actionPlan = JSON.parse(completion.choices[0].message.content);
```

---

## 7. Safety & "Human-in-the-Loop"

![Human Authorization Dashboard](C:\Users\draculess99\.gemini\antigravity-ide\brain\f12ea7ab-d4c3-4528-bc52-eb6ccde3ea86\human_auth_1787818714734.jpg)

> [!IMPORTANT]
> **Never allow the LLM to execute actions autonomously.**

1.  **Authorization Gate:** The LLM output (`actionPlan`) must be sent back to the frontend.
2.  **Human Review:** A human operator reviews the plan and clicks "Authorize".
3.  **Read-Only Agent:** The `DATABASE_URL` and MCP API key used by the Lambda should ideally have restricted permissions. All critical state changes should run via a separate, human-triggered API route.
