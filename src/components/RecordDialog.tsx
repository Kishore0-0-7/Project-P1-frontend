import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import type { Severity, RuleDryRunResult } from '../types';
import { api } from '../lib/api';

export type RecordKind = 'finding' | 'incident' | 'case' | 'rule';

export interface RecordDraft {
  title: string;
  asset: string;
  priority: number;
  severity: Severity;
  category: string;
  key?: string;
  stage?: 'draft' | 'active' | 'paused';
  engine?: 'threshold' | 'rolling_window' | 'expression' | 'model';
  definition?: Record<string, any>;
}

const labels: Record<RecordKind, { title: string; description: string; action: string; main: string; secondary: string }> = {
  finding: { title: 'Create a finding', description: 'Add an evidence-backed item to the triage queue.', action: 'Create finding', main: 'Finding title', secondary: 'Asset or service' },
  incident: { title: 'Record an incident', description: 'Capture a source event and its response context.', action: 'Record incident', main: 'Incident summary', secondary: 'Asset or service' },
  case: { title: 'Open a case', description: 'Start a tracked investigation with an owner and priority.', action: 'Create case', main: 'Case title', secondary: 'Owner or team' },
  rule: { title: 'Detection Rule Builder', description: 'Author, test, and version automated detection guardrails.', action: 'Publish rule', main: 'Rule name', secondary: 'Category' },
};

