import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ReportsPage, IngestionPage } from './App';
import type { Asset, CaseItem, Finding, IngestMetrics, SlaReportData } from './types';
import { api, ApiError } from './lib/api';

const mockFindings: Finding[] = [
  {
    id: 'f-001',
    fingerprint: 'fp-001',
    title: 'Supply Air Temperature Exceeded Threshold',
    severity: 'critical',
    priority: 1,
    priorityScore: 920,
    status: 'open',
    asset: 'AHU-17',
    assetType: 'ahu',
    incident: 'inc-001',
    owner: 'Duty Engineer',
    firstSeen: '10m ago',
    lastSeen: 'just now',
    occurrences: 14,
    rule: 'AHU Thermal Saturation',
    evidence: [{ label: 'Temp', value: '29.4C' }],
    rationale: [],
    description: 'Elevated supply air temperature',
  },
  {
    id: 'f-002',
    fingerprint: 'fp-002',
    title: 'Chilled Water Valve Saturation',
    severity: 'high',
    priority: 2,
    priorityScore: 780,
    status: 'open',
    asset: 'AHU-17',
    assetType: 'ahu',
    incident: 'inc-001',
    owner: 'Duty Engineer',
    firstSeen: '25m ago',
    lastSeen: '2m ago',
    occurrences: 8,
    rule: 'Actuator Valve Constraint',
    evidence: [{ label: 'Valve Position', value: '98%' }],
    rationale: [],
    description: 'Valve command saturated at 98%',
  },
];

const mockCases: CaseItem[] = [
  {
    id: 'case-001',
    title: 'AHU-17 Cooling Starvation',
    status: 'in_progress',
    priority: 1,
    assignee: 'Alice SRE',
    due: 'in 45 mins',
    isOverdue: false,
    slaStatus: 'at_risk',
    linkedFindings: 2,
    updated: 'Just now',
    source: 'ahu-17-gateway',
  },
  {
    id: 'case-002',
    title: 'Secondary Loop Pressure Drift',
    status: 'open',
    priority: 2,
    assignee: 'Unassigned',
    due: 'in 2 hours',
    isOverdue: false,
    slaStatus: 'compliant',
    linkedFindings: 1,
    updated: '5m ago',
    source: 'plant-sensor-bridge',
  },
];

const mockAssets: Asset[] = [
  {
    id: 'asset-ahu-17',
    name: 'AHU-17 North Tower',
    type: 'Air Handling Unit',
    location: 'Building A, Roof',
    health: 'critical',
    risk: 88,
    openFindings: 2,
    activeCases: 1,
    lastSignal: '1m ago',
    telemetry: 'Active',
    criticality: 90,
  },
  {
    id: 'asset-chiller-01',
    name: 'Chiller-01 Basement Plant',
    type: 'Chiller',
    location: 'Central Plant B1',
    health: 'healthy',
    risk: 15,
    openFindings: 0,
    activeCases: 0,
    lastSignal: '2m ago',
    telemetry: 'Active',
    criticality: 95,
  },
];

const mockReportsData: SlaReportData = {
  generated_at: new Date().toISOString(),
  top_anomalous_assets: [],
  sla_summary: [
    {
      priority: 1,
      total_incidents: 12,
      breached: 0,
      breach_rate_pct: 0.0,
      p95_resolution_minutes: 42.5,
    },
    {
      priority: 2,
      total_incidents: 28,
      breached: 2,
      breach_rate_pct: 7.1,
      p95_resolution_minutes: 110.0,
    },
  ],
};

const mockIngestMetrics: IngestMetrics = {
  total_events: 1420,
  processed_count: 1418,
  pending_count: 0,
  failed_count: 2,
  p95_latency_ms: 4370.2,
  avg_latency_ms: 22.4,
  recent_errors: [],
  sources_breakdown: {
    'ahu-17-gateway': 850,
    'scada-modbus': 570,
  },
  stages_breakdown: {
    payload_validation_ms: 1.4,
    raw_event_storage_ms: 3420.5,
    rule_correlation_ms: 4.8,
    commit_and_cache_ms: 943.5,
  },
  database_health: 'connected',
  database_latency_ms: 14.2,
  cache_health: 'connected',
  cache_latency_ms: 2.3,
  rules_evaluated_count: 8,
};

