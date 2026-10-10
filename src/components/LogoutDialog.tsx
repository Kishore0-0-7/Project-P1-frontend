import { useEffect } from 'react';
import { Icon } from './Icon';
import type { AuthUser } from '../types';

interface LogoutDialogProps {
  user: AuthUser;
  onClose: () => void;
  onConfirm: () => void;
}

function getInitials(name?: string): string {
  if (!name) return '??';
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function LogoutDialog({ user, onClose, onConfirm }: LogoutDialogProps) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="logout-modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        className="logout-modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-dialog-title"
      >
        <header className="logout-modal-header">
          <div className="logout-badge-icon">
            <Icon name="log-out" size={20} />
          </div>
          <button
            type="button"
            className="logout-close-btn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" size={16} />
          </button>
        </header>

        <div className="logout-modal-content">
          <span className="logout-eyebrow">Security &amp; Session</span>
          <h2 id="logout-dialog-title" className="logout-title">
            Sign out of OpsTriage?
          </h2>
          <p className="logout-description">
            You will be returned to the secure login screen and your active session
            token will be invalidated. Any unsaved inspector views will be reset.
          </p>

          <div className="logout-user-preview">
            <div className="logout-user-avatar">
              {getInitials(user.display_name)}
            </div>
            <div className="logout-user-info">
              <div className="logout-user-primary">
                <b>{user.display_name || 'Active User'}</b>
                <span className="logout-user-email">({user.email || 'user@opstriage.io'})</span>
              </div>
              <div className="logout-user-meta">
                <span>Role: <strong>{user.role || 'Member'}</strong></span>
                <span className="logout-meta-dot">·</span>
                <span>Tenant: <code>{user.org_id ? user.org_id.slice(0, 8) + '…' : 'Global'}</code></span>
              </div>
            </div>
            <div className="logout-session-tag">
              <span className="logout-pulse" />
              Active
            </div>
          </div>
        </div>

        <footer className="logout-modal-footer">
          <button
            type="button"
            className="logout-btn-cancel"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="logout-btn-confirm"
            onClick={onConfirm}
          >
            <Icon name="log-out" size={15} />
            Sign Out
          </button>
        </footer>
      </section>
    </div>
  );
}
