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
export type Health = 'healthy' | 'watch' | 'at_risk' | 'critical' | 'inactive';

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
  assigneeId?: string | null;
  due: string;
  dueAt?: string;
  isOverdue?: boolean;
  slaStatus?: 'compliant' | 'on_track' | 'at_risk' | 'overdue' | 'no_sla' | 'met' | 'breached';
  timeRemainingText?: string;
  linkedFindings: number;
  findingIds?: string[];
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
  engine: 'Threshold' | 'Rolling window' | 'Expression' | 'Model' | string;
  version: string;
  status: 'Active' | 'Draft' | 'Paused';
  effectiveness: number | null;
  findings: number;
  owner: string;
  updated: string;
}

export interface RuleProposal {
  key: string;
  name: string;
  category: string;
  engine: 'threshold' | 'rolling_window' | 'expression' | 'model';
  definition: Record<string, any>;
  default_severity: Severity;
  default_priority: number;
  explanation: string;
}

export interface RuleDryRunResult {
  total_events_evaluated: number;
  matched_count: number;
  match_rate_pct: number;
  engine: string;
  definition: Record<string, any>;
  sample_matches: Array<{
    event_id: string;
    source: string;
    occurred_at: string;
    matched: boolean;
    explanation: string;
    actual_value?: any;
    threshold_value?: any;
  }>;
}

export interface OperationalSummary {
  generated_at: string;
  org_id: string;
  total_cases: number;
  active_cases: number;
  unassigned_cases: number;
  overdue_cases: number;
  at_risk_cases: number;
  compliant_cases: number;
  breached_cases: number;
  resolved_cases: number;
  sla_compliance_pct: number;
  open_signals_count: number;
  critical_signals_count: number;
  high_signals_count: number;
  total_assets: number;
  at_risk_assets: number;
  active_on_track?: number;
  active_at_risk?: number;
  active_overdue?: number;
  active_no_sla?: number;
  completed_met?: number;
  completed_breached?: number;
  completed_no_sla?: number;
  active_sla_compliance_pct?: number;
  completed_sla_compliance_pct?: number;
}

export interface PostureComponent {
  name: string;
  weight: number;
  raw_value: number;
  penalty: number;
  description: string;
}

export interface PostureReport {
  score: number;
  grade: string;
  definition: string;
  components: PostureComponent[];
  calculated_at: string;
}

export interface PossibleCause {
  description: string;
  supporting_evidence_ids: string[];
}

export interface AIAssistanceResponse {
  plain_english_summary: string;
  summary?: string;
  observed_facts: string[];
  possible_causes: PossibleCause[];
  recommended_next_steps: string[];
  missing_information: string[];
  confidence_assessment: string;
  escalation_recommended: boolean;
  escalation_reason?: string | null;
  validated_evidence_ids: string[];
  model_used: string;
}

export interface FollowUpMessage {
  role: 'user' | 'assistant' | 'model' | 'system';
  content: string;
}

export interface FollowUpResponse {
  answer: string;
  observed_facts: string[];
  possible_causes: PossibleCause[];
  recommended_next_steps: string[];
  missing_information: string[];
  confidence_assessment: string;
  validated_evidence_ids: string[];
  model_used: string;
}

export interface ChatItem {
  id: string;
  role: 'user' | 'assistant' | 'note' | 'audit';
  content: string;
  timestamp: string;
  observed_facts?: string[];
  causes?: PossibleCause[];
  recommended_next_steps?: string[];
  missing_information?: string[];
  evidenceIds?: string[];
  modelUsed?: string;
  actorName?: string;
}

export interface Incident {
  id: string;
  title: string;
  source: string;
  sourceType?: 'live_bridge' | 'demo_fixture' | 'manual_ingest';
  integrationName?: string;
  priority: number;
  status: 'Open' | 'Acknowledged' | 'Resolved' | 'Closed';
  opened: string;
  sla: string;
  isOverdue?: boolean;
  asset: string;
  is_synthetic?: boolean;
  provenance?: string;
  slaStatus?: 'on_track' | 'compliant' | 'at_risk' | 'overdue' | 'no_sla' | 'met' | 'breached';
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
  run_id?: string;
  evaluated_incidents: number;
  baseline_breaches: number;
  baseline_breach_rate_pct: number;
  ai_breaches: number;
  ai_breach_rate_pct: number;
  breach_reduction_pct: number;
  high_priority_compliance_pct: number;
  preempted_count?: number;
  mttr_saved_minutes?: number;
}

export interface HvacEvaluationResult {
  run_id?: string;
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

export interface IntakeTimelinePoint {
  timestamp: string;
  label: string;
  count: number;
  window_start?: string;
  window_end?: string;
  last_event_at?: string | null;
}

export interface IngestMetrics {
  total_events: number;
  processed_count: number;
  pending_count: number;
  failed_count: number;
  p95_latency_ms: number | null;
  avg_latency_ms: number | null;
  sources_breakdown: Record<string, number>;
  recent_errors: Array<{
    id: string;
    source: string;
    error: string;
    occurred_at: string;
  }>;
  stages_breakdown?: Record<string, number>;
  database_health?: string;
  database_latency_ms?: number;
  cache_health?: string;
  cache_latency_ms?: number;
  rules_evaluated_count?: number;
}

export interface IntegrationBridge {
  id: string;
  name: string;
  category: 'live' | 'replay' | 'egress';
  protocol?: string;
  port?: number;
  description: string;
  status_text: string;
  status_badge: string;
  is_connected: boolean;
  events_count: number;
  deliveries_count: number;
  successful_deliveries?: number;
  failed_deliveries?: number;
  success_rate_pct: number | null;
  last_activity_at: string;
}

export interface SourceEventDetail {
  finding_id: string;
  raw_event_id?: string | null;
  source: string;
  source_event_id?: string | null;
  event_type?: string;
  occurred_at?: string;
  received_at?: string;
  payload: Record<string, any>;
  processing_status?: string;
  triggering_metric?: string;
  triggering_value?: number;
}


