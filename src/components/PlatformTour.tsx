import React, { useEffect, useRef, useState } from 'react';
import type { PageId } from '../types';

export interface PlatformTourProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (view: PageId) => void;
  onOpenHelp?: (topic: string) => void;
}

interface TourStep {
  title: string;
  targetView: PageId;
  viewName: string;
  eyebrow: string;
  summary: string;
  takeaways: string[];
  actionLabel: string;
  helpGuidance: string;
  helpTopic: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    targetView: 'command-center',
    viewName: 'Command Center',
    eyebrow: 'STEP 1 OF 10 · COMMAND CENTER',
    title: 'What Needs Attention First',
    summary:
      'The Command Center gives you an instant, high-altitude view of operational health. It answers one essential question: "Is anything broken or about to breach right now?"',
    takeaways: [
      'Operational Posture Score: Reflects real-time system health (100 is optimal; drops when critical issues arise).',
      'Urgent Signal Attention: Prioritizes active problems by business impact so your team addresses the highest risk first.',
      'Equipment Risk Radar: Ranks physical equipment and services by current risk score rather than static importance.',
    ],
    actionLabel: 'Next: Inspect Signals',
    helpGuidance: 'Learn how multi-factor priority scores and system posture are computed.',
    helpTopic: 'priority',
  },
  {
    targetView: 'findings',
    viewName: 'Signal Intelligence',
    eyebrow: 'STEP 2 OF 10 · SIGNAL INTELLIGENCE',
    title: 'How to Inspect an Alert',
    summary:
      'Signal Intelligence detects anomalies before they become customer-facing incidents. Rather than flooding you with raw alerts, it clusters observations into explainable findings.',
    takeaways: [
      'Explainable Evidence: Every alert shows exact sensor trends (e.g. temperature, error rates, valve positions).',
      'Priority Scoring: Each alert displays its priority score and the factors used to explain it.',
      'AI Explanation: Click "Explain with Gemini" inside any alert drawer for a plain-English diagnosis and recommended actions.',
    ],
    actionLabel: 'Next: Manage Casework',
    helpGuidance: 'Explore explainable evidence verification and ground-truth telemetry thresholds.',
    helpTopic: 'criticality_vs_risk',
  },
  {
    targetView: 'cases',
    viewName: 'Casework & Investigations',
    eyebrow: 'STEP 3 OF 10 · CASEWORK & INVESTIGATIONS',
    title: 'Assign, Investigate, and Resolve',
    summary:
      'Casework is where operations managers coordinate investigations with clear ownership, strict SLA protection, and auditable decisions.',
    takeaways: [
      'Clear Ownership: Every case shows an assigned engineer or duty team; unassigned cases are highlighted for dispatch.',
      'Timezone-Aware SLA Timers: Live countdowns warn you 2 hours before target resolution deadlines breach.',
      'Investigation Assistance: Use Gemini AI to generate step-by-step investigation plans and paste notes into the case audit log.',
    ],
    actionLabel: 'Next: Telemetry Integrations',
    helpGuidance: 'Understand SLA countdowns, priority SLA windows, and human note auditing.',
    helpTopic: 'sla_compliance',
  },
  {
    targetView: 'integrations',
    viewName: 'Integrations & Bridges',
    eyebrow: 'STEP 4 OF 10 · INTEGRATIONS & BRIDGES',
    title: 'How Data Enters the System',
    summary:
      'OpsTriage connects to both physical plant infrastructure (BACnet, SCADA Modbus) and cloud software services (AWS CloudWatch, Celery, Datadog).',
    takeaways: [
      'Ingress Telemetry: External sensor gateways stream telemetry directly into our high-speed validation pipeline.',
      'Egress Bridges: Critical alerts can be dispatched automatically to Slack channels or synchronized with ServiceNow.',
      'Delivery Verification: Live roundtrip test buttons verify network delivery status before alarms occur.',
    ],
    actionLabel: 'Next: Assets',
    helpGuidance: 'Review ingestion pipeline latency, stage tracing, and live delivery guarantees.',
    helpTopic: 'ingestion_latency',
  },
  {
    targetView: 'assets', viewName: 'Assets', eyebrow: 'STEP 5 OF 10 · ASSETS',
    title: 'Review Asset Health', summary: 'Use the asset registry to compare business criticality with current operational risk.',
    takeaways: ['Filter by site or asset class.', 'Open an asset to compare current signals and active cases.', 'Treat a missing telemetry status as unknown until its source is verified.'],
    actionLabel: 'Next: Source Incidents', helpGuidance: 'Review equipment risk and telemetry provenance.', helpTopic: 'criticality_vs_risk',
  },
  {
    targetView: 'incidents', viewName: 'Source Incidents', eyebrow: 'STEP 6 OF 10 · INCIDENTS',
    title: 'Trace Incidents to Signals', summary: 'Source Incidents holds operational records that can be reviewed and escalated into coordinated casework.',
    takeaways: ['Review source and priority.', 'Open a linked finding to inspect its evidence.', 'Escalate incidents that need an owner and resolution tracking.'],
    actionLabel: 'Next: Rules', helpGuidance: 'Follow an incident from its source to the investigation workflow.', helpTopic: 'sla_compliance',
  },
  {
    targetView: 'rules', viewName: 'Rules & Automations', eyebrow: 'STEP 7 OF 10 · RULES',
    title: 'Control Detection Rules', summary: 'Inspect rule versions, stage, and status before changing how telemetry becomes findings.',
    takeaways: ['Review the rule definition and active version.', 'Use dry-run previews before publishing changes.', 'Keep production changes within your assigned role.'],
    actionLabel: 'Next: Insights', helpGuidance: 'Understand rule lifecycle and safe rollout.', helpTopic: 'priority',
  },
  {
    targetView: 'reports', viewName: 'Insights & AI Reports', eyebrow: 'STEP 8 OF 10 · INSIGHTS',
    title: 'Read Verified Operational Trends', summary: 'Insights summarizes backend incident, SLA, and finding occurrence data. Empty periods are shown as zero or no data.',
    takeaways: ['Check the data window and aggregation label.', 'Compare closed incident SLA outcomes by priority.', 'Use the simulation lab only as a what-if benchmark.'],
    actionLabel: 'Next: Ingestion Health', helpGuidance: 'Review what each reliability metric measures and its source.', helpTopic: 'sla_compliance',
  },
  {
    targetView: 'ingestion', viewName: 'Ingestion Health', eyebrow: 'STEP 9 OF 10 · INGESTION',
    title: 'Verify Incoming Telemetry', summary: 'Check service health and event intake before relying on a finding or dashboard trend.',
    takeaways: ['Review the latest pipeline status.', 'Send a test event only when you intend to create a real record.', 'Confirm that counters update after successful ingestion.'],
    actionLabel: 'Next: Settings', helpGuidance: 'Understand intake latency and the difference between validation and storage.', helpTopic: 'ingestion_latency',
  },
  {
    targetView: 'settings', viewName: 'Settings & Security', eyebrow: 'STEP 10 OF 10 · SETTINGS',
    title: 'Manage Your Workspace Access', summary: 'Review your signed-in identity and account security controls for this organization.',
    takeaways: ['Confirm the organization and role shown for your account.', 'Use password controls to maintain account security.', 'Sign out when you finish using a shared device.'],
    actionLabel: 'Finish Tour', helpGuidance: 'Review identity, authentication, and workspace security.', helpTopic: 'data_provenance',
  },
];

