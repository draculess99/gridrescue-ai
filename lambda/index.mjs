/**
 * GridRescue AI — AWS Lambda Function
 *
 * Integrates:
 * 1. CockroachDB for persistent incident memory
 * 2. CockroachDB Distributed Vector Indexing
 * 3. CockroachDB Managed MCP Server
 * 4. Groq (llama3-70b-8192) for LLM advisory generation
 * 5. Gemini API (text-embedding-004) for 384-dimensional vector embeddings
 * 6. AWS Lambda for serverless agent execution
 */

import pg from "pg";
import { Groq } from "groq-sdk";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";

const { Pool } = pg;

// ── Clients ────────────────────────────────────────────────────────────────────

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 8000,
});

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Initialize Gemini Client
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const embeddingModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

// CockroachDB Managed MCP Server endpoint (set in Lambda env vars)
const MCP_SERVER_URL = process.env.COCKROACHDB_MCP_URL || "";
const MCP_API_KEY = process.env.COCKROACHDB_MCP_API_KEY || "";
const MCP_CLUSTER_ID = process.env.COCKROACHDB_CLUSTER_ID || "";

// ── CORS headers ───────────────────────────────────────────────────────────────

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS",
};

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Generate a 384-dim embedding via Gemini API
 */
async function generateEmbedding(text) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  try {
    const result = await embeddingModel.embedContent({
      content: { role: "user", parts: [{ text }] },
      outputDimensionality: 384
    });

    let vector = result.embedding.values;

    if (!vector || !Array.isArray(vector)) {
      throw new Error("Invalid embedding response from Gemini API");
    }

    // Fallback: If the API didn't respect outputDimensionality natively, slice it safely
    if (vector.length > 384) {
      vector = vector.slice(0, 384);
    } else if (vector.length < 384) {
      throw new Error(`Embedding generation returned insufficient dimension size: ${vector.length}. Expected 384.`);
    }

    return vector;
  } catch (error) {
    console.error("Gemini API Embedding Error:", error.message || error);
    if (error.status === 429 || error.message?.includes("429")) {
      throw new Error("Embedding API rate limit exceeded");
    }
    throw error;
  }
}

/**
 * Call the CockroachDB Managed MCP Server to introspect the database schema
 * and recent operational data.
 */
async function queryMCPServer() {
  if (!MCP_SERVER_URL) {
    return { available: false, reason: "MCP_SERVER_URL not configured" };
  }

  let transport;
  try {
    const url = new URL(MCP_SERVER_URL);
    transport = new StreamableHTTPClientTransport(url, {
      requestInit: {
        headers: { 
          "Authorization": `Bearer ${MCP_API_KEY}`,
          "mcp-cluster-id": MCP_CLUSTER_ID
        },
      },
    });

    const client = new Client(
      { name: "GridRescueLambda", version: "1.0.0" },
      { capabilities: {} }
    );

    await client.connect(transport);

    // Find the specific select_query tool
    const toolsList = await client.listTools();
    const tools = toolsList.tools || [];
    
    const readTool = tools.find(t => t.name === "select_query");

    if (!readTool) {
      throw new Error(`select_query tool not found. Available tools: ${tools.map(t => t.name).join(", ")}`);
    }

    console.log(`Selected MCP Tool: ${readTool.name}`);

    // Pass the database/cluster arguments exactly as required by the select_query input schema
    const props = readTool.inputSchema?.properties || {};
    const args = {};

    const sqlQuery = `SELECT id, scenario_summary, grid_stability, customers_without_power, facilities_at_risk, cascade_probability, created_at FROM incidents ORDER BY created_at DESC LIMIT 5`;

    for (const key of Object.keys(props)) {
      if (/sql|query|statement/i.test(key)) {
        args[key] = sqlQuery;
      } else if (/database|db/i.test(key)) {
        args[key] = "grid_disaster";
      }
    }

    const mcpResult = await client.callTool({
      name: readTool.name,
      arguments: args,
    });

    console.log(`MCP Call succeeded for tool: ${readTool.name}`);

    await transport.close();

    return {
      available: true,
      stats: `Schema context retrieved via ${readTool.name}`,
      schema: mcpResult?.content?.[0]?.text || JSON.stringify(mcpResult),
    };
  } catch (err) {
    console.warn("MCP Server query failed (non-fatal):", err.message);
    if (transport) await transport.close().catch(() => {});
    return { available: false, reason: err.message };
  }
}

/**
 * Call Groq to generate the Recovery Commander advisory.
 */
