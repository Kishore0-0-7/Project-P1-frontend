import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AIAssistancePanel } from './AIAssistancePanel';
import type { AIAssistanceResponse, FollowUpResponse } from '../types';
import { api, ApiError } from '../lib/api';

const mockAIData: AIAssistanceResponse = {
  summary: 'Primary cooling water temperature is rising due to valve throttling.',
  plain_english_summary: 'Primary cooling water temperature is rising due to valve throttling.',
  observed_facts: [
    'Supply water sensor reading 78.4F exceeding nominal threshold of 72F',
    'Chilled water return flow dropped by 18% over the past 30 minutes',
  ],
  possible_causes: [
    {
      description: 'Actuator valve stuck in partial closed position',
      supporting_evidence_ids: ['EV-VALVE-01', 'EV-CHW-02'],
    },
    {
      description: 'Upstream strainer clogging causing differential pressure drop',
      supporting_evidence_ids: ['EV-FLOW-03'],
    },
  ],
  recommended_next_steps: [
    'Inspect pneumatic actuator supply pressure on Valve V-102',
    'Verify differential pressure transducer calibration across chiller 1',
  ],
  missing_information: [
    'Secondary loop return temperature telemetry currently offline',
  ],
  confidence_assessment: 'High confidence based on concurrent flow and temperature telemetry anomalies.',
  escalation_recommended: true,
  escalation_reason: 'Potential chilled water loop starvation within 45 minutes.',
  model_used: 'gemini-3.1-flash-lite',
  validated_evidence_ids: ['EV-VALVE-01', 'EV-CHW-02', 'EV-FLOW-03'],
};

const mockFollowUpResp: FollowUpResponse = {
  answer: 'Differential pressure sensor DP-101 indicates 14.2 PSI drop across strainer.',
  observed_facts: ['DP-101 is reading 14.2 PSI (nominal <= 8.0 PSI)'],
  possible_causes: [
    {
      description: 'Particulate fouling in strainer mesh',
      supporting_evidence_ids: ['EV-DP-101'],
    },
  ],
  recommended_next_steps: ['Isolate strainer basket and inspect mesh screen'],
  missing_information: ['Upstream flow rate sensor offline'],
  confidence_assessment: 'High confidence from differential pressure measurement.',
  validated_evidence_ids: ['EV-DP-101'],
  model_used: 'gemini-3.1-flash-lite',
};

