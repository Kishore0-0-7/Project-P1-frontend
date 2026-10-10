export type PageId =
  | 'command-center'
  | 'findings'
  | 'cases'
  | 'assets'
  | 'incidents'
  | 'rules'
  | 'reports'
  | 'ingestion'
  | 'integrations'
  | 'settings';

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type FindingStatus = 'open' | 'acknowledged' | 'suppressed' | 'resolved';
export type CaseStatus = 'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed';
export type Health = 'healthy' | 'watch' | 'at_risk' | 'critical';

export interface Finding {
  id: string;
  fingerprint: string;
  title: string;
  asset: string;
  assetType: string;
  incident: string;
  rule: string;
  severity: Severity;
  priority: number;
  priorityScore: number;
  status: FindingStatus;
  firstSeen: string;
  lastSeen: string;
  firstSeenAt?: string;
  occurrences: number;
  owner: string;
  evidence: Array<{ label: string; value: string; trend?: 'up' | 'down' | 'stable' }>;
  rationale: Array<{ label: string; detail: string; contribution: number }>;
  description: string;
}

export interface CaseItem {
  id: string;
  title: string;
  status: CaseStatus;
  priority: number;
  assignee: string;
  due: string;
  linkedFindings: number;
  updated: string;
  source: string;
  resolution?: string;
}

export interface Asset {
  id: string;
  name: string;
  type: string;
  location: string;
  health: Health;
  risk: number;
  openFindings: number;
  activeCases: number;
  lastSignal: string;
  telemetry: string;
  criticality: number;
}

export interface Rule {
  id: string;
  key: string;
  name: string;
  category: string;
  engine: 'Threshold' | 'Rolling window' | 'Expression' | 'Model';
  version: string;
  status: 'Active' | 'Draft' | 'Paused';
  effectiveness: number;
  findings: number;
  owner: string;
  updated: string;
}

export interface Incident {
  id: string;
  title: string;
  source: string;
  priority: number;
  status: 'Open' | 'Acknowledged' | 'Resolved' | 'Closed';
  opened: string;
  sla: string;
  asset: string;
}

export interface Activity {
  id: string;
  label: string;
  detail: string;
  time: string;
  tone: 'critical' | 'accent' | 'success' | 'neutral';
}

export interface AuthUser {
  id: string;
  email: string;
  display_name: string;
  org_id: string;
  role: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: AuthUser;
}

export interface SimulationResult {
  evaluated_incidents: number;
  baseline_breaches: number;
  baseline_breach_rate_pct: number;
  ai_breaches: number;
  ai_breach_rate_pct: number;
  breach_reduction_pct: number;
  high_priority_compliance_pct: number;
}

export interface HvacEvaluationResult {
  precision: number;
  recall: number;
  f1_score: number;
  false_alarm_rate_pct: number;
  lead_time_minutes: number;
  true_positives: number;
  false_positives: number;
  false_negatives: number;
  total_evaluations: number;
}

export interface SlaReportData {
  generated_at: string;
  sla_summary: Array<{
    priority: number;
    total_incidents: number;
    breached: number;
    breach_rate_pct: number;
    p95_resolution_minutes: number | null;
  }>;
  top_anomalous_assets: Array<{
    asset_id: string;
    high_severity_alerts: number;
    metrics: string[];
  }>;
}
