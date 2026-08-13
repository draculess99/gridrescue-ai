export interface GridIncidentPayload {
  incidentType: string;
  severity: string;
  status?: string;
  scenarioSummary?: string;
  gridStability?: number | null;
  customersWithoutPower?: number;
  facilitiesAtRisk?: number;
  cascadeProbability?: number | null;
  incidentData?: Record<string, unknown>;
}

export interface MemoryApiResponse {
  success: boolean;
  message: string;
  incidentId?: string;
  createdAt?: string;
  error?: string;
}

const MEMORY_API_URL = import.meta.env.VITE_GRID_MEMORY_API_URL;

export async function saveIncidentMemory(
  incident: GridIncidentPayload
): Promise<MemoryApiResponse> {
  if (!MEMORY_API_URL) {
    throw new Error("VITE_GRID_MEMORY_API_URL is not configured");
  }

  const response = await fetch(MEMORY_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(incident)
  });

  const data: MemoryApiResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || data.message || "Failed to store incident memory"
    );
  }

  return data;
} 
export interface IncidentMemory {
  id: string;
  incident_type: string;
  severity: string;
  status: string;
  scenario_summary: string;
  grid_stability: number | null;
  customers_without_power: number;
  facilities_at_risk: number;
  cascade_probability: number | null;
  incident_data: Record<string, unknown>;
  created_at: string;
}

export interface IncidentMemoryResponse {
  success: boolean;
  message: string;
  count: number;
  incidents: IncidentMemory[];
  error?: string;
}

export async function getIncidentMemory(): Promise<IncidentMemoryResponse> {
  if (!MEMORY_API_URL) {
    throw new Error("VITE_GRID_MEMORY_API_URL is not configured");
  }

  const response = await fetch(MEMORY_API_URL, {
    method: "GET"
  });

  const data: IncidentMemoryResponse = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data.error || data.message || "Failed to retrieve incident memory"
    );
  }

  return data;
}