import { useEffect, useState, type FormEvent } from 'react';
import { Icon } from './Icon';
import type { Severity } from '../types';

export type RecordKind = 'finding' | 'incident' | 'case' | 'rule';
export interface RecordDraft { title: string; asset: string; priority: number; severity: Severity; category: string }

const labels: Record<RecordKind, { title: string; description: string; action: string; main: string; secondary: string }> = {
  finding: { title: 'Create a finding', description: 'Add an evidence-backed item to the triage queue.', action: 'Create finding', main: 'Finding title', secondary: 'Asset or service' },
  incident: { title: 'Record an incident', description: 'Capture a source event and its response context.', action: 'Record incident', main: 'Incident summary', secondary: 'Asset or service' },
  case: { title: 'Open a case', description: 'Start a tracked investigation with an owner and priority.', action: 'Create case', main: 'Case title', secondary: 'Owner or team' },
  rule: { title: 'Create a rule draft', description: 'Start a versioned rule definition for review.', action: 'Save draft', main: 'Rule name', secondary: 'Category' },
};

export function RecordDialog({ kind, onClose, onSubmit }: { kind: RecordKind; onClose: () => void; onSubmit: (draft: RecordDraft) => void }) {
  const copy = labels[kind];
  const [title, setTitle] = useState('');
  const [asset, setAsset] = useState('');
  const [priority, setPriority] = useState(2);
  const [severity, setSeverity] = useState<Severity>('medium');
  const [category, setCategory] = useState(kind === 'rule' ? 'Operations · General' : '');

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [onClose]);

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit({ title: title.trim(), asset: asset.trim(), priority, severity, category: category.trim() });
  };

  return <div className="modal-layer" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="record-dialog" role="dialog" aria-modal="true" aria-labelledby="record-dialog-title"><header><span><small>OPSTRIAGE WORKSPACE</small><h2 id="record-dialog-title">{copy.title}</h2><p>{copy.description}</p></span><button type="button" className="icon-button" onClick={onClose} aria-label="Close dialog"><Icon name="close" /></button></header><form onSubmit={submit}><label>{copy.main}<input required maxLength={180} value={title} onChange={(event) => setTitle(event.target.value)} placeholder={kind === 'rule' ? 'e.g. Supply temperature guardrail' : 'Enter a clear, specific summary'} autoFocus /></label><label>{copy.secondary}<input required maxLength={120} value={asset} onChange={(event) => setAsset(event.target.value)} placeholder={kind === 'case' ? 'Person, team, or queue' : kind === 'rule' ? 'e.g. HVAC · Comfort' : 'e.g. AHU-17 · North Tower'} /></label>{kind !== 'rule' && <div className="dialog-grid"><label>Priority<select value={priority} onChange={(event) => setPriority(Number(event.target.value))}><option value={1}>P1 · Critical</option><option value={2}>P2 · High</option><option value={3}>P3 · Moderate</option><option value={4}>P4 · Low</option><option value={5}>P5 · Informational</option></select></label>{kind === 'finding' && <label>Severity<select value={severity} onChange={(event) => setSeverity(event.target.value as Severity)}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option><option value="info">Info</option></select></label>}{kind === 'incident' && <label>Source<input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="API, Prometheus, gateway…" /></label>}</div>}<footer><button type="button" className="button secondary" onClick={onClose}>Cancel</button><button className="button primary" type="submit"><Icon name="check" size={15} />{copy.action}</button></footer></form></section></div>;
}
