import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HelpMenu } from './HelpMenu';
import { ContextualHelp } from './ContextualHelp';
import type { PageId } from '../types';

describe('HelpMenu Component', () => {
  it('opens help menu and displays all 4 task guides plus tour replay', () => {
    const handleStartTour = vi.fn();
    const handleNavigate = vi.fn();

    render(<HelpMenu onStartTour={handleStartTour} onNavigate={handleNavigate} />);

    // Toggle menu
    const menuBtn = screen.getByRole('button', { name: /help & guides/i });
    fireEvent.click(menuBtn);

    // Verify task guides are shown
    expect(screen.getByText('Investigate an Alert')).toBeInTheDocument();
    expect(screen.getByText('Assign & Resolve a Case')).toBeInTheDocument();
    expect(screen.getByText('Connect a Monitoring Integration')).toBeInTheDocument();
    expect(screen.getByText('Understand Dashboard & SLA Metrics')).toBeInTheDocument();

    // Verify replay tour button is available
    const replayBtn = screen.getByRole('menuitem', { name: /replay platform tour/i });
    expect(replayBtn).toBeInTheDocument();
    fireEvent.click(replayBtn);
    expect(handleStartTour).toHaveBeenCalledTimes(1);
  });

  it('opens a guide modal with clear step-by-step instructions matching real workflow', () => {
    const handleStartTour = vi.fn();
    const handleNavigate = vi.fn();

    render(<HelpMenu onStartTour={handleStartTour} onNavigate={handleNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /help & guides/i }));
    fireEvent.click(screen.getByText('Investigate an Alert'));

    // Modal should display guide content
    expect(screen.getByText(/how to inspect a detected equipment or service anomaly/i)).toBeInTheDocument();
    expect(screen.getByText('Open Signal Intelligence')).toBeInTheDocument();

    // Navigate to section
    const goBtn = screen.getByRole('button', { name: /go to signal intelligence/i });
    fireEvent.click(goBtn);
    expect(handleNavigate).toHaveBeenCalledWith('findings');
  });

  it('shows the guide for the current page and highlights its matching section', () => {
    const page: PageId = 'reports';
    render(<HelpMenu page={page} onStartTour={vi.fn()} onNavigate={vi.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /help & guides/i }));
    expect(screen.getByText('Read Reliability Insights')).toBeInTheDocument();
    expect(screen.queryByText('Investigate an Alert')).not.toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /read reliability insights/i })).toHaveAttribute('aria-current', 'page');
  });
});

describe('ContextualHelp Component', () => {
  it('renders a plain-English explanation for SRE terminology with expandable technical details', () => {
    render(<ContextualHelp topic="priority" label="Explain Priorities" />);

    // Click help trigger
    const helpBtn = screen.getByRole('button', { name: /learn more about priority levels/i });
    fireEvent.click(helpBtn);

    // Modal should display plain English definition
    expect(screen.getByText('Priority Levels (P1 – P5)')).toBeInTheDocument();
    expect(screen.getByText(/P1 means an active outage or critical environmental hazard/i)).toBeInTheDocument();

    // Expand technical calculation
    const expandBtn = screen.getByRole('button', { name: /technical details & formula/i });
    fireEvent.click(expandBtn);
    expect(screen.getByText(/Calculated via: \(Impact × 0.45\) \+ \(Urgency × 0.35\)/i)).toBeInTheDocument();

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /close explanation/i }));
    expect(screen.queryByText('Priority Levels (P1 – P5)')).not.toBeInTheDocument();
  });

  it('explains Business Criticality vs Operational Risk', () => {
    render(<ContextualHelp topic="criticality_vs_risk" />);

    const helpBtn = screen.getByTitle('Click to understand Business Criticality vs. Operational Risk');
    fireEvent.click(helpBtn);

    expect(screen.getByText('Business Criticality vs. Operational Risk')).toBeInTheDocument();
    expect(screen.getByText(/Criticality is how essential the asset is all year round/i)).toBeInTheDocument();
    expect(screen.getByText(/Operational Risk is how dangerous the asset’s current condition is right now/i)).toBeInTheDocument();
  });

  it('explains Ingestion Latency', () => {
    render(<ContextualHelp topic="ingestion_latency" />);
    fireEvent.click(screen.getByTitle('Click to understand Ingestion Pipeline Latency'));
    expect(screen.getByText(/The time taken \(in milliseconds\) from when external equipment sends a sensor reading/i)).toBeInTheDocument();
  });

  it('explains AFDD metrics with plain language', () => {
    render(<ContextualHelp topic="afdd_metrics" />);
    fireEvent.click(screen.getByTitle('Click to understand AFDD Precision, Recall & F1'));
    expect(screen.getByText('AFDD Precision, Recall & F1')).toBeInTheDocument();
    expect(screen.getByText(/Precision: when an alarm sounds, what percentage of the time is it a real issue/i)).toBeInTheDocument();
  });

  it('explains Live, Imported, and Synthetic/Demo data provenance', () => {
    render(<ContextualHelp topic="data_provenance" />);
    fireEvent.click(screen.getByTitle('Click to understand Live vs. Imported vs. Synthetic Data'));

    expect(screen.getByText('Live vs. Imported vs. Synthetic Data')).toBeInTheDocument();
    expect(screen.getByText(/Live Bridge: real-time streaming telemetry/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo\/Imported: historical operational snapshots/i)).toBeInTheDocument();
  });
});
