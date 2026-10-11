import React, { useState, useEffect } from 'react';
import type { AIAssistanceResponse, ChatItem, FollowUpMessage } from '../types';
import { api, ApiError } from '../lib/api';

export interface AIAssistancePanelProps {
  data: AIAssistanceResponse | null;
  loading: boolean;
  error: string | null;
  onSelectEvidence?: (evidenceId: string) => void;
  onAddToNotes?: (text: string) => void;
  contextType: 'signal' | 'case';
  contextId?: string;
}

const DEFAULT_SUGGESTIONS = [
  'What specific evidence suggests this cause?',
  'What telemetry is missing to confirm?',
  'Are any other assets affected?',
  'What are immediate containment steps?',
];

export const AIAssistancePanel: React.FC<AIAssistancePanelProps> = ({
  data,
  loading,
  error,
  onSelectEvidence,
  onAddToNotes,
  contextType,
  contextId,
}) => {
  const [copied, setCopied] = useState(false);
  const [addedInitialToNotes, setAddedInitialToNotes] = useState(false);

  // Scoped message history
  const [messages, setMessages] = useState<ChatItem[]>([]);
  const [questionInput, setQuestionInput] = useState('');
  const [followUpLoading, setFollowUpLoading] = useState(false);
  const [followUpError, setFollowUpError] = useState<string | null>(null);
  const [addedNoteIds, setAddedNoteIds] = useState<Record<string, boolean>>({});

  // Reset or initialize history when contextId changes
  useEffect(() => {
    setMessages([]);
    setQuestionInput('');
    setFollowUpError(null);
    setAddedNoteIds({});
  }, [contextId]);

  const handleCopy = () => {
    if (!data) return;
    const summaryText = data.summary || data.plain_english_summary;
    const formatted = `OpsTriage AI Diagnosis (${data.model_used}):
${summaryText}

Observed Facts:
${data.observed_facts.map((f) => `• ${f}`).join('\n')}

Possible Causes (Hypotheses):
${data.possible_causes.map((c) => `• ${c.description} [Evidence: ${c.supporting_evidence_ids.join(', ')}]`).join('\n')}

Recommended Next Steps:
${data.recommended_next_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}

Confidence Assessment:
${data.confidence_assessment}
${data.escalation_recommended ? `\n⚠️ Escalation Advised: ${data.escalation_reason || 'Urgent operational review recommended'}` : ''}`;

    navigator.clipboard.writeText(formatted).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleAddInitialNotes = () => {
    if (!data || !onAddToNotes) return;
    const summaryText = data.summary || data.plain_english_summary;
    const noteText = `[AI Diagnosis - ${data.model_used}]\n${summaryText}\n\nRecommended Actions:\n${data.recommended_next_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}`;
    onAddToNotes(noteText);
    setAddedInitialToNotes(true);

    // Also record distinct human note in message history
    const noteItem: ChatItem = {
      id: `note-${Date.now()}`,
      role: 'note',
      content: `Appended initial AI summary & recommended steps to investigation notes.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, noteItem]);

    setTimeout(() => setAddedInitialToNotes(false), 3000);
  };

  const handleAddMessageToNotes = (msg: ChatItem) => {
    if (!onAddToNotes) return;
    const noteText = `[Follow-Up Note]\n${msg.content}${msg.recommended_next_steps?.length ? `\n\nNext Steps:\n${msg.recommended_next_steps.map((s, i) => `${i + 1}. ${s}`).join('\n')}` : ''}`;
    onAddToNotes(noteText);

    setAddedNoteIds((prev) => ({ ...prev, [msg.id]: true }));

    // Record human note item in the conversation
    const noteRecord: ChatItem = {
      id: `note-record-${Date.now()}`,
      role: 'note',
      content: `Note added to investigation record: "${msg.content.slice(0, 100)}${msg.content.length > 100 ? '...' : ''}"`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, noteRecord]);

    setTimeout(() => {
      setAddedNoteIds((prev) => ({ ...prev, [msg.id]: false }));
    }, 3000);
  };

  const submitQuestion = async (qText: string) => {
    const trimmed = qText.trim();
    if (!trimmed || followUpLoading) return;

    if (!contextId) {
      setFollowUpError('Active record ID required for scoped follow-up inquiry.');
      return;
    }

    setFollowUpError(null);
    const userMsgId = `user-${Date.now()}`;
    const userMsg: ChatItem = {
      id: userMsgId,
      role: 'user',
      content: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Prepare API history
    const apiHistory: FollowUpMessage[] = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }));

    setMessages((prev) => [...prev, userMsg]);
    setQuestionInput('');
    setFollowUpLoading(true);

    try {
      const resp = await api.askFollowUp(contextType, contextId, trimmed, apiHistory);

      const aiMsg: ChatItem = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: resp.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        observed_facts: resp.observed_facts,
        causes: resp.possible_causes,
        recommended_next_steps: resp.recommended_next_steps,
        missing_information: resp.missing_information,
        evidenceIds: resp.validated_evidence_ids,
        modelUsed: resp.model_used,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err: unknown) {
      if (err instanceof ApiError) {
        if (err.status === 429) {
          setFollowUpError('Gemini API rate limit reached. Quotas are temporarily saturated; operational triage remains functional.');
        } else if (err.status === 502 || err.status === 504) {
          setFollowUpError('AI provider timeout or gateway outage. Operational systems and manual reviews are unaffected.');
        } else {
          setFollowUpError(err.detail || 'Failed to complete follow-up request.');
        }
      } else if (err instanceof Error) {
        setFollowUpError(err.message || 'Network error querying AI assistant.');
      } else {
        setFollowUpError('Unexpected error communicating with AI assistant.');
      }
    } finally {
      setFollowUpLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitQuestion(questionInput);
  };

  if (loading) {
    return (
      <div className="ai-panel is-loading">
        <div className="ai-loading-indicator">
          <div className="ai-loading-spinner" />
          <div className="ai-loading-text">
            <b>Analyzing verified telemetry with Gemini...</b>
            <small>Evaluating ground-truth records, sensor trends, and diagnostic correlations</small>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-panel is-error">
        <div className="ai-error-badge">⚠️ AI Advisory Unavailable</div>
        <div className="ai-error-content">
          <b>Unable to complete AI assistance request</b>
          <p>{error}</p>
          <small>
            Normal operational triage, manual assignments, and investigation workflows remain fully functional.
          </small>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const displaySummary = data.summary || data.plain_english_summary;

  return (
    <div className="ai-panel is-success">
      <div className="ai-panel-header">
        <div className="ai-badge-group">
          <span className="ai-chip">
            <span className="sparkle-icon">✦</span>
            Google Gemini ({data.model_used})
          </span>
          <span className="ai-disclaimer-pill">Advisory Only · Ground-Truth Verified</span>
        </div>

        <div className="ai-panel-actions">
          <button
            type="button"
            className="ai-action-btn"
            onClick={handleCopy}
            title="Copy diagnosis and recommended steps to clipboard"
          >
            {copied ? '✓ Copied' : '📋 Copy Summary'}
          </button>
          {contextType === 'case' && onAddToNotes && (
            <button
              type="button"
              className="ai-action-btn primary"
              onClick={handleAddInitialNotes}
              disabled={addedInitialToNotes}
              title="Append recommendation to case investigation notes"
            >
              {addedInitialToNotes ? '✓ Added to Notes' : '📝 Add to Notes'}
            </button>
          )}
        </div>
      </div>

      {data.escalation_recommended && (
        <div className="ai-escalation-banner">
          <b>⚠️ Immediate Operational Escalation Recommended</b>
          <span>{data.escalation_reason || 'Active deviation requires urgent management review.'}</span>
        </div>
      )}

      {/* Primary Summary */}
      <div className="ai-section">
        <h4 className="ai-section-title">Summary</h4>
        <p className="ai-summary-text">{displaySummary}</p>
      </div>

      {data.observed_facts.length > 0 && (
        <div className="ai-section">
          <h4 className="ai-section-title">Verified Facts from Database</h4>
          <ul className="ai-bullet-list">
            {data.observed_facts.map((fact, idx) => (
              <li key={idx}>{fact}</li>
            ))}
          </ul>
        </div>
      )}

      {data.possible_causes.length > 0 && (
        <div className="ai-section">
          <h4 className="ai-section-title">
            Possible Causes <span className="sub-tag">Candidate Hypotheses</span>
          </h4>
          <div className="ai-causes-grid">
            {data.possible_causes.map((cause, idx) => (
              <div key={idx} className="ai-cause-card">
                <p className="cause-desc">{cause.description}</p>
                {cause.supporting_evidence_ids.length > 0 && (
                  <div className="cause-evidence-row">
                    <span className="evidence-label">Supporting Evidence:</span>
                    {cause.supporting_evidence_ids.map((eid) => (
                      <button
                        key={eid}
                        type="button"
                        className="evidence-link-pill"
                        onClick={() => onSelectEvidence?.(eid)}
                        title={`Click to view linked record: ${eid}`}
                      >
                        🔗 {eid}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {data.recommended_next_steps.length > 0 && (
        <div className="ai-section">
          <h4 className="ai-section-title">Recommended Next Steps</h4>
          <ol className="ai-steps-list">
            {data.recommended_next_steps.map((step, idx) => (
              <li key={idx}>{step}</li>
            ))}
          </ol>
        </div>
      )}

      {data.missing_information.length > 0 && (
        <div className="ai-section">
          <h4 className="ai-section-title">Information Needed to Confirm Diagnosis</h4>
          <ul className="ai-bullet-list subtle">
            {data.missing_information.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Context-Aware Follow-Up Conversation & Message History ── */}
      <div className="ai-follow-up-section">
        <div className="ai-thread-header">
          <h4 className="ai-thread-title">
            <span>✦</span> Contextual Follow-Up Conversation
          </h4>
          {contextId && (
            <span style={{ fontSize: '10px', color: '#64748b', fontFamily: 'var(--font-mono)' }}>
              Scoped to {contextType}:{contextId.slice(0, 8)}
            </span>
          )}
        </div>

        {/* Message History */}
        {messages.length > 0 && (
          <div className="ai-chat-thread" data-testid="ai-chat-thread">
            {messages.map((msg) => (
              <div key={msg.id} className={`ai-chat-item ${msg.role === 'user' ? 'human' : msg.role === 'assistant' ? 'ai' : msg.role}`}>
                <div className="ai-chat-item-header">
                  <span className={`ai-chat-badge ${msg.role === 'user' ? 'human' : msg.role === 'assistant' ? 'ai' : msg.role}`}>
                    {msg.role === 'user' && '🧑 Duty Engineer'}
                    {msg.role === 'assistant' && '✦ Gemini AI Diagnostics'}
                    {msg.role === 'note' && '📝 Operator Note'}
                    {msg.role === 'audit' && '🛡️ Audit Event'}
                  </span>
                  <span className="ai-chat-timestamp">{msg.timestamp}</span>
                </div>

                <div className="ai-chat-item-body">{msg.content}</div>

                {/* Sub-sections for structured AI response in follow-up */}
                {msg.observed_facts && msg.observed_facts.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <b style={{ fontSize: '11px', color: '#4c1d95' }}>Observed Facts:</b>
                    <ul className="ai-bullet-list" style={{ marginTop: '3px' }}>
                      {msg.observed_facts.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.causes && msg.causes.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <b style={{ fontSize: '11px', color: '#4c1d95' }}>Candidate Hypotheses:</b>
                    <ul className="ai-bullet-list" style={{ marginTop: '3px' }}>
                      {msg.causes.map((c, i) => (
                        <li key={i}>
                          {c.description}
                          {c.supporting_evidence_ids.length > 0 && (
                            <span style={{ marginLeft: '6px', fontSize: '10px', color: '#7e22ce' }}>
                              [{c.supporting_evidence_ids.join(', ')}]
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.recommended_next_steps && msg.recommended_next_steps.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <b style={{ fontSize: '11px', color: '#4c1d95' }}>Recommended Actions:</b>
                    <ol className="ai-steps-list" style={{ marginTop: '3px' }}>
                      {msg.recommended_next_steps.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {msg.missing_information && msg.missing_information.length > 0 && (
                  <div style={{ marginTop: '8px' }}>
                    <b style={{ fontSize: '11px', color: '#64748b' }}>Missing Information Needed:</b>
                    <ul className="ai-bullet-list subtle" style={{ marginTop: '3px' }}>
                      {msg.missing_information.map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {msg.evidenceIds && msg.evidenceIds.length > 0 && (
                  <div className="cause-evidence-row" style={{ marginTop: '8px' }}>
                    <span className="evidence-label">Validated Evidence:</span>
                    {msg.evidenceIds.map((eid) => (
                      <button
                        key={eid}
                        type="button"
                        className="evidence-link-pill"
                        onClick={() => onSelectEvidence?.(eid)}
                        title={`View evidence: ${eid}`}
                      >
                        🔗 {eid}
                      </button>
                    ))}
                  </div>
                )}

                {/* Explicit Add to Notes button on AI messages */}
                {msg.role === 'assistant' && onAddToNotes && (
                  <div className="ai-chat-item-actions">
                    <button
                      type="button"
                      className="ai-note-btn"
                      onClick={() => handleAddMessageToNotes(msg)}
                      disabled={addedNoteIds[msg.id]}
                      title="Append response to investigation notes"
                    >
                      {addedNoteIds[msg.id] ? '✓ Added to Notes' : '📝 Add to Notes'}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Concise suggested questions */}
        <div className="ai-suggested-questions">
          {DEFAULT_SUGGESTIONS.map((sug, i) => (
            <button
              key={i}
              type="button"
              className="ai-suggestion-chip"
              onClick={() => submitQuestion(sug)}
              disabled={followUpLoading}
            >
              <span>💬</span> {sug}
            </button>
          ))}
        </div>

        {/* Ask a follow-up composer */}
        <form className="ai-composer-form" onSubmit={handleFormSubmit}>
          <input
            type="text"
            className="ai-composer-input"
            placeholder="Ask a follow-up regarding telemetry, thresholds, or evidence..."
            value={questionInput}
            onChange={(e) => setQuestionInput(e.target.value)}
            disabled={followUpLoading}
            aria-label="Ask a follow-up question"
          />
          <button
            type="submit"
            className="ai-composer-btn"
            disabled={followUpLoading || !questionInput.trim()}
          >
            {followUpLoading ? 'Analyzing...' : 'Ask Gemini ✦'}
          </button>
        </form>

        {followUpError && (
          <div className="ai-follow-up-error" role="alert">
            <span>⚠️</span>
            <span>{followUpError}</span>
          </div>
        )}
      </div>

      <div className="ai-footer-notes">
        <div className="confidence-text">
          <b>Diagnostic Confidence:</b> {data.confidence_assessment}
        </div>
        <small className="safety-note">
          Notice: AI suggestions cannot modify system priority, reassign cases, or execute remediations. Always verify sensor readings with plant engineers. All operational actions remain strictly under human control.
        </small>
      </div>
    </div>
  );
};