async function generateAdvisory(snapshot, memories, mcpContext) {
  const memoryBlock =
    memories.length > 0
      ? memories
          .map(
            (m, i) =>
              `[Memory ${i + 1}] ${m.incident_type} (${m.severity}) — Grid: ${m.grid_stability}%, Customers affected: ${m.customers_without_power}, Similarity: ${m.similarity?.toFixed(3) || "N/A"}\n  Summary: ${m.scenario_summary || "No summary"}`
          )
          .join("\n")
      : "No relevant historical incidents found.";

  const mcpBlock = mcpContext.available
    ? `DATABASE AWARENESS (via CockroachDB MCP Server):\nAggregate Stats: ${mcpContext.stats}\nTable Schema: ${mcpContext.schema}`
    : `MCP Server unavailable: ${mcpContext.reason}. Proceeding with snapshot data only.`;

  const systemPrompt = `You are the Recovery Commander Agent for GridRescue AI, an AI-powered electrical grid disaster recovery system. You coordinate specialist AI agents (Grid Stability, Load Prediction, Public Safety, Infrastructure Assessment) and synthesize their findings into a unified recovery advisory for human operators.

You have access to:
1. LIVE SIMULATION DATA — the current grid snapshot
2. HISTORICAL INCIDENT MEMORY — semantically similar past incidents retrieved via CockroachDB distributed vector search
3. DATABASE AWARENESS — real-time database introspection via the CockroachDB Managed MCP Server

Use past incidents to inform your recommendations. Always prioritize human safety.
Respond ONLY in valid JSON format.`;

  const userPrompt = `CURRENT GRID SNAPSHOT:
${JSON.stringify(snapshot, null, 2)}

HISTORICAL INCIDENT MEMORY (CockroachDB Vector Search):
${memoryBlock}

${mcpBlock}

Based on all available data, generate a recovery advisory. Respond in this exact JSON format:
{
  "situationAssessment": "1-2 sentence summary of the current crisis",
  "primaryPriority": "The single most important thing to address first",
  "recommendedSequence": "Step-by-step numbered recovery sequence",
  "majorTradeoff": "Key tradeoff the human operator should be aware of",
  "whyThisPlan": "Brief justification referencing historical data if available",
  "humanDecisionRequired": "The specific yes/no decision the operator must make",
  "provider": "Groq LLM + Gemini Embeddings + CockroachDB Vector + MCP Server"
}`;

  const completion = await groq.chat.completions.create({
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    model: "llama-3.3-70b-versatile",
    response_format: { type: "json_object" },
    temperature: 0.2,
  });

  const text = completion.choices[0]?.message?.content || "";

  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }

  throw new Error("LLM did not return valid JSON");
}

// ── Route Handler ──────────────────────────────────────────────────────────────

