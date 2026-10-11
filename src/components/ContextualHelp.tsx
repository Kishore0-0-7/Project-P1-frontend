import React, { useState } from 'react';

export type HelpTopic =
  | 'priority'
  | 'criticality_vs_risk'
  | 'sla_compliance'
  | 'ingestion_latency'
  | 'afdd_metrics'
  | 'data_provenance';

interface TopicContent {
  title: string;
  plainEnglish: string;
  technicalDetail?: string;
}

const EXPLANATIONS: Record<HelpTopic, TopicContent> = {
  priority: {
    title: 'Priority Levels (P1 – P5)',
    plainEnglish:
      'P1 means an active outage or critical environmental hazard requiring immediate dispatch. P2 means severe degradation that will soon trigger an outage if unmitigated. P3–P5 are moderate to low operational deviations.',
    technicalDetail:
      'Calculated via: (Impact × 0.45) + (Urgency × 0.35) + (Asset Criticality × 0.20), mapped onto SLA deadline targets.',
  },
  criticality_vs_risk: {
    title: 'Business Criticality vs. Operational Risk',
    plainEnglish:
      'Criticality is how essential the asset is all year round (e.g. Tier 1 hospital surgical suite vs. Tier 4 storage fan). Operational Risk is how dangerous the asset’s current condition is right now (0–100 score driven by active fault signals).',
    technicalDetail:
      'An asset can have high criticality but 0 risk if running normally. Conversely, a Tier 3 asset under severe mechanical vibration can climb to 90/100 risk.',
  },
  sla_compliance: {
    title: 'SLA Compliance & Deadlines',
    plainEnglish:
      'The percentage of active investigations currently tracking within their committed restoration time. "Compliant" means > 2 hours remain. "At Risk" warns you with <= 2 hours remaining. "Overdue" means the deadline was missed.',
    technicalDetail:
      'Calculated as ((Active Cases - Overdue Cases) / Active Cases) × 100 with UTC-normalized timestamp arithmetic.',
  },
  ingestion_latency: {
    title: 'Ingestion Pipeline Latency',
    plainEnglish:
      'The time taken (in milliseconds) from when external equipment sends a sensor reading until OpsTriage validates it, runs detection rules, and saves it to the database.',
    technicalDetail:
      'Measured as (processed_at - received_at) * 1000.0 ms. P95 latency indicates 95% of events process faster than this threshold.',
  },
  afdd_metrics: {
    title: 'AFDD Precision, Recall & F1',
    plainEnglish:
      'Precision: when an alarm sounds, what percentage of the time is it a real issue rather than a false alarm? Recall: out of all real problems that occurred, what percentage did the system catch? F1 is the balanced combination score.',
    technicalDetail:
      'Precision = TP / (TP + FP); Recall = TP / (TP + FN); F1 = 2 × (P × R) / (P + R). Benchmarked against ISO 10816 vibration fault datasets.',
  },
  data_provenance: {
    title: 'Live vs. Imported vs. Synthetic Data',
    plainEnglish:
      'Live Bridge: real-time streaming telemetry from active physical or cloud infrastructure. Demo/Imported: historical operational snapshots. Synthetic: offline benchmark and simulation runs.',
    technicalDetail:
      'Synthetic simulations (e.g. Monte Carlo SLA counterfactuals) run isolated from Neon production database records.',
  },
};

export interface ContextualHelpProps {
  topic: HelpTopic;
  label?: string;
  inline?: boolean;
}

export const ContextualHelp: React.FC<ContextualHelpProps> = ({ topic, label, inline = true }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showTechnical, setShowTechnical] = useState(false);
  const content = EXPLANATIONS[topic];

  if (!content) return null;

  return (
    <span className={`contextual-help-wrapper ${inline ? 'is-inline' : ''}`}>
      <button
        type="button"
        className="contextual-help-pill"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        title={`Click to understand ${content.title}`}
        aria-label={`Learn more about ${content.title}`}
      >
        <span className="info-icon">ℹ</span>
        {label && <span className="pill-label">{label}</span>}
      </button>

      {isOpen && (
        <div
          className="contextual-help-popover"
          role="tooltip"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="popover-header">
            <b>{content.title}</b>
            <button
              className="popover-close"
              onClick={() => setIsOpen(false)}
              aria-label="Close explanation"
            >
              ✕
            </button>
          </div>

          <p className="popover-plain">{content.plainEnglish}</p>

          {content.technicalDetail && (
            <div className="popover-tech-section">
              <button
                type="button"
                className="popover-tech-toggle"
                onClick={() => setShowTechnical(!showTechnical)}
              >
                {showTechnical ? '▲ Hide technical formula' : '▼ Technical details & formula'}
              </button>
              {showTechnical && (
                <p className="popover-tech-content">{content.technicalDetail}</p>
              )}
            </div>
          )}
        </div>
      )}
    </span>
  );
};