describe('ReportsPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders Real Operations tab by default with KPIs, trends, recurring issues, and asset reliability', () => {
    const handleNotify = vi.fn();
    render(
      <ReportsPage
        findings={mockFindings}
        cases={mockCases}
        assets={mockAssets}
        reportsData={mockReportsData}
        onNotify={handleNotify}
      />
    );

    // Verify Active Investigations & SLA Compliance KPIs
    expect(screen.getByText('Active investigations')).toBeInTheDocument();
    expect(screen.getByText('02')).toBeInTheDocument();
    expect(screen.getByText('Finding Occurrences by Day')).toBeInTheDocument();

    // Verify Scope distinction callout
    expect(screen.getByText(/Operational Scope Distinction:/i)).toBeInTheDocument();

    // Verify SLA Outcomes Table
    expect(screen.getByText('P95 Turnaround Time')).toBeInTheDocument();
    expect(screen.getByText('✓ SLA Met')).toBeInTheDocument();

    // Verify Top Recurring Issues
    expect(screen.getByText('Top Recurring Failure Modes')).toBeInTheDocument();
    expect(screen.getByText('Supply Air Temperature Exceeded Threshold')).toBeInTheDocument();
    expect(screen.getByText('14×')).toBeInTheDocument();

    // Verify Asset Reliability & Risk Band
    expect(screen.getByText('Asset Reliability & Risk Health')).toBeInTheDocument();
    expect(screen.getByText('AHU-17 North Tower')).toBeInTheDocument();
    expect(screen.getAllByText('Critical').length).toBeGreaterThan(0);
    expect(screen.getByText('Chiller-01 Basement Plant')).toBeInTheDocument();
    expect(screen.getByText('Minimal')).toBeInTheDocument();
  });

  it('switches between Real Operations and Simulation Lab tabs cleanly', () => {
    const handleNotify = vi.fn();
    render(
      <ReportsPage
        findings={mockFindings}
        cases={mockCases}
        assets={mockAssets}
        reportsData={mockReportsData}
        onNotify={handleNotify}
      />
    );

    // Switch to Simulation Lab
    const labTabBtn = screen.getByRole('button', { name: /simulation & benchmark lab/i });
    fireEvent.click(labTabBtn);

    // Verify developer lab callout and simulation cards
    expect(screen.getByText(/developer & sre counterfactual simulation lab/i)).toBeInTheDocument();
    expect(screen.getByText('Counterfactual SLA Queue Preemption')).toBeInTheDocument();
    expect(screen.getByText('HVAC Automated Fault Diagnostics (AFDD)')).toBeInTheDocument();

    // Switch back to Real Operations
    const opsTabBtn = screen.getByRole('button', { name: /real operations & sla reliability/i });
    fireEvent.click(opsTabBtn);

    expect(screen.getByText('Finding Occurrences by Day')).toBeInTheDocument();
  });

  it('supports CSV report export', () => {
    const handleNotify = vi.fn();
    render(
      <ReportsPage
        findings={mockFindings}
        cases={mockCases}
        assets={mockAssets}
        reportsData={mockReportsData}
        onNotify={handleNotify}
      />
    );

    const exportBtn = screen.getByRole('button', { name: /export live csv/i });
    fireEvent.click(exportBtn);

    expect(handleNotify).toHaveBeenCalledWith('Exported live database report to CSV', 'success');
  });
});

describe('IngestionPage Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders instrumented database and cache health with ping latencies and rules count', async () => {
    vi.spyOn(api, 'getHealth').mockResolvedValue({
      status: 'healthy',
      database: 'connected',
      cache: 'connected',
      version: '0.1.0',
    });
    vi.spyOn(api, 'getIngestMetrics').mockResolvedValue(mockIngestMetrics);

    const handleNotify = vi.fn();
    render(<IngestionPage onNotify={handleNotify} />);

    // Wait for metrics to load
    await waitFor(() => {
      expect(screen.getByText(/14.2 ms ping/i)).toBeInTheDocument();
      expect(screen.getByText(/2.3 ms ping/i)).toBeInTheDocument();
      expect(screen.getByText(/enabled rules available:/i)).toBeInTheDocument();
    });

    // Check Total events and P95 latency
    expect(screen.getByText('1420')).toBeInTheDocument();
    expect(screen.getByText('4370.2 ms')).toBeInTheDocument();

    // Check Stage Timing Breakdown cards tracing 4.37s P95
    expect(screen.getByText('Ingestion Stage Timing')).toBeInTheDocument();
    expect(screen.getByText('Payload Validation')).toBeInTheDocument();
    expect(screen.getByText('1.4 ms')).toBeInTheDocument();
    expect(screen.getByText('Raw Event Storage (Neon)')).toBeInTheDocument();
    expect(screen.getByText('3420.5 ms')).toBeInTheDocument();
    expect(screen.getByText('Condition Correlation')).toBeInTheDocument();
    expect(screen.getByText('4.8 ms')).toBeInTheDocument();
    expect(screen.getByText('Commit & Cache Invalidate')).toBeInTheDocument();
    expect(screen.getByText('943.5 ms')).toBeInTheDocument();
  });

  it('supports sending test telemetry and displaying traceable feedback', async () => {
    vi.spyOn(api, 'getHealth').mockResolvedValue({ status: 'healthy', database: 'connected', cache: 'connected', version: '0.1.0' });
    vi.spyOn(api, 'getIngestMetrics').mockResolvedValue(mockIngestMetrics);
    const ingestSpy = vi.spyOn(api, 'ingestSingle').mockResolvedValue({
      id: 'raw-evt-1234',
      status: 'success',
      source: 'ahu-17-gateway',
      processing_status: 'correlated',
      received_at: new Date().toISOString(),
      correlated_rules_count: 2,
    });

    const handleNotify = vi.fn();
    render(<IngestionPage onNotify={handleNotify} />);

    const sendTestBtn = screen.getByRole('button', { name: /send test telemetry event/i });
    fireEvent.click(sendTestBtn);

    await waitFor(() => {
      expect(ingestSpy).toHaveBeenCalled();
      expect(screen.getByText('Traceable Telemetry Ingested:')).toBeInTheDocument();
      expect(screen.getByText('raw-evt-1234')).toBeInTheDocument();
    });
  });

  it('supports testing invalid input 422 check without metric inflation', async () => {
    vi.spyOn(api, 'getHealth').mockResolvedValue({ status: 'healthy', database: 'connected', cache: 'connected', version: '0.1.0' });
    vi.spyOn(api, 'getIngestMetrics').mockResolvedValue(mockIngestMetrics);
    vi.spyOn(api, 'ingestSingle').mockRejectedValue(new ApiError(422, 'Field source cannot be empty'));

    const handleNotify = vi.fn();
    render(<IngestionPage onNotify={handleNotify} />);

    const invalidBtn = screen.getByRole('button', { name: /test invalid input/i });
    fireEvent.click(invalidBtn);

    await waitFor(() => {
      expect(screen.getByText(/rejected with 422: field source cannot be empty/i)).toBeInTheDocument();
      expect(screen.getByText(/operational counters and metrics were not inflated/i)).toBeInTheDocument();
    });
  });
});