export const handler = async (event) => {
  try {
    const method = event?.requestContext?.http?.method || "POST";
    const path = event?.rawPath || event?.path || "/";

    // Browser CORS preflight
    if (method === "OPTIONS") {
      return { statusCode: 204, headers, body: "" };
    }

    // ── GET /  — Read persistent incident memory (with optional vector search) ──
    if (method === "GET") {
      const queryParams = event?.queryStringParameters || {};
      const searchQuery = queryParams.query;

      // If a search query is provided, do semantic vector similarity search
      if (searchQuery) {
        let queryEmbedding;
        try {
          queryEmbedding = await generateEmbedding(searchQuery);
        } catch (err) {
          console.warn("Vector search disabled (embedding failure):", err.message);
          // Fallback to chronological if embedding fails
          return await fallbackChronologicalSearch();
        }

        const vectorStr = "[" + queryEmbedding.join(",") + "]";

        const result = await pool.query(
          `SELECT
            id,
            incident_type,
            severity,
            status,
            scenario_summary,
            grid_stability,
            customers_without_power,
            facilities_at_risk,
            cascade_probability,
            incident_data,
            created_at,
            1 - (embedding <=> $1::VECTOR) AS similarity
          FROM incidents
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1::VECTOR
          LIMIT 5`,
          [vectorStr]
        );

        return {
          statusCode: 200,
          headers,
          body: JSON.stringify({
            success: true,
            message: "Semantic vector search via CockroachDB Distributed Vector Indexing",
            searchQuery,
            count: result.rows.length,
            incidents: result.rows,
          }),
        };
      }

      // Default: chronological retrieval (fallback)
      return await fallbackChronologicalSearch();
    }

    // ── POST /advisory — Recovery Commander LLM advisory ────────────────────
    if (method === "POST" && path.includes("/advisory")) {
      let data;
      if (event?.body) {
        data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } else {
        data = event || {};
      }

      const snapshot = data.snapshot || {};

      // 1. Generate embedding from the current scenario for memory lookup
      const scenarioText = [
        snapshot.scenario,
        snapshot.severity,
        `Grid stability: ${snapshot.gridStability}%`,
        `Customers without power: ${snapshot.customersWithoutPower}`,
        `Critical facilities at risk: ${snapshot.criticalFacilitiesAtRisk}`,
        snapshot.agents?.map((a) => `${a.name}: ${a.finding}`).join(". "),
      ]
        .filter(Boolean)
        .join(". ");

      // 2. Semantic vector search for similar historical incidents
      let memories = [];
      try {
        const queryEmbedding = await generateEmbedding(scenarioText);
        const vectorStr = "[" + queryEmbedding.join(",") + "]";

        const memResult = await pool.query(
          `SELECT
            id, incident_type, severity, scenario_summary,
            grid_stability, customers_without_power,
            1 - (embedding <=> $1::VECTOR) AS similarity
          FROM incidents
          WHERE embedding IS NOT NULL
          ORDER BY embedding <=> $1::VECTOR
          LIMIT 3`,
          [vectorStr]
        );
        memories = memResult.rows;
      } catch (vecErr) {
        console.warn("Vector search failed for advisory (non-fatal):", vecErr.message);
      }

      // 3. Query CockroachDB MCP Server for live database awareness
      const mcpContext = await queryMCPServer();

      // 4. Generate advisory via Groq
      const advisory = await generateAdvisory(snapshot, memories, mcpContext);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({ advisory }),
      };
    }

    // ── POST / — Write new incident memory (with vector embedding) ──────────
    if (method === "POST") {
      let data;
      if (event?.body) {
        data = typeof event.body === "string" ? JSON.parse(event.body) : event.body;
      } else {
        data = event || {};
      }

      const incident = data.incident || data;

      const {
        incidentType,
        severity,
        status = "ACTIVE",
        scenarioSummary = "",
        gridStability = null,
        customersWithoutPower = 0,
        facilitiesAtRisk = 0,
        cascadeProbability = null,
        incidentData = {},
      } = incident;

      if (!incidentType || !severity) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "incidentType and severity are required",
          }),
        };
      }

      // Generate embedding for the scenario summary for future vector search
      let embedding = null;
      let vectorStr = null;
      try {
        const textForEmbedding = [
          incidentType,
          severity,
          scenarioSummary,
          `Grid stability: ${gridStability}%`,
          `Customers without power: ${customersWithoutPower}`,
        ]
          .filter(Boolean)
          .join(". ");
        embedding = await generateEmbedding(textForEmbedding);
        vectorStr = "[" + embedding.join(",") + "]";
      } catch (embErr) {
        console.warn("Embedding generation failed, saving without vector:", embErr.message);
      }

      const result = await pool.query(
        `INSERT INTO incidents (
          incident_type,
          severity,
          status,
          scenario_summary,
          grid_stability,
          customers_without_power,
          facilities_at_risk,
          cascade_probability,
          incident_data,
          embedding
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::VECTOR)
        RETURNING id, created_at`,
        [
          incidentType,
          severity,
          status,
          scenarioSummary,
          gridStability,
          customersWithoutPower,
          facilitiesAtRisk,
          cascadeProbability,
          JSON.stringify(incidentData),
          vectorStr,
        ]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Incident stored in CockroachDB",
          incidentId: result.rows[0].id,
          createdAt: result.rows[0].created_at,
          hasEmbedding: !!embedding,
        }),
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ success: false, message: "Method not allowed" }),
    };

    // --- Helper function for fallback logic ---
    async function fallbackChronologicalSearch() {
      const result = await pool.query(`
        SELECT
          id,
          incident_type,
          severity,
          status,
          scenario_summary,
          grid_stability,
          customers_without_power,
          facilities_at_risk,
          cascade_probability,
          incident_data,
          created_at
        FROM incidents
        ORDER BY created_at DESC
        LIMIT 5
      `);

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Incident memory retrieved from CockroachDB (chronological fallback)",
          count: result.rows.length,
          incidents: result.rows,
        }),
      };
    }

  } catch (error) {
    console.error("GridRescue API error:", error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "GridRescue API error",
        error: error.message,
      }),
    };
  }
};