describe('AIAssistancePanel Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders compact loading state while querying model', () => {
    render(
      <AIAssistancePanel
        data={null}
        loading={true}
        error={null}
        contextType="signal"
      />
    );

    expect(screen.getByText(/analyzing verified telemetry with gemini/i)).toBeInTheDocument();
    expect(screen.getByText(/evaluating ground-truth records/i)).toBeInTheDocument();
  });

  it('renders honest error fallback when error occurs', () => {
    render(
      <AIAssistancePanel
        data={null}
        loading={false}
        error="AI assistance is temporarily disabled. Operational triage remains functional."
        contextType="signal"
      />
    );

    expect(screen.getByText(/ai advisory unavailable/i)).toBeInTheDocument();
    expect(
      screen.getByText(/ai assistance is temporarily disabled/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/normal operational triage, manual assignments, and investigation workflows remain fully functional/i)
    ).toBeInTheDocument();
  });

  it('renames Plain-English Summary to Summary and renders structured facts', () => {
    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="signal"
        contextId="sig-101"
      />
    );

    // Verify renamed heading: "Summary" instead of "Plain-English Summary"
    expect(screen.getByRole('heading', { level: 4, name: /^summary$/i })).toBeInTheDocument();
    expect(screen.getByText(mockAIData.summary!)).toBeInTheDocument();
    expect(screen.getByText(mockAIData.observed_facts[0])).toBeInTheDocument();
    expect(screen.getByText(mockAIData.observed_facts[1])).toBeInTheDocument();
    expect(screen.getByText(/gemini-3.1-flash-lite/)).toBeInTheDocument();
  });

  it('labels causes as candidate hypotheses, not confirmed root causes, and renders evidence pills', () => {
    const handleSelectEvidence = vi.fn();
    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
        onSelectEvidence={handleSelectEvidence}
      />
    );

    // Verify hypotheses label
    expect(screen.getByText(/Candidate Hypotheses/i)).toBeInTheDocument();

    // Verify possible causes
    expect(
      screen.getByText('Actuator valve stuck in partial closed position')
    ).toBeInTheDocument();

    // Verify clickable evidence tag
    const evidenceBtn = screen.getByRole('button', { name: /EV-VALVE-01/i });
    expect(evidenceBtn).toBeInTheDocument();
    fireEvent.click(evidenceBtn);
    expect(handleSelectEvidence).toHaveBeenCalledWith('EV-VALVE-01');
  });

  it('supports copying the recommendation formatted text', async () => {
    const writeTextMock = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText: writeTextMock,
      },
    });

    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
      />
    );

    const copyBtn = screen.getByRole('button', { name: /copy summary/i });
    fireEvent.click(copyBtn);

    expect(writeTextMock).toHaveBeenCalledTimes(1);
    expect(writeTextMock.mock.calls[0][0]).toContain('OpsTriage AI Diagnosis (gemini-3.1-flash-lite):');
    expect(writeTextMock.mock.calls[0][0]).toContain(mockAIData.summary);
  });

  it('supports adding recommendation to investigation notes', () => {
    const handleAddToNotes = vi.fn();
    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
        onAddToNotes={handleAddToNotes}
      />
    );

    const addNotesBtn = screen.getByRole('button', { name: /add to notes/i });
    fireEvent.click(addNotesBtn);

    expect(handleAddToNotes).toHaveBeenCalledTimes(1);
    expect(handleAddToNotes.mock.calls[0][0]).toContain('[AI Diagnosis - gemini-3.1-flash-lite]');
    expect(handleAddToNotes.mock.calls[0][0]).toContain('Recommended Actions:');

    // Also verify operator note appears in conversation history
    expect(screen.getByText(/appended initial ai summary & recommended steps to investigation notes/i)).toBeInTheDocument();
  });

  it('renders suggested questions and allows asking follow-up questions', async () => {
    const askSpy = vi.spyOn(api, 'askFollowUp').mockResolvedValueOnce(mockFollowUpResp);

    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
      />
    );

    // Verify suggested question chips exist
    expect(screen.getByText(/what specific evidence suggests this cause\?/i)).toBeInTheDocument();
    expect(screen.getByText(/what telemetry is missing to confirm\?/i)).toBeInTheDocument();

    // Click a suggested question
    fireEvent.click(screen.getByText(/what specific evidence suggests this cause\?/i));

    await waitFor(() => {
      expect(askSpy).toHaveBeenCalledWith(
        'case',
        'case-101',
        'What specific evidence suggests this cause?',
        []
      );
    });

    // Check that response is rendered with distinct badges
    expect(screen.getByText('🧑 Duty Engineer')).toBeInTheDocument();
    expect(screen.getByText('✦ Gemini AI Diagnostics')).toBeInTheDocument();
    expect(screen.getByText(mockFollowUpResp.answer)).toBeInTheDocument();
  });

  it('supports typing in composer and adding follow-up response to notes', async () => {
    const handleAddToNotes = vi.fn();
    vi.spyOn(api, 'askFollowUp').mockResolvedValueOnce(mockFollowUpResp);

    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
        onAddToNotes={handleAddToNotes}
      />
    );

    const input = screen.getByPlaceholderText(/ask a follow-up regarding telemetry/i);
    fireEvent.change(input, { target: { value: 'Is the differential pressure rising?' } });

    const submitBtn = screen.getByRole('button', { name: /ask gemini/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(mockFollowUpResp.answer)).toBeInTheDocument();
    });

    // Click "Add to Notes" on the AI response
    const noteButtons = screen.getAllByRole('button', { name: /add to notes/i });
    fireEvent.click(noteButtons[noteButtons.length - 1]);

    expect(handleAddToNotes).toHaveBeenCalled();
  });

  it('gracefully handles 429 rate limit errors with informative guidance', async () => {
    vi.spyOn(api, 'askFollowUp').mockRejectedValueOnce(
      new ApiError(429, 'Rate limit exceeded')
    );

    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
      />
    );

    const input = screen.getByPlaceholderText(/ask a follow-up regarding telemetry/i);
    fireEvent.change(input, { target: { value: 'Check upstream pressure' } });
    fireEvent.click(screen.getByRole('button', { name: /ask gemini/i }));

    await waitFor(() => {
      expect(screen.getByText(/gemini api rate limit reached/i)).toBeInTheDocument();
      expect(screen.getByText(/operational triage remains functional/i)).toBeInTheDocument();
    });
  });

  it('renders escalation warning when escalation is recommended', () => {
    render(
      <AIAssistancePanel
        data={mockAIData}
        loading={false}
        error={null}
        contextType="case"
        contextId="case-101"
      />
    );

    expect(screen.getByText(/immediate operational escalation recommended/i)).toBeInTheDocument();
    expect(
      screen.getByText('Potential chilled water loop starvation within 45 minutes.')
    ).toBeInTheDocument();
  });
});
