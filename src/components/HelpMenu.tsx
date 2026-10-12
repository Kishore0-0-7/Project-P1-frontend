import React, { useEffect, useRef, useState } from 'react';
import type { PageId } from '../types';
import { Icon } from './Icon';

export interface HelpMenuProps {
  page?: PageId;
  onStartTour: () => void;
  onNavigate: (view: PageId) => void;
}

interface Guide {
  id: string;
  title: string;
  icon: string;
  category: string;
  plainEnglishSummary: string;
  steps: Array<{ step: number; action: string; location: string; detail: string }>;
  targetView: PageId;
}

const TASK_GUIDES: Guide[] = [
  {
    id: 'investigate-alert',
    title: 'Investigate an Alert',
    icon: '🔍',
    category: 'Signal Intelligence',
    targetView: 'findings',
    plainEnglishSummary:
      'How to inspect a detected equipment or service anomaly, understand its severity, and review supporting sensor evidence without needing to decipher raw server logs.',
    steps: [
      {
        step: 1,
        action: 'Open Signal Intelligence',
        location: 'Left sidebar navigation',
        detail: 'Click "Signal Intelligence" to see all active anomalies grouped by impact.',
      },
      {
        step: 2,
        action: 'Select a signal row',
        location: 'Signal Findings Table',
        detail: 'Click anywhere on an alert row to open the full Diagnostic Inspection Drawer.',
      },
      {
        step: 3,
        action: 'Review telemetry trends & score rationale',
        location: 'Signal Drawer -> Evidence tab',
        detail: 'Examine the sensor readings (e.g. temperature delta, error spike, vibration frequency) and the transparent priority calculation breakdown.',
      },
      {
        step: 4,
        action: 'Get AI plain-English explanation',
        location: 'Signal Drawer -> "Explain with Gemini"',
        detail: 'Click the "Explain with Gemini" button to receive an instant, grounded operational summary and candidate causes.',
      },
      {
        step: 5,
        action: 'Escalate or link to a case',
        location: 'Signal Drawer -> "Escalate to Case"',
        detail: 'If the alert requires ongoing coordination, click "Escalate to Case" to create an auditable ticket with an SLA countdown.',
      },
    ],
  },
  {
    id: 'assign-resolve-case',
    title: 'Assign & Resolve a Case',
    icon: '📋',
    category: 'Casework',
    targetView: 'cases',
    plainEnglishSummary:
      'How to take ownership of an ongoing operational problem, keep it from breaching its SLA deadline, record engineering findings, and mark it resolved.',
    steps: [
      {
        step: 1,
        action: 'Open Casework',
        location: 'Left sidebar navigation',
        detail: 'Navigate to "Casework" to view all active investigations categorized by priority and ownership.',
      },
      {
        step: 2,
        action: 'Filter for unassigned work',
        location: 'Filter bar -> Status: Open / Unassigned',
        detail: 'Look for cases displaying the amber "Unassigned" pill to identify unowned issues requiring a lead engineer.',
      },
      {
        step: 3,
        action: 'Assign an owner & check SLA timer',
        location: 'Case Details -> Assignee dropdown',
        detail: 'Assign a designated team member. Notice the live countdown timer showing remaining minutes before SLA breach.',
      },
      {
        step: 4,
        action: 'Request AI investigation steps',
        location: 'Case Actions -> "Suggest Investigation Steps"',
        detail: 'Let Gemini review all linked signals and generate a structured checklist of isolation and verification actions.',
      },
      {
        step: 5,
        action: 'Add notes & verify resolution',
        location: 'Case Actions -> "Resolve Case"',
        detail: 'Type your resolution notes into the resolution modal and confirm. The case moves to "Resolved" and stops the SLA timer.',
      },
    ],
  },
  {
    id: 'connect-integration',
    title: 'Connect a Monitoring Integration',
    icon: '🔌',
    category: 'Integrations',
    targetView: 'integrations',
    plainEnglishSummary:
      'How external sensor gateways, SCADA controllers, and cloud monitoring tools push live telemetry into OpsTriage, and how to verify delivery connectivity.',
    steps: [
      {
        step: 1,
        action: 'Open Integrations',
        location: 'Left sidebar navigation',
        detail: 'Click "Integrations" to inspect all configured ingress telemetry bridges and egress notification channels.',
      },
      {
        step: 2,
        action: 'Identify your telemetry source',
        location: 'Integration Grid',
        detail: 'Find your connector (e.g. Facility BMS Gateway, AWS CloudWatch, SCADA Modbus, or Slack Operations Bridge).',
      },
      {
        step: 3,
        action: 'Run a live connection test',
        location: 'Bridge Card -> "Test Delivery"',
        detail: 'Click "Test Delivery" to execute an active roundtrip handshake. Notice the roundtrip latency and delivery verification badge.',
      },
      {
        step: 4,
        action: 'Verify event intake in Ingestion Health',
        location: 'Left sidebar -> "Ingestion Pipeline"',
        detail: 'Confirm that events are arriving and that P95 processing latency remains comfortably under 50 ms.',
      },
    ],
  },
  {
    id: 'dashboard-status-sla',
    title: 'Understand Dashboard & SLA Metrics',
    icon: '📊',
    category: 'Command Center & SLA',
    targetView: 'command-center',
    plainEnglishSummary:
      'How to interpret the high-level operational indicators, posture score, SLA percentages, and equipment risk radar without getting lost in technical terms.',
    steps: [
      {
        step: 1,
        action: 'Check the Operational Posture Score',
        location: 'Command Center -> Posture Card',
        detail: 'A score of 100/100 means nominal health. The score decreases dynamically when P1 incidents, active breaches, or overdue cases occur.',
      },
      {
        step: 2,
        action: 'Interpret the SLA Compliance Rate',
        location: 'Key Metrics Strip -> SLA Compliance',
        detail: 'Shows what percentage of open cases are currently within their committed restoration deadline. Overdue cases lower this number.',
      },
      {
        step: 3,
        action: 'Review the Attention List',
        location: 'Left Column -> Attention Queue',
        detail: 'Displays the most urgent items sorted by business severity. P1 issues always sit at the top.',
      },
      {
        step: 4,
        action: 'Understand the Equipment Risk Radar',
        location: 'Right Column -> Asset Risk Radar',
        detail: 'Ranks physical equipment and services by current risk score (0–100) based on active open signals, keeping critical assets in sharp focus.',
      },
    ],
  },
  {
    id: 'review-assets', title: 'Review Asset Health', icon: '▦', category: 'Assets', targetView: 'assets',
    plainEnglishSummary: 'Compare an asset’s business criticality with its current operational risk and telemetry state.',
    steps: [
      { step: 1, action: 'Search or filter the asset list', location: 'Assets -> Filter bar', detail: 'Narrow by site, equipment type, or health state.' },
      { step: 2, action: 'Compare health and criticality', location: 'Asset overview and cards', detail: 'Risk describes current condition; criticality describes business importance.' },
      { step: 3, action: 'Inspect linked operational work', location: 'Asset card -> Signals and cases', detail: 'Use linked findings and cases to decide what needs investigation.' },
    ],
  },
  {
    id: 'trace-incidents', title: 'Trace a Source Incident', icon: '◉', category: 'Source Incidents', targetView: 'incidents',
    plainEnglishSummary: 'Review incoming incidents and follow their relationship to findings and cases.',
    steps: [
      { step: 1, action: 'Review incident priority and source', location: 'Source Incidents table', detail: 'Confirm where the incident came from and what priority it has.' },
      { step: 2, action: 'Inspect linked finding evidence', location: 'Incident row -> linked signal', detail: 'Open a linked finding to review the evidence behind the signal.' },
      { step: 3, action: 'Escalate coordinated work', location: 'Incident actions', detail: 'Create a case when the issue needs an owner and tracked resolution.' },
    ],
  },
  {
    id: 'manage-rules', title: 'Manage Detection Rules', icon: '⌘', category: 'Rules & Automations', targetView: 'rules',
    plainEnglishSummary: 'Review rule definitions, lifecycle state, and measured effectiveness before changing detection behavior.',
    steps: [
      { step: 1, action: 'Filter rules by lifecycle state', location: 'Rules -> Filter bar', detail: 'Find active, draft, or paused rules.' },
      { step: 2, action: 'Inspect the rule definition', location: 'Rule row -> Details', detail: 'Check the engine and conditions before making a change.' },
      { step: 3, action: 'Preview before publishing', location: 'Rule actions -> Dry run', detail: 'Review the sample matches and stage before enabling a rule.' },
    ],
  },
  {
    id: 'read-insights', title: 'Read Reliability Insights', icon: '▤', category: 'Insights & AI Reports', targetView: 'reports',
    plainEnglishSummary: 'Read time-bounded incident outcomes and finding occurrence trends, with the data window and aggregation shown beside each chart.',
    steps: [
      { step: 1, action: 'Check the occurrence trend', location: 'Insights -> Trend graph', detail: 'The graph counts finding occurrences returned by the API for each UTC day.' },
      { step: 2, action: 'Compare closed incident SLA results', location: 'Insights -> SLA table', detail: 'Rows group closed incidents by priority for the selected reporting window.' },
      { step: 3, action: 'Separate live results from simulations', location: 'Operations and Benchmark Lab tabs', detail: 'Simulation results are what-if benchmarks and are not live production outcomes.' },
    ],
  },
  {
    id: 'check-ingestion', title: 'Check Telemetry Intake', icon: '⇧', category: 'Ingestion Health', targetView: 'ingestion',
    plainEnglishSummary: 'Verify API health and event processing metrics before relying on downstream findings.',
    steps: [
      { step: 1, action: 'Wait for health and metrics to load', location: 'Ingestion Health -> Pipeline status', detail: 'Unavailable metrics are shown as unavailable rather than a zero or sample value.' },
      { step: 2, action: 'Send a test event deliberately', location: 'Page actions -> Send test telemetry', detail: 'A valid test creates a real event in the workspace.' },
      { step: 3, action: 'Confirm event processing', location: 'Latest trace and counters', detail: 'Check its status and verify the event counters update.' },
    ],
  },
  {
    id: 'secure-workspace', title: 'Review Workspace Security', icon: '◇', category: 'Settings & Security', targetView: 'settings',
    plainEnglishSummary: 'Confirm your signed-in identity and use the account security controls available to your role.',
    steps: [
      { step: 1, action: 'Check identity and organization', location: 'Settings -> Identity', detail: 'Verify the active account, organization, and assigned role.' },
      { step: 2, action: 'Update account credentials', location: 'Settings -> Password', detail: 'Use the password form and never share credentials in support chat.' },
      { step: 3, action: 'Sign out from shared devices', location: 'Profile -> Sign out', detail: 'Signing out revokes the current session.' },
    ],
  },
];

