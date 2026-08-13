import pg from "pg";

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 2,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 8000
});

const headers = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST,GET,OPTIONS"
};

export const handler = async (event) => {
  try {
    const method =
      event?.requestContext?.http?.method || "POST";

    // Browser CORS preflight
    if (method === "OPTIONS") {
      return {
        statusCode: 204,
        headers,
        body: ""
      };
    }

    // READ persistent incident memory
    if (method === "GET") {
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
          message: "Incident memory retrieved from CockroachDB",
          count: result.rows.length,
          incidents: result.rows
        })
      };
    }

    // WRITE new incident memory
    if (method === "POST") {
      let data;

      if (event?.body) {
        data =
          typeof event.body === "string"
            ? JSON.parse(event.body)
            : event.body;
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
        incidentData = {}
      } = incident;

      if (!incidentType || !severity) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({
            success: false,
            message: "incidentType and severity are required"
          })
        };
      }

      const result = await pool.query(
        `
        INSERT INTO incidents (
          incident_type,
          severity,
          status,
          scenario_summary,
          grid_stability,
          customers_without_power,
          facilities_at_risk,
          cascade_probability,
          incident_data
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        RETURNING id, created_at
        `,
        [
          incidentType,
          severity,
          status,
          scenarioSummary,
          gridStability,
          customersWithoutPower,
          facilitiesAtRisk,
          cascadeProbability,
          JSON.stringify(incidentData)
        ]
      );

      return {
        statusCode: 200,
        headers,
        body: JSON.stringify({
          success: true,
          message: "Incident stored in CockroachDB",
          incidentId: result.rows[0].id,
          createdAt: result.rows[0].created_at
        })
      };
    }

    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({
        success: false,
        message: "Method not allowed"
      })
    };

  } catch (error) {
    console.error("GridRescue API error:", error);

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        success: false,
        message: "CockroachDB operation failed",
        error: error.message
      })
    };
  }
};