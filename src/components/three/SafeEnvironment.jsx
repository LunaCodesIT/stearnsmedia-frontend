import { Component, Suspense } from 'react';
import { Environment } from '@react-three/drei';

// drei's <Environment> fetches an HDR from a CDN at runtime. Isolated in its
// own Suspense + error boundary so a slow or failed fetch never delays or
// crashes the canvas it lights — the scene's direct lights carry the look
// until (or without) the IBL.
class EnvBoundary extends Component {
  state = { crashed: false };
  static getDerivedStateFromError() {
    return { crashed: true };
  }
  componentDidCatch(e) {
    console.warn('[SafeEnvironment] environment HDR failed (non-fatal):', e.message);
  }
  render() {
    return this.state.crashed ? null : this.props.children;
  }
}

export function SafeEnvironment({ preset = 'city' }) {
  return (
    <EnvBoundary>
      <Suspense fallback={null}>
        <Environment preset={preset} />
      </Suspense>
    </EnvBoundary>
  );
}
