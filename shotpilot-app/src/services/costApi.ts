const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`/api${endpoint}`, {
    ...options,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!response.ok) {
    let errMsg = response.statusText;
    try { const b = await response.json(); if (b.error) errMsg = b.error; } catch {}
    throw new Error(errMsg);
  }
  return response.json();
};

export interface CostSummary {
  last_action: {
    cost: number;
    action: string;
    model: string;
    timestamp: string;
  } | null;
  daily_total: {
    total_cost: number;
    call_count: number;
    breakdown_by_action: {
      action: string;
      cost: number;
      count: number;
    }[];
  };
  project_totals: {
    project_id: number;
    total_cost: number;
    call_count: number;
  }[];
}

export interface DailyCosts {
  total_cost: number;
  call_count: number;
  breakdown_by_action: {
    action: string;
    cost: number;
    count: number;
  }[];
}

export interface ProjectCosts {
  total_cost: number;
  call_count: number;
  breakdown_by_action: {
    action: string;
    cost: number;
    count: number;
  }[];
  breakdown_by_model: {
    model: string;
    cost: number;
    count: number;
  }[];
}

export const getCostSummary = async (): Promise<CostSummary> => 
  apiCall('/costs/summary');

export const getDailyCosts = async (date?: string): Promise<DailyCosts> => 
  apiCall(`/costs/daily${date ? `?date=${date}` : ''}`);

export const getProjectCosts = async (projectId: number): Promise<ProjectCosts> => 
  apiCall(`/costs/project/${projectId}`);

export const getCostReport = async (options: {
  from?: string;
  to?: string;
  groupBy?: 'day' | 'action' | 'model' | 'provider' | 'project';
}) => apiCall(`/costs/report?${new URLSearchParams(options).toString()}`);

export const exportCostsCsv = async (options: {
  from?: string;
  to?: string;
}) => {
  const response = await fetch(`/api/costs/export?${new URLSearchParams(options).toString()}`);
  const blob = await response.blob();
  return blob;
};