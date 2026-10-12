import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlatformTour } from './PlatformTour';

describe('PlatformTour Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the first step (Command Center) on initial run', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    render(<PlatformTour isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);

    expect(screen.getByText('What Needs Attention First')).toBeInTheDocument();
    expect(screen.getByText(/STEP 1 OF 10/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next: inspect signals/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /skip tour/i })).toBeInTheDocument();
  });

  it('navigates through all 10 pages using Next and Back buttons', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    render(<PlatformTour isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);

    // Step 1 -> 2: Signal Intelligence
    fireEvent.click(screen.getByRole('button', { name: /next: inspect signals/i }));
    expect(screen.getByText('How to Inspect an Alert')).toBeInTheDocument();
    expect(screen.getByText(/STEP 2 OF 10/i)).toBeInTheDocument();
    expect(handleNavigate).toHaveBeenCalledWith('findings');

    // Step 2 -> 3: Casework
    fireEvent.click(screen.getByRole('button', { name: /next: manage casework/i }));
    expect(screen.getByText('Assign, Investigate, and Resolve')).toBeInTheDocument();
    expect(screen.getByText(/STEP 3 OF 10/i)).toBeInTheDocument();
    expect(handleNavigate).toHaveBeenCalledWith('cases');

    // Step 3 -> Back -> Step 2
    fireEvent.click(screen.getByRole('button', { name: /back/i }));
    expect(screen.getByText('How to Inspect an Alert')).toBeInTheDocument();

    // Step 2 -> 3 -> 4: Integrations
    fireEvent.click(screen.getByRole('button', { name: /next: manage casework/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: telemetry integrations/i }));
    expect(screen.getByText('How Data Enters the System')).toBeInTheDocument();
    expect(screen.getByText(/STEP 4 OF 10/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next: assets/i }));
    expect(screen.getByText('Review Asset Health')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next: source incidents/i }));
    expect(screen.getByText('Trace Incidents to Signals')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /next: rules/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: insights/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: ingestion health/i }));
    fireEvent.click(screen.getByRole('button', { name: /next: settings/i }));
    expect(screen.getByRole('button', { name: /finish tour/i })).toBeInTheDocument();
    expect(handleNavigate).toHaveBeenCalledWith('integrations');
  });

  it('marks tour completed in localStorage when finished', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    render(<PlatformTour isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);

    // Advance through all 10 steps.
    for (let index = 0; index < 9; index += 1) fireEvent.keyDown(window, { key: 'ArrowRight' });

    fireEvent.click(screen.getByRole('button', { name: /finish tour/i }));
    expect(localStorage.getItem('opstriage.tour_completed')).toBe('true');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('marks tour completed in localStorage and closes when Skip is clicked', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    render(<PlatformTour isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: /skip tour/i }));
    expect(localStorage.getItem('opstriage.tour_completed')).toBe('true');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('supports keyboard navigation (Escape to skip, Arrow keys for step navigation)', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    render(<PlatformTour isOpen={true} onClose={handleClose} onNavigate={handleNavigate} />);

    // ArrowRight advances to step 2
    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(screen.getByText('How to Inspect an Alert')).toBeInTheDocument();

    // ArrowLeft goes back to step 1
    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(screen.getByText('What Needs Attention First')).toBeInTheDocument();

    // Escape exits and skips
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(localStorage.getItem('opstriage.tour_completed')).toBe('true');
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders target-aware spotlight badge and allows opening Help guidance', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    const handleOpenHelp = vi.fn();
    render(
      <PlatformTour
        isOpen={true}
        onClose={handleClose}
        onNavigate={handleNavigate}
        onOpenHelp={handleOpenHelp}
      />
    );

    // Verify spotlight badge displays active target view
    expect(screen.getByText(/🎯 Spotlight:/i)).toBeInTheDocument();
    expect(document.querySelector('.tour-spotlight-badge')).toHaveTextContent('Command Center');

    // Verify help guidance exists
    expect(screen.getByText(/help guidance:/i)).toBeInTheDocument();
    const viewGuideBtn = screen.getByRole('button', { name: /view guide/i });
    expect(viewGuideBtn).toBeInTheDocument();
    fireEvent.click(viewGuideBtn);
    expect(handleOpenHelp).toHaveBeenCalledWith('priority');
  });

  it('shows the current page and lets the operator focus on it while keeping the tour available', () => {
    render(<PlatformTour isOpen={true} onClose={vi.fn()} onNavigate={vi.fn()} />);

    expect(screen.getByText(/you are viewing/i)).toHaveTextContent('Command Center');
    expect(document.querySelector('.tour-overlay')).toHaveAttribute('data-focus-page', 'true');
    const focusButton = screen.getByRole('button', { name: /return to tour/i });
    fireEvent.click(focusButton);
    expect(document.querySelector('.tour-overlay')).not.toHaveAttribute('data-focus-page');
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    fireEvent.click(screen.getByRole('button', { name: /focus on this page/i }));
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'false');
    expect(document.querySelector('.tour-overlay')).toHaveAttribute('data-focus-page', 'true');
  });

  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn();
    const handleNavigate = vi.fn();
    const { container } = render(<PlatformTour isOpen={false} onClose={handleClose} onNavigate={handleNavigate} />);
    expect(container.firstChild).toBeNull();
  });
});
