import type { Activity, Asset, CaseItem, Finding, Incident, Rule } from '../types';

export const findings: Finding[] = [
  {
    id: 'FND-2048', fingerprint: 'ahu-17-supply-temp-drift', title: 'Supply air temperature drifting beyond control band', asset: 'AHU-17 · North Tower', assetType: 'HVAC', incident: 'INC-4821', rule: 'Supply-air drift v3', severity: 'critical', priority: 1, priorityScore: 94, status: 'open', firstSeen: 'Today, 08:42', lastSeen: '2 min ago', occurrences: 38, owner: 'Unassigned',
    description: 'The unit has remained 4.8°C above its expected supply-air band for 38 observations. Compressor current and valve position indicate a developing cooling fault.',
    evidence: [{ label: 'Supply air', value: '28.8°C · +4.8°C', trend: 'up' }, { label: 'Compressor draw', value: '16.2 A · +21%', trend: 'up' }, { label: 'Valve position', value: '97% · sustained', trend: 'stable' }],
    rationale: [{ label: 'Asset criticality', detail: 'Tier 1 occupied zone', contribution: 28 }, { label: 'SLA exposure', detail: 'Comfort SLA likely in 44 min', contribution: 26 }, { label: 'Signal confidence', detail: '38 correlated observations', contribution: 22 }, { label: 'Pattern recurrence', detail: '5th occurrence this month', contribution: 18 }],
  },
  {
    id: 'FND-2047', fingerprint: 'checkout-error-burst', title: 'Checkout API error rate above customer-impact threshold', asset: 'checkout-api · prod-eu', assetType: 'Service', incident: 'INC-4820', rule: '5xx burst protection', severity: 'high', priority: 1, priorityScore: 89, status: 'acknowledged', firstSeen: 'Today, 08:31', lastSeen: '5 min ago', occurrences: 12, owner: 'R. Singh',
    description: 'A correlated 5xx burst is affecting the European checkout path after a provider timeout increase.',
    evidence: [{ label: '5xx rate', value: '8.4% · baseline 0.2%', trend: 'up' }, { label: 'Affected region', value: 'EU West', trend: 'stable' }, { label: 'Trace correlation', value: 'payments-provider timeout', trend: 'up' }],
    rationale: [{ label: 'Customer impact', detail: 'Revenue path affected', contribution: 32 }, { label: 'Error velocity', detail: '42× baseline in 10 min', contribution: 28 }, { label: 'Service tier', detail: 'Tier 0 transaction service', contribution: 22 }],
  },
  {
    id: 'FND-2043', fingerprint: 'chiller-03-energy-anomaly', title: 'Chiller energy intensity exceeds efficient operating range', asset: 'Chiller-03 · West Campus', assetType: 'HVAC', incident: 'INC-4817', rule: 'Energy efficiency guardrail', severity: 'high', priority: 2, priorityScore: 76, status: 'open', firstSeen: 'Today, 07:18', lastSeen: '11 min ago', occurrences: 21, owner: 'M. Chen',
    description: 'Energy consumption remains materially above the weather-normalized baseline while cooling output is unchanged.',
    evidence: [{ label: 'kW / ton', value: '1.34 · +31%', trend: 'up' }, { label: 'Outdoor air', value: '31.2°C', trend: 'stable' }, { label: 'Run time', value: '4h 18m', trend: 'up' }],
    rationale: [{ label: 'Cost exposure', detail: 'Projected ₹18,400/day variance', contribution: 24 }, { label: 'Sustained duration', detail: 'Over threshold for 4h', contribution: 20 }, { label: 'Asset criticality', detail: 'Central plant equipment', contribution: 18 }],
  },
  {
    id: 'FND-2038', fingerprint: 'warehouse-network-loss', title: 'Warehouse edge gateway packet loss increasing', asset: 'GW-MUM-04 · Warehouse', assetType: 'Network', incident: 'INC-4812', rule: 'Gateway health monitor', severity: 'medium', priority: 3, priorityScore: 58, status: 'open', firstSeen: 'Yesterday, 22:07', lastSeen: '18 min ago', occurrences: 9, owner: 'Unassigned',
    description: 'Packet loss is elevated but remains below the immediate outage threshold.',
    evidence: [{ label: 'Packet loss', value: '6.8%', trend: 'up' }, { label: 'Latency', value: '112 ms', trend: 'up' }, { label: 'Device uptime', value: '91d', trend: 'stable' }],
    rationale: [{ label: 'Trend direction', detail: 'Rising for 3 hours', contribution: 20 }, { label: 'Operational dependency', detail: 'Scanner telemetry affected', contribution: 16 }],
  },
  {
    id: 'FND-2032', fingerprint: 'air-handler-filter-pressure', title: 'Filter differential pressure nearing service threshold', asset: 'AHU-08 · South Tower', assetType: 'HVAC', incident: 'INC-4805', rule: 'Filter pressure watch', severity: 'low', priority: 4, priorityScore: 32, status: 'suppressed', firstSeen: 'Yesterday, 15:24', lastSeen: '1h ago', occurrences: 7, owner: 'Facilities queue',
    description: 'The filter is approaching its planned service threshold; the scheduled maintenance event makes this safe to suppress temporarily.',
    evidence: [{ label: 'Differential pressure', value: '238 Pa', trend: 'up' }, { label: 'Service date', value: 'Tomorrow, 09:00', trend: 'stable' }],
    rationale: [{ label: 'Planned work', detail: 'Maintenance already scheduled', contribution: -14 }, { label: 'Low customer impact', detail: 'Reserve unit available', contribution: 8 }],
  },
];