export const PlatformTour: React.FC<PlatformTourProps> = ({ isOpen, onClose, onNavigate, onOpenHelp }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [focusPage, setFocusPage] = useState(true);
  const modalRef = useRef<HTMLDivElement>(null);
  const primaryButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
      setFocusPage(true);
      onNavigate(TOUR_STEPS[0].targetView);
      document.body.setAttribute('data-tour-target', TOUR_STEPS[0].targetView);
    } else {
      document.body.removeAttribute('data-tour-target');
    }
    return () => {
      document.body.removeAttribute('data-tour-target');
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      primaryButtonRef.current?.focus();
      document.body.setAttribute('data-tour-target', TOUR_STEPS[currentStep].targetView);
    }
  }, [currentStep, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    let highlighted: Element | null = null;
    const frame = window.requestAnimationFrame(() => {
      highlighted = document.querySelector(`[data-tour-focus="${TOUR_STEPS[currentStep].targetView}"]`);
      highlighted?.classList.add('tour-focus-highlight');
    });
    return () => {
      window.cancelAnimationFrame(frame);
      highlighted?.classList.remove('tour-focus-highlight');
    };
  }, [currentStep, isOpen]);

  // Keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSkip();
      } else if (e.key === 'ArrowRight' && currentStep < TOUR_STEPS.length - 1) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && currentStep > 0) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = TOUR_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < TOUR_STEPS.length - 1) {
      const nextIdx = currentStep + 1;
      setCurrentStep(nextIdx);
      onNavigate(TOUR_STEPS[nextIdx].targetView);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      const prevIdx = currentStep - 1;
      setCurrentStep(prevIdx);
      onNavigate(TOUR_STEPS[prevIdx].targetView);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('opstriage.tour_completed', 'true');
    onClose();
  };

  const handleComplete = () => {
    localStorage.setItem('opstriage.tour_completed', 'true');
    onClose();
  };

  return (
    <div
      className="tour-overlay"
      data-focus-page={focusPage ? 'true' : undefined}
      role="dialog"
      aria-modal={!focusPage}
      aria-labelledby="tour-step-title"
      ref={modalRef}
    >
      <div className="tour-modal">
        <div className="tour-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="tour-eyebrow">{step.eyebrow}</span>
            <span
              className="tour-spotlight-badge"
              style={{
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '4px',
                background: '#e0e7ff',
                color: '#3730a3',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span>🎯 Spotlight:</span> {step.viewName}
            </span>
          </div>
          <button
            className="tour-close-btn"
            onClick={handleSkip}
            aria-label="Skip platform tour"
            title="Skip tour (Esc)"
          >
            ✕
          </button>
        </div>

        <div className="tour-current-page" aria-live="polite">
          <span className="tour-current-page-dot" />
          You are viewing <strong>{step.viewName}</strong>
          <button
            type="button"
            className="tour-focus-toggle"
            aria-pressed={focusPage}
            onClick={() => setFocusPage((active) => !active)}
          >
            {focusPage ? 'Return to tour' : 'Focus on this page'}
          </button>
        </div>

        <h2 id="tour-step-title" className="tour-title">
          {step.title}
        </h2>

        <p className="tour-summary">{step.summary}</p>

        <div className="tour-takeaways">
          <div className="tour-takeaways-heading">Key Takeaways for Operations Managers:</div>
          <ul>
            {step.takeaways.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>

        {/* ── Help Guidance Section ── */}
        <div
          className="tour-help-guidance"
          style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '18px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div style={{ fontSize: '11px', color: '#475569' }}>
            <strong style={{ color: '#0f172a' }}>📖 Help Guidance: </strong>
            {step.helpGuidance}
          </div>
          {onOpenHelp && (
            <button
              type="button"
              className="button secondary sm"
              style={{ fontSize: '11px', padding: '3px 8px', whiteSpace: 'nowrap' }}
              onClick={() => onOpenHelp(step.helpTopic)}
            >
              View Guide
            </button>
          )}
        </div>

        {/* Keyboard navigation instructions */}
        <div
          style={{
            fontSize: '10px',
            color: '#94a3b8',
            marginBottom: '16px',
            textAlign: 'center',
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
          }}
        >
          <span>⌨️ Keyboard controls:</span>
          <span><kbd style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>←</kbd> Back</span>
          <span><kbd style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>→</kbd> Next</span>
          <span><kbd style={{ background: '#f1f5f9', padding: '1px 5px', borderRadius: '3px', border: '1px solid #cbd5e1' }}>Esc</kbd> Skip</span>
        </div>

        <div className="tour-indicators">
          {TOUR_STEPS.map((_, idx) => (
            <span
              key={idx}
              className={`tour-dot ${idx === currentStep ? 'is-active' : ''} ${
                idx < currentStep ? 'is-completed' : ''
              }`}
            />
          ))}
        </div>

        <div className="tour-footer">
          <button className="button secondary tour-btn-skip" onClick={handleSkip}>
            Skip Tour
          </button>

          <div className="tour-nav-buttons">
            {currentStep > 0 && (
              <button className="button secondary" onClick={handlePrev}>
                Back
              </button>
            )}
            <button
              ref={primaryButtonRef}
              className="button primary tour-btn-primary"
              onClick={handleNext}
            >
              {step.actionLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