const PAGE_NAMES: Record<PageId, string> = {
  'command-center': 'Command Center', findings: 'Signal Intelligence', cases: 'Casework', assets: 'Assets',
  incidents: 'Source Incidents', rules: 'Rules & Automations', reports: 'Insights & AI Reports',
  ingestion: 'Ingestion Health', integrations: 'Integrations', settings: 'Settings & Security',
};

export const HelpMenu: React.FC<HelpMenuProps> = ({ page, onStartTour, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGuide, setSelectedGuide] = useState<Guide | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!selectedGuide) return;
    document.body.setAttribute('data-help-target', selectedGuide.targetView);
    const target = document.querySelector(`[data-tour-focus="${selectedGuide.targetView}"]`);
    target?.classList.add('guide-focus-highlight');
    return () => {
      document.body.removeAttribute('data-help-target');
      target?.classList.remove('guide-focus-highlight');
    };
  }, [selectedGuide]);

  return (
    <div className="help-menu-container" ref={menuRef}>
      <button
        className="help-trigger-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
        title="Help & Operations Guides"
      >
        <span className="help-icon"><Icon name="book" size={16} /></span>
        <span className="help-label">Help &amp; Guides</span>
      </button>

      {isOpen && (
        <div className="help-dropdown" role="menu">
          <div className="help-dropdown-header">
            <b>{page ? `${PAGE_NAMES[page]} guide` : 'Operations Guides'}</b>
            <small>Page-specific workflow help</small>
          </div>

          <div className="help-dropdown-section">
            <button
              className="help-menu-item tour-item"
              onClick={() => {
                setIsOpen(false);
                onStartTour();
              }}
              role="menuitem"
            >
              <span className="item-icon">🎓</span>
              <div className="item-text">
                <b>Replay Platform Tour</b>
                <small>Walkthrough of all 10 workspace pages</small>
              </div>
            </button>
          </div>

          <div className="help-dropdown-divider" />

          <div className="help-dropdown-section">
            {TASK_GUIDES.filter((guide) => !page || guide.targetView === page).map((guide) => (
              <button
                key={guide.id}
                className="help-menu-item"
                aria-current={page === guide.targetView ? 'page' : undefined}
                onClick={() => {
                  setIsOpen(false);
                  setSelectedGuide(guide);
                }}
                role="menuitem"
              >
                <span className="item-icon">{guide.icon}</span>
                <div className="item-text">
                  <b>{guide.title}</b>
                  <small>{guide.category}</small>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedGuide && (
        <div className="guide-modal-overlay" role="dialog" aria-modal="false">
          <div className="guide-modal">
            <div className="guide-modal-header">
              <div className="guide-modal-badge">{selectedGuide.category}</div>
              <button
                className="guide-modal-close"
                onClick={() => setSelectedGuide(null)}
                aria-label="Close guide"
              >
                ✕
              </button>
            </div>

            <h2 className="guide-modal-title">
              <span style={{ marginRight: '8px' }}>{selectedGuide.icon}</span>
              {selectedGuide.title}
            </h2>

            <p className="guide-modal-summary">{selectedGuide.plainEnglishSummary}</p>

            <div className="guide-steps-list">
              {selectedGuide.steps.map((st) => (
                <div key={st.step} className="guide-step-card">
                  <div className="guide-step-number">{st.step}</div>
                  <div className="guide-step-body">
                    <div className="guide-step-action-row">
                      <b className="guide-step-action">{st.action}</b>
                      <span className="guide-step-location">{st.location}</span>
                    </div>
                    <p className="guide-step-detail">{st.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="guide-modal-footer">
              <button className="button secondary" onClick={() => setSelectedGuide(null)}>
                Close
              </button>
              <button
                className="button primary"
                onClick={() => {
                  onNavigate(selectedGuide.targetView);
                  setSelectedGuide(null);
                }}
              >
                Go to {selectedGuide.category}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