export const cases: CaseItem[] = [
  { id: 'CASE-901', title: 'Restore stable supply air in North Tower', status: 'open', priority: 1, assignee: 'Unassigned', due: 'Due in 44m', linkedFindings: 2, updated: '2 min ago', source: 'OpsTriage' },
  { id: 'CASE-899', title: 'Mitigate checkout provider timeouts', status: 'in_progress', priority: 1, assignee: 'R. Singh', due: 'Due in 1h 14m', linkedFindings: 3, updated: '5 min ago', source: 'Pager bridge' },
  { id: 'CASE-894', title: 'Investigate chiller load efficiency degradation', status: 'waiting', priority: 2, assignee: 'M. Chen', due: 'Due today, 16:00', linkedFindings: 1, updated: '11 min ago', source: 'OpsTriage' },
  { id: 'CASE-886', title: 'Replace warehouse gateway uplink', status: 'open', priority: 3, assignee: 'K. Patel', due: 'Due tomorrow', linkedFindings: 1, updated: '38 min ago', source: 'ServiceNow' },
  { id: 'CASE-874', title: 'Rebalance overnight batch capacity', status: 'resolved', priority: 3, assignee: 'S. Malik', due: 'Met SLA', linkedFindings: 2, updated: 'Yesterday', source: 'Jira', resolution: 'Autoscaling floor raised and overnight jobs staggered.' },
];

export const assets: Asset[] = [
  { id: 'AST-017', name: 'AHU-17', type: 'Air handling unit', location: 'North Tower · L14', health: 'critical', risk: 92, openFindings: 1, activeCases: 1, lastSignal: '2 min ago', telemetry: '28.8°C supply air', criticality: 5 },
  { id: 'AST-031', name: 'checkout-api', type: 'Transaction service', location: 'prod-eu · eu-west-1', health: 'at_risk', risk: 87, openFindings: 1, activeCases: 1, lastSignal: '5 min ago', telemetry: '8.4% 5xx rate', criticality: 5 },
  { id: 'AST-009', name: 'Chiller-03', type: 'Water-cooled chiller', location: 'West Campus · Plant room', health: 'watch', risk: 71, openFindings: 1, activeCases: 1, lastSignal: '11 min ago', telemetry: '1.34 kW / ton', criticality: 4 },
  { id: 'AST-044', name: 'GW-MUM-04', type: 'Edge gateway', location: 'Mumbai warehouse', health: 'watch', risk: 56, openFindings: 1, activeCases: 1, lastSignal: '18 min ago', telemetry: '6.8% packet loss', criticality: 3 },
  { id: 'AST-008', name: 'AHU-08', type: 'Air handling unit', location: 'South Tower · L9', health: 'healthy', risk: 24, openFindings: 0, activeCases: 0, lastSignal: '1h ago', telemetry: '238 Pa filter pressure', criticality: 3 },
  { id: 'AST-021', name: 'inventory-sync', type: 'Worker service', location: 'prod-ap · ap-south-1', health: 'healthy', risk: 18, openFindings: 0, activeCases: 0, lastSignal: '3 min ago', telemetry: '99.98% success rate', criticality: 3 },
];

