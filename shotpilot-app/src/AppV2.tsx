import React, { useEffect, useState } from 'react';
import { Workbench } from './components/v2/Workbench';

// Minimal header for v2
const Header: React.FC = () => (
  <div style={{
    height: '48px', display: 'flex', alignItems: 'center',
    padding: '0 20px', borderBottom: '1px solid #1a1a1e',
    backgroundColor: '#09090b', flexShrink: 0,
  }}>
    <span style={{ fontSize: '16px', fontWeight: 800, color: '#e4e4e7', letterSpacing: '-0.02em' }}>
      Shot<span style={{ color: '#8b5cf6' }}>Pilot</span>
    </span>
    <span style={{ fontSize: '11px', color: '#52525b', marginLeft: '8px', fontWeight: 600 }}>v2</span>
  </div>
);

// Error boundary
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          height: '100vh', width: '100vw', display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          backgroundColor: '#09090b', color: '#ef4444',
          flexDirection: 'column', gap: '16px',
        }}>
          <div style={{ fontSize: '18px', fontWeight: 700 }}>Something went wrong</div>
          <div style={{ color: '#71717a', fontSize: '13px' }}>{this.state.error?.message}</div>
          <button
            onClick={() => { this.setState({ hasError: false, error: null }); window.location.reload(); }}
            style={{
              padding: '8px 20px', backgroundColor: '#8b5cf6', color: 'white',
              border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
            }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

let loginInProgress = false;

const AppV2: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    if (loginInProgress) return;
    loginInProgress = true;

    fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@shotpilot.com', password: 'testpassword123' }),
    })
      .then(r => { if (r.ok) setAuthed(true); })
      .catch(() => {})
      .finally(() => { setReady(true); loginInProgress = false; });
  }, []);

  if (!ready) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#09090b', color: '#71717a' }}>
        Loading ShotPilot...
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div style={{
        display: 'flex', flexDirection: 'column',
        height: '100vh', width: '100vw',
        backgroundColor: '#09090b', overflow: 'hidden',
      }}>
        <Header />
        <main style={{ flex: 1, overflow: 'hidden' }}>
          <Workbench />
        </main>
      </div>
    </ErrorBoundary>
  );
};

export default AppV2;