export function RecordDialog({
  kind,
  onClose,
  onSubmit,
}: {
  kind: RecordKind;
  onClose: () => void;
  onSubmit: (draft: RecordDraft) => void;
}) {
  const copy = labels[kind];
  const [title, setTitle] = useState('');
  const [asset, setAsset] = useState('');
  const [priority, setPriority] = useState(2);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [category, setCategory] = useState(kind === 'rule' ? 'Operations · General' : '');

  // Rule Builder Specific State
  const [ruleKey, setRuleKey] = useState('');
  const [stage, setStage] = useState<'draft' | 'active'>('active');
  const [engine, setEngine] = useState<'threshold' | 'rolling_window' | 'expression' | 'model'>('threshold');
  const [metric, setMetric] = useState('supply_air_temp');
  const [operator, setOperator] = useState('>=');
  const [threshold, setThreshold] = useState('28.5');
  const [unit, setUnit] = useState('°C');
  const [scope, setScope] = useState('all');
  const [windowMinutes, setWindowMinutes] = useState('5');
  const [expression, setExpression] = useState('');
  const [isAiDrafted, setIsAiDrafted] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Assistant State
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);

  // Dry-Run State
  const [dryRunLoading, setDryRunLoading] = useState(false);
  const [dryRunResult, setDryRunResult] = useState<RuleDryRunResult | null>(null);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const validateConditions = (): string | null => {
    if (kind !== 'rule') return null;
    if (ruleKey.trim() && !/^[a-z0-9_.-]+$/i.test(ruleKey.trim())) {
      return 'Rule key must only contain alphanumeric characters, hyphens, dots, or underscores.';
    }
    if (engine === 'expression') {
      if (!expression.trim()) return 'Expression formula string cannot be empty.';
    } else {
      if (!metric.trim()) return 'Metric / telemetry field name is required.';
      const num = parseFloat(threshold);
      if (isNaN(num) || !isFinite(num)) return 'Threshold value must be a valid number.';
      if (engine === 'rolling_window') {
        const win = parseInt(windowMinutes, 10);
        if (isNaN(win) || win <= 0) return 'Window duration must be a positive integer.';
      }
    }
    return null;
  };

  const handleAiPropose = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setValidationError(null);
    try {
      const res = await api.proposeRule(aiPrompt.trim());
      setTitle(res.name);
      setRuleKey(res.key);
      setCategory(res.category);
      setEngine(res.engine);
      if (res.definition) {
        setMetric(res.definition.metric || res.definition.field || 'value');
        setOperator(res.definition.operator || res.definition.op || '>=');
        setThreshold(String(res.definition.threshold ?? 25.0));
        if (res.definition.unit) setUnit(res.definition.unit);
        if (res.definition.window_minutes) setWindowMinutes(String(res.definition.window_minutes));
        if (res.definition.scope) setScope(res.definition.scope);
      }
      setSeverity(res.default_severity);
      setPriority(res.default_priority);
      setAiExplanation(res.explanation);
      setIsAiDrafted(true);
      setStage('draft'); // AI proposals are staged as draft by default; user must explicitly test & activate
    } catch {
      // Graceful fallback
    } finally {
      setAiLoading(false);
    }
  };

  const handleDryRun = async () => {
    const err = validateConditions();
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError(null);
    setDryRunLoading(true);
    setDryRunResult(null);
    try {
      const def: Record<string, any> = {
        metric: metric.trim(),
        operator,
        threshold: parseFloat(threshold) || 0,
        unit: unit.trim() || undefined,
        scope,
      };
      if (engine === 'rolling_window') {
        def.window_minutes = parseInt(windowMinutes, 10) || 5;
      } else if (engine === 'expression') {
        def.expression = expression.trim();
      }

      const res = await api.dryRunRule({
        engine,
        definition: def,
        sample_limit: 20,
      });
      setDryRunResult(res);
    } catch (err: any) {
      setValidationError(err?.message || 'Dry-run evaluation failed on live telemetry');
    } finally {
      setDryRunLoading(false);
    }
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const err = validateConditions();
    if (err) {
      setValidationError(err);
      return;
    }

    let def: Record<string, any> | undefined;
    if (kind === 'rule') {
      def = {
        metric: metric.trim() || 'value',
        operator,
        threshold: parseFloat(threshold) || 0,
        unit: unit.trim() || undefined,
        scope,
      };
      if (engine === 'rolling_window') {
        def.window_minutes = parseInt(windowMinutes, 10) || 5;
      } else if (engine === 'expression') {
        def.expression = expression.trim() || 'value >= 100';
      }
    }

    onSubmit({
      title: title.trim(),
      asset: asset.trim(),
      priority,
      severity,
      category: category.trim(),
      key: ruleKey.trim() || undefined,
      stage: kind === 'rule' ? stage : undefined,
      engine: kind === 'rule' ? engine : undefined,
      definition: def,
    });
  };

  return (
    <div
      className="modal-layer"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        className={`record-dialog ${kind === 'rule' ? 'record-dialog--rule' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="record-dialog-title"
        style={kind === 'rule' ? { width: 'min(620px, 100%)', maxHeight: '90vh', overflowY: 'auto' } : undefined}
      >
        <header>
          <span>
            <small>OPSTRIAGE WORKSPACE</small>
            <h2 id="record-dialog-title">{copy.title}</h2>
            <p>{copy.description}</p>
          </span>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog">
            <Icon name="close" />
          </button>
        </header>

        <form onSubmit={submit}>
          {kind === 'rule' && (
            <div
              style={{
                marginBottom: '16px',
                padding: '12px 14px',
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Icon name="sparkle" size={14} />
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Draft with AI (Gemini Assistant)
                  </span>
                </div>
                <small style={{ fontSize: '10px', color: '#64748b' }}>Deterministic evaluation · Manual review</small>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="e.g. Alert when Chiller supply temperature exceeds 28.5°C sustained for 5 minutes..."
                  style={{ flex: 1, height: '34px', margin: 0, fontSize: '12px' }}
                />
                <button
                  type="button"
                  className="button secondary"
                  style={{ height: '34px', padding: '0 12px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                  onClick={handleAiPropose}
                  disabled={aiLoading || !aiPrompt.trim()}
                >
                  <Icon name="sparkle" size={13} />
                  {aiLoading ? 'Generating...' : 'Propose Rule'}
                </button>
              </div>
              {aiExplanation && (
                <div style={{ marginTop: '8px', fontSize: '11px', color: '#334155', lineHeight: 1.4, background: '#f1f5f9', padding: '8px 10px', borderRadius: '5px', borderLeft: '3px solid #3b82f6' }}>
                  <b>AI Proposal Rationale:</b> {aiExplanation}
                  <div style={{ marginTop: '4px', fontSize: '10px', color: '#64748b' }}>
                    Conditions pre-populated as a staged draft. You can modify any condition below, dry-run on live telemetry, and explicitly activate.
                  </div>
                </div>
              )}
            </div>
          )}

          <label>
            {copy.main}
            <input
              required
              maxLength={180}
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder={kind === 'rule' ? 'e.g. North Tower Chilled Water Supply Temp Drift' : 'Enter a clear, specific summary'}
              autoFocus
            />
          </label>

          {kind === 'rule' ? (
            <>
              <div className="dialog-grid">
                <label>
                  Rule Identifier (Key)
                  <input
                    value={ruleKey}
                    onChange={(event) => setRuleKey(event.target.value)}
                    placeholder="e.g. hvac.chiller-supply-temp"
                  />
                </label>
                <label>
                  Category
                  <input
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    placeholder="e.g. HVAC · Thermal"
                  />
                </label>
              </div>

              <div className="dialog-grid">
                <label>
                  Detection Engine
                  <select
                    value={engine}
                    onChange={(event) => setEngine(event.target.value as any)}
                  >
                    <option value="threshold">Threshold (Instant value check)</option>
                    <option value="rolling_window">Rolling Window (Time-window sustained)</option>
                    <option value="expression">Expression (Custom formula)</option>
                    <option value="model">Model (RMS anomaly / ML)</option>
                  </select>
                </label>
                <label>
                  Target Estate Scope
                  <select
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                  >
                    <option value="all">All Estate Domains (Global)</option>
                    <option value="hvac">HVAC &amp; Mechanical Plant</option>
                    <option value="services">Microservices &amp; Gateway</option>
                    <option value="power">Power &amp; Energy</option>
                  </select>
                </label>
              </div>

              {engine === 'expression' ? (
                <label>
                  Expression Formula
                  <input
                    value={expression}
                    onChange={(e) => setExpression(e.target.value)}
                    placeholder="e.g. error_rate > 5.0 and request_count > 100"
                  />
                </label>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr 1fr 1fr', gap: '8px' }}>
                  <label>
                    Metric / Field
                    <input
                      required
                      value={metric}
                      onChange={(e) => setMetric(e.target.value)}
                      placeholder="e.g. supply_air_temp"
                    />
                  </label>
                  <label>
                    Operator
                    <select
                      value={operator}
                      onChange={(e) => setOperator(e.target.value)}
                    >
                      <option value=">">&gt; (Greater than)</option>
                      <option value=">=">&gt;= (Greater or equal)</option>
                      <option value="<">&lt; (Less than)</option>
                      <option value="<=">&lt;= (Less or equal)</option>
                      <option value="==">== (Exact match)</option>
                      <option value="!=">!= (Not equal)</option>
                    </select>
                  </label>
                  <label>
                    Threshold Value
                    <input
                      required
                      type="number"
                      step="any"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                      placeholder="28.5"
                    />
                  </label>
                  <label>
                    Unit
                    <select
                      value={unit}
                      onChange={(e) => setUnit(e.target.value)}
                    >
                      <option value="°C">°C (Celsius)</option>
                      <option value="°F">°F (Fahrenheit)</option>
                      <option value="%">% (Percent)</option>
                      <option value="ms">ms (Milliseconds)</option>
                      <option value="kW">kW (Power)</option>
                      <option value="RPM">RPM (Speed)</option>
                      <option value="req/s">req/s (Throughput)</option>
                      <option value="ppm">ppm (Gas / Air)</option>
                      <option value="">None / Raw</option>
                    </select>
                  </label>
                </div>
              )}

              <div className="dialog-grid">
                <label>
                  Evaluation Window (Minutes)
                  <input
                    type="number"
                    value={windowMinutes}
                    onChange={(e) => setWindowMinutes(e.target.value)}
                  />
                  <small style={{ color: '#64748b', fontSize: '10px', display: 'block', marginTop: '3px' }}>
                    Sustained condition duration required before triggering signal
                  </small>
                </label>
                <label>
                  Rule Version &amp; Audit
                  <div
                    style={{
                      height: '38px',
                      display: 'flex',
                      alignItems: 'center',
                      padding: '0 10px',
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '7px',
                      fontSize: '11px',
                      color: '#475569',
                      fontWeight: 600,
                      marginTop: '6px',
                    }}
                  >
                    Initial Version: v1.0 (Audited record)
                  </div>
                </label>
              </div>

              <div className="dialog-grid">
                <label>
                  Default Severity
                  <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)}>
                    <option value="critical">Critical</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                    <option value="info">Info</option>
                  </select>
                </label>
                <label>
                  Default Priority
                  <select value={priority} onChange={(event) => setPriority(Number(event.target.value))}>
                    <option value={1}>P1 · Critical (SLA: 1 hour)</option>
                    <option value={2}>P2 · High (SLA: 4 hours)</option>
                    <option value={3}>P3 · Moderate (SLA: 24 hours)</option>
                    <option value={4}>P4 · Low (SLA: 72 hours)</option>
                    <option value={5}>P5 · Informational (No SLA)</option>
                  </select>
                </label>
              </div>

              <div style={{ margin: '10px 0', padding: '10px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '7px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  Lifecycle &amp; Explicit Activation Choice
                </span>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 500, fontSize: '11.5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="stage"
                      value="draft"
                      checked={stage === 'draft'}
                      onChange={() => setStage('draft')}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    Save as Staged Draft (v1.0 · Review required before live evaluation)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: 0, fontWeight: 500, fontSize: '11.5px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="stage"
                      value="active"
                      checked={stage === 'active'}
                      onChange={() => setStage('active')}
                      style={{ width: 'auto', margin: 0 }}
                    />
                    Explicitly Activate into Production
                  </label>
                </div>
                {isAiDrafted && stage === 'active' && (
                  <div style={{ marginTop: '6px', fontSize: '10.5px', color: '#b45309' }}>
                    Notice: AI drafted this rule. Ensure you have tested conditions with Dry-Run before publishing directly to production.
                  </div>
                )}
              </div>

              {/* Validation Feedback */}
              {validationError && (
                <div
                  style={{
                    padding: '8px 12px',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '6px',
                    color: '#991b1b',
                    fontSize: '11.5px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    margin: '10px 0',
                  }}
                >
                  <Icon name="alert" size={14} />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Live Dry-Run Panel */}
              <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: '#334155', display: 'block' }}>
                      Dry-Run Evaluation Preview
                    </span>
                    <small style={{ fontSize: '10px', color: '#64748b' }}>
                      Tests this exact condition deterministically against recent live telemetry events
                    </small>
                  </div>
                  <button
                    type="button"
                    className="button secondary sm"
                    style={{ height: '30px', fontSize: '11px', padding: '0 12px' }}
                    onClick={handleDryRun}
                    disabled={dryRunLoading}
                  >
                    <Icon name="activity" size={13} />
                    {dryRunLoading ? 'Evaluating...' : 'Test on Live Telemetry'}
                  </button>
                </div>

                {dryRunResult && (
                  <div style={{ marginTop: '10px', fontSize: '11.5px', color: '#1e293b' }}>
                    <div style={{ display: 'flex', gap: '14px', alignItems: 'center', padding: '6px 10px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '5px' }}>
                      <span>Scanned: <strong>{dryRunResult.total_events_evaluated}</strong> raw events</span>
                      <span style={{ color: dryRunResult.matched_count > 0 ? '#b91c1c' : '#059669' }}>
                        Matches: <strong>{dryRunResult.matched_count}</strong> ({dryRunResult.match_rate_pct}%)
                      </span>
                    </div>

                    {dryRunResult.sample_matches.length > 0 ? (
                      <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>Sample Event Matches:</span>
                        {dryRunResult.sample_matches.slice(0, 3).map((sm, idx) => (
                          <div
                            key={idx}
                            style={{
                              padding: '6px 8px',
                              background: '#fff',
                              border: '1px solid #e2e8f0',
                              borderRadius: '5px',
                              fontSize: '11px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '8px',
                            }}
                          >
                            <div>
                              <span style={{ fontWeight: 600, color: '#0f172a' }}>{sm.source}</span>
                              <span style={{ color: '#64748b', marginLeft: '6px' }}>{sm.explanation}</span>
                            </div>
                            <small style={{ color: '#94a3b8', fontSize: '10px' }}>
                              {new Date(sm.occurred_at).toLocaleTimeString()}
                            </small>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div style={{ marginTop: '8px', fontSize: '11px', color: '#059669', fontStyle: 'italic' }}>
                        Nominal: Zero threshold violations detected across recent live telemetry.
                      </div>
                    )}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <label>
                {copy.secondary}
                <input
                  required
                  maxLength={120}
                  value={asset}
                  onChange={(event) => setAsset(event.target.value)}
                  placeholder={
                    kind === 'case'
                      ? 'Person, team, or queue'
                      : 'e.g. AHU-17 · North Tower'
                  }
                />
              </label>

              <div className="dialog-grid">
                <label>
                  Priority
                  <select value={priority} onChange={(event) => setPriority(Number(event.target.value))}>
                    <option value={1}>P1 · Critical</option>
                    <option value={2}>P2 · High</option>
                    <option value={3}>P3 · Moderate</option>
                    <option value={4}>P4 · Low</option>
                    <option value={5}>P5 · Informational</option>
                  </select>
                </label>
                {kind === 'finding' && (
                  <label>
                    Severity
                    <select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)}>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                      <option value="info">Info</option>
                    </select>
                  </label>
                )}
                {kind === 'incident' && (
                  <label>
                    Source
                    <input
                      value={category}
                      onChange={(event) => setCategory(event.target.value)}
                      placeholder="API, Prometheus, gateway…"
                    />
                  </label>
                )}
              </div>
            </>
          )}

          <footer>
            <button type="button" className="button secondary" onClick={onClose}>
              Cancel
            </button>
            <button className="button primary" type="submit">
              <Icon name="check" size={15} />
              {kind === 'rule' && stage === 'draft' ? 'Save as draft' : copy.action}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
}