export const rules: Rule[] = [
  { id: 'RULE-031', key: 'hvac.supply-air-drift', name: 'Supply-air drift protection', category: 'HVAC · Comfort', engine: 'Rolling window', version: 'v3.4', status: 'Active', effectiveness: 94, findings: 38, owner: 'Facilities intelligence', updated: '3 days ago' },
  { id: 'RULE-014', key: 'service.5xx-burst', name: '5xx burst protection', category: 'Service · Reliability', engine: 'Threshold', version: 'v2.8', status: 'Active', effectiveness: 91, findings: 24, owner: 'SRE platform', updated: '1 week ago' },
  { id: 'RULE-026', key: 'hvac.energy-guardrail', name: 'Energy efficiency guardrail', category: 'HVAC · Efficiency', engine: 'Expression', version: 'v1.9', status: 'Active', effectiveness: 86, findings: 16, owner: 'Facilities intelligence', updated: '2 weeks ago' },
  { id: 'RULE-042', key: 'network.gateway-health', name: 'Gateway health monitor', category: 'Network · Edge', engine: 'Model', version: 'v0.7', status: 'Draft', effectiveness: 78, findings: 9, owner: 'Edge operations', updated: 'Yesterday' },
  { id: 'RULE-051', key: 'hvac.filter-pressure', name: 'Filter pressure watch', category: 'HVAC · Preventive', engine: 'Threshold', version: 'v1.3', status: 'Paused', effectiveness: 88, findings: 7, owner: 'Facilities intelligence', updated: 'Today' },
];

export const incidents: Incident[] = [
  { id: 'INC-4821', title: 'North Tower climate-control deviation', source: 'BACnet gateway', priority: 1, status: 'Open', opened: 'Today, 08:42', sla: '44m remaining', asset: 'AHU-17' },
  { id: 'INC-4820', title: 'EU checkout elevated 5xx', source: 'Prometheus', priority: 1, status: 'Acknowledged', opened: 'Today, 08:31', sla: '1h 14m remaining', asset: 'checkout-api' },
  { id: 'INC-4817', title: 'West Campus chiller energy anomaly', source: 'MQTT ingest', priority: 2, status: 'Open', opened: 'Today, 07:18', sla: '3h 02m remaining', asset: 'Chiller-03' },
  { id: 'INC-4812', title: 'Mumbai warehouse gateway loss', source: 'Edge agent', priority: 3, status: 'Open', opened: 'Yesterday, 22:07', sla: '12h 18m remaining', asset: 'GW-MUM-04' },
];

export const activity: Activity[] = [
  { id: 'a1', label: 'Critical finding opened', detail: 'AHU-17 exceeded its thermal control band', time: '2 min ago', tone: 'critical' },
  { id: 'a2', label: 'Case escalated', detail: 'CASE-899 was assigned to R. Singh', time: '5 min ago', tone: 'accent' },
  { id: 'a3', label: 'Rule evaluated', detail: 'Supply-air drift v3 evaluated 1,248 events', time: '8 min ago', tone: 'success' },
  { id: 'a4', label: 'Signal suppressed', detail: 'AHU-08 maintenance window applied', time: '1h ago', tone: 'neutral' },
];

export const volumeSeries = [26, 31, 28, 39, 34, 48, 43, 58, 44, 51, 37, 42];
export const latencySeries = [38, 42, 36, 49, 43, 45, 39, 41, 35, 38, 32, 34];
