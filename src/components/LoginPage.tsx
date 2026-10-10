import React, { useState } from 'react';
import { Icon } from './Icon';
import { api, ApiError } from '../lib/api';
import type { AuthUser } from '../types';

interface LoginPageProps {
  onSuccess: (user: AuthUser) => void;
  onNotify: (message: string, tone?: 'success' | 'info') => void;
}

export function LoginPage({ onSuccess, onNotify }: LoginPageProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginOrgSlug, setLoginOrgSlug] = useState('');

  // Register form state
  const [regOrgName, setRegOrgName] = useState('');
  const [regOrgSlug, setRegOrgSlug] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regDisplayName, setRegDisplayName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const fillDemoAdmin = () => {
    setLoginEmail('admin@acme.internal');
    setLoginPassword('AdminPassword123!');
    setLoginOrgSlug('acme-industries');
    setError(null);
    onNotify('Populated seeded Admin credentials (admin@acme.internal)', 'info');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) {
      setError('Please provide your work email and password.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.login({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        org_slug: loginOrgSlug.trim() || undefined,
      });
      onNotify(`Access granted. Welcome back, ${response.user.display_name}!`, 'success');
      onSuccess(response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Unable to authenticate. Verify backend connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOrgName || !regOrgSlug || !regEmail || !regPassword) {
      setError('All organization and administrator credentials are required.');
      return;
    }
    if (regPassword.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await api.register({
        org_name: regOrgName.trim(),
        org_slug: regOrgSlug.trim().toLowerCase(),
        email: regEmail.trim().toLowerCase(),
        password: regPassword,
        display_name: regDisplayName.trim() || regEmail.split('@')[0],
      });
      onNotify(`Organization "${regOrgName}" created successfully!`, 'success');
      onSuccess(response.user);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail);
      } else {
        setError('Registration failed. Check network connectivity.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-wrap">
      <div className="login-box-container">
        {/* Left Side: Brand & Overview (matching sidebar style) */}
        <section className="login-left-brand">
          <div>
            <div className="brand" style={{ padding: '0 0 24px' }}>
              <div className="brand-mark">
                <Icon name="bolt" size={19} />
              </div>
              <b style={{ fontSize: '20px', letterSpacing: '-0.7px' }}>
                Ops<span>Triage</span>
              </b>
            </div>

            <span className="eyebrow" style={{ color: '#818cf8', marginBottom: '8px', display: 'block' }}>
              OPERATIONS PLATFORM
            </span>
            <h1 className="login-hero-heading">Your operation, in sharp focus.</h1>
            <p className="login-hero-desc">
              Explainable triage, live telemetry diagnostics, and real-time SLA risk monitoring.
            </p>

            <div className="login-feature-list">
              <div className="login-feature-item">
                <i className="feature-bullet"><Icon name="check" size={14} /></i>
                <div>
                  <strong>Explainable multi-factor qualification</strong>
                  <small>Mathematical attribution eliminating alert fatigue.</small>
                </div>
              </div>

              <div className="login-feature-item">
                <i className="feature-bullet"><Icon name="activity" size={14} /></i>
                <div>
                  <strong>Predictive fault diagnostics</strong>
                  <small>Automated physics-informed AFDD &amp; Kalman residuals.</small>
                </div>
              </div>

              <div className="login-feature-item">
                <i className="feature-bullet"><Icon name="shield" size={14} /></i>
                <div>
                  <strong>Tenant Row-Level Security</strong>
                  <small>Database session isolation with instant Redis token revocation.</small>
                </div>
              </div>
            </div>
          </div>

          <div className="login-left-footer">
            <span className="live">
              <i />
              <b>Live API Core</b>
              <small>· connected</small>
            </span>
            <small style={{ color: '#818cf8', fontFamily: 'var(--font-mono)', fontSize: '10px' }}>
              v0.1.0 Enterprise
            </small>
          </div>
        </section>

        {/* Right Side: Auth Form Card (matching main dashboard card style) */}
        <section className="login-right-form">
          <div className="login-form-header">
            <div className="segmented" style={{ width: '100%' }}>
              <button
                type="button"
                className={mode === 'login' ? 'is-active' : ''}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  setMode('login');
                  setError(null);
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                className={mode === 'register' ? 'is-active' : ''}
                style={{ flex: 1, textAlign: 'center' }}
                onClick={() => {
                  setMode('register');
                  setError(null);
                }}
              >
                Register Organization
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error-banner" role="alert">
              <Icon name="alert" size={16} />
              <span>{error}</span>
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="login-clean-form">
              <div className="demo-chip-bar">
                <button
                  type="button"
                  className="demo-pill-btn"
                  onClick={fillDemoAdmin}
                  title="Click to auto-fill seeded credentials"
                >
                  <Icon name="bolt" size={13} />
                  <span>Fill Demo Admin (admin@acme.internal)</span>
                </button>
              </div>

              <div className="form-group">
                <label htmlFor="login-email">Work Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="admin@acme.internal"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                  autoFocus
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-password">Password</label>
                <input
                  id="login-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
              </div>

              <div className="form-group">
                <label htmlFor="login-slug">
                  Organization Slug <small style={{ color: '#94a3b8' }}>(Optional)</small>
                </label>
                <input
                  id="login-slug"
                  type="text"
                  placeholder="acme-industries"
                  value={loginOrgSlug}
                  onChange={(e) => setLoginOrgSlug(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="button primary"
                style={{ width: '100%', height: '42px', marginTop: '12px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="refresh" size={15} /> Authenticating...
                  </>
                ) : (
                  <>
                    <Icon name="arrow-up-right" size={15} /> Sign In to Command Center
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="login-clean-form">
              <div className="form-group">
                <label htmlFor="reg-org-name">Organization Name</label>
                <input
                  id="reg-org-name"
                  type="text"
                  placeholder="Acme Facilities"
                  value={regOrgName}
                  onChange={(e) => {
                    setRegOrgName(e.target.value);
                    if (!regOrgSlug) {
                      setRegOrgSlug(
                        e.target.value
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/^-|-$/g, '')
                      );
                    }
                  }}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-org-slug">Organization Slug</label>
                <input
                  id="reg-org-slug"
                  type="text"
                  placeholder="acme-facilities"
                  value={regOrgSlug}
                  onChange={(e) => setRegOrgSlug(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-display-name">Full Name</label>
                <input
                  id="reg-display-name"
                  type="text"
                  placeholder="Lead Triage Engineer"
                  value={regDisplayName}
                  onChange={(e) => setRegDisplayName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-email">Work Email</label>
                <input
                  id="reg-email"
                  type="email"
                  placeholder="admin@acme.internal"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>

              <div className="form-group">
                <label htmlFor="reg-password">Password (min 8 characters)</label>
                <input
                  id="reg-password"
                  type="password"
                  placeholder="••••••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>

              <button
                type="submit"
                className="button primary"
                style={{ width: '100%', height: '42px', marginTop: '12px' }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Icon name="refresh" size={15} /> Provisioning Organization...
                  </>
                ) : (
                  <>
                    <Icon name="check" size={15} /> Register &amp; Sign In
                  </>
                )}
              </button>
            </form>
          )}

          <footer className="login-clean-footer">
            <span>PostgreSQL Row-Level Security · Bcrypt Work Factor 12 · Redis Revocation</span>
          </footer>
        </section>
      </div>
    </div>
  );
}
