import { Component, Suspense } from 'react';
import { Environment } from '@react-three/drei';

// Environment lighting from a SELF-HOSTED HDR (public/hdr/city.hdr) — drei's
// presets fetch from a third-party CDN at runtime, which proved flaky in
// production (models rendered differently or slowly when the CDN stalled).
// Still isolated in Suspense + an error boundary so even a local hiccup never
// delays or crashes the canvas — the direct lights carry the look without it.
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

export function SafeEnvironment() {
  return (
    <EnvBoundary>
      <Suspense fallback={null}>
        <Environment files="/hdr/city.hdr" />
      </Suspense>
    </EnvBoundary>
  );
}
