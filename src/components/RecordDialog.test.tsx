import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RecordDialog } from './RecordDialog';
import { api } from '../lib/api';

vi.mock('../lib/api', () => ({
  api: {
    dryRunRule: vi.fn(),
    proposeRule: vi.fn(),
  },
}));

describe('RecordDialog - Rule Condition Builder & AI Draft', () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders rule condition builder with all condition controls', () => {
    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    expect(screen.getByText('Detection Rule Builder')).toBeInTheDocument();
    expect(screen.getByText('Detection Engine')).toBeInTheDocument();
    expect(screen.getByText('Metric / Field')).toBeInTheDocument();
    expect(screen.getByText('Operator')).toBeInTheDocument();
    expect(screen.getByText('Threshold Value')).toBeInTheDocument();
    expect(screen.getByText('Target Estate Scope')).toBeInTheDocument();
    expect(screen.getByText(/Lifecycle & Explicit Activation Choice/i)).toBeInTheDocument();
    expect(screen.getByText('Dry-Run Evaluation Preview')).toBeInTheDocument();
  });

  it('displays client validation error when metric is blank', async () => {
    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. North Tower Chilled Water Supply Temp Drift');
    fireEvent.change(titleInput, { target: { value: 'Valid Rule Title' } });

    const metricInput = screen.getByPlaceholderText('e.g. supply_air_temp');
    fireEvent.change(metricInput, { target: { value: '   ' } });

    const submitBtn = screen.getByRole('button', { name: /Publish rule/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Metric / telemetry field name is required.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('validates duration window for rolling window engine', async () => {
    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. North Tower Chilled Water Supply Temp Drift');
    fireEvent.change(titleInput, { target: { value: 'Valid Rule Title' } });

    const engineSelect = screen.getByLabelText(/Detection Engine/i);
    fireEvent.change(engineSelect, { target: { value: 'rolling_window' } });

    const durationInput = screen.getByLabelText(/Evaluation Window \(Minutes\)/i);
    fireEvent.change(durationInput, { target: { value: '0' } });

    const submitBtn = screen.getByRole('button', { name: /Publish rule/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Window duration must be a positive integer.')).toBeInTheDocument();
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('runs dry-run preview and displays matching telemetry results', async () => {
    vi.mocked(api.dryRunRule).mockResolvedValueOnce({
      total_events_evaluated: 150,
      matched_count: 3,
      match_rate_pct: 2.0,
      engine: 'threshold',
      definition: {},
      sample_matches: [
        {
          event_id: 'evt-1',
          source: 'sensor.chilled_water_temp',
          occurred_at: '2026-10-11T20:00:00Z',
          matched: true,
          explanation: 'Exceeded threshold 75.0 °C',
          actual_value: 82.5,
        },
      ],
    });

    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const testBtn = screen.getByRole('button', { name: /Test on Live Telemetry/i });
    fireEvent.click(testBtn);

    await waitFor(() => {
      expect(screen.getByText('150')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
      expect(screen.getByText('Exceeded threshold 75.0 °C')).toBeInTheDocument();
    });
  });

  it('supports AI draft flow with human inspection and explicit staging', async () => {
    vi.mocked(api.proposeRule).mockResolvedValueOnce({
      name: 'Turbine Vibration Overdrive Alert',
      key: 'turbine_vibration_spike',
      category: 'Turbine Diagnostics',
      engine: 'threshold',
      definition: {
        metric: 'turbine.vibration.hz',
        operator: '>',
        threshold: 120,
        unit: 'RPM',
      },
      default_severity: 'critical',
      default_priority: 1,
      explanation: 'High vibration frequency indicates bearing misalignment.',
    });

    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const aiPromptInput = screen.getByPlaceholderText(/Alert when Chiller supply temperature exceeds/i);
    fireEvent.change(aiPromptInput, {
      target: { value: 'Alert if turbine vibration exceeds 120 RPM' },
    });

    const generateBtn = screen.getByRole('button', { name: /Propose Rule/i });
    fireEvent.click(generateBtn);

    await waitFor(() => {
      expect(screen.getByDisplayValue('Turbine Vibration Overdrive Alert')).toBeInTheDocument();
      expect(screen.getByDisplayValue('turbine.vibration.hz')).toBeInTheDocument();
      expect(screen.getByDisplayValue('120')).toBeInTheDocument();
      expect(screen.getByText(/High vibration frequency indicates bearing misalignment/i)).toBeInTheDocument();
    });

    // Inspect and submit draft (draft is auto-selected when AI proposes)
    const submitBtn = screen.getByRole('button', { name: /Save as draft/i });
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Turbine Vibration Overdrive Alert',
        stage: 'draft',
        definition: expect.objectContaining({
          metric: 'turbine.vibration.hz',
          operator: '>',
          threshold: 120,
        }),
      })
    );
  });

  it('allows explicit production activation when chosen by operator', async () => {
    render(
      <RecordDialog
        kind="rule"
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    );

    const titleInput = screen.getByPlaceholderText('e.g. North Tower Chilled Water Supply Temp Drift');
    fireEvent.change(titleInput, { target: { value: 'Production Activated Rule' } });

    const activeRadio = screen.getByLabelText(/Explicitly Activate into Production/i);
    fireEvent.click(activeRadio);

    const submitBtn = screen.getByRole('button', { name: /Publish rule/i });
    fireEvent.click(submitBtn);

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'Production Activated Rule',
        stage: 'active',
      })
    );
  });
});